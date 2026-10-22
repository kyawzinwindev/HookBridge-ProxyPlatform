import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { getRedis } from "../src/lib/redis.js";
import { webhookQueue } from "../src/queues/webhook.queue.js";

const emit = vi.fn();
const io = { to: vi.fn(() => ({ emit })) } as never;
const app = createApp(io, "http://localhost:3001");

let endpointId: string;

function post(id: string, body: unknown, headers: Record<string, string> = {}) {
  return app.request(`/in/${id}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  const endpoint = await prisma.endpoint.create({
    data: {
      name: "vitest-endpoint",
      secretKey: `test-${randomUUID()}`,
      targetUrl: "http://localhost:9999/hook",
    },
  });
  endpointId = endpoint.id;
});

afterAll(async () => {
  // Cascade removes the endpoint's events; also clear its dedup keys and queued jobs.
  await prisma.endpoint.delete({ where: { id: endpointId } }).catch(() => undefined);
  const redis = getRedis();
  const keys = await redis.keys(`dedup:${endpointId}:*`);
  if (keys.length) await redis.del(...keys);
  await webhookQueue.obliterate({ force: true }).catch(() => undefined);
  await webhookQueue.close();
  await prisma.$disconnect();
  redis.disconnect();
});

describe("POST /in/:endpointId", () => {
  it("ingests a unique event and persists it as PENDING", async () => {
    const eventId = `evt-${randomUUID()}`;
    const res = await post(endpointId, { hello: "world" }, { "x-event-id": eventId });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: "received", endpointId });

    const row = await prisma.webhookEvent.findUnique({ where: { id: json.id } });
    expect(row).not.toBeNull();
    expect(row?.status).toBe("PENDING");
    expect(row?.externalId).toBe(eventId);
    expect(row?.source).toBe("generic");
    expect(emit).toHaveBeenCalledWith("webhook:received", expect.objectContaining({ id: json.id }));
  });

  it("ignores an exact duplicate via Redis deduplication", async () => {
    const eventId = `evt-${randomUUID()}`;
    const first = await post(endpointId, { a: 1 }, { "x-event-id": eventId });
    expect((await first.json()).status).toBe("received");

    const second = await post(endpointId, { a: 1 }, { "x-event-id": eventId });
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({
      status: "ignored",
      reason: "duplicate_event",
      eventKey: eventId,
    });

    expect(await prisma.webhookEvent.count({ where: { externalId: eventId } })).toBe(1);
  });

  it("falls back to SHA-256 payload hashing when no event id exists", async () => {
    const payload = { nonce: randomUUID(), amount: 42 }; // no id / event_id / eventId

    const first = await post(endpointId, payload);
    const firstJson = await first.json();
    expect(firstJson.status).toBe("received");

    const second = await post(endpointId, payload);
    const secondJson = await second.json();
    expect(secondJson).toMatchObject({ status: "ignored", reason: "duplicate_event" });
    expect(secondJson.eventKey).toMatch(/^sha256:[0-9a-f]{64}$/);

    expect(await prisma.webhookEvent.count({ where: { externalId: secondJson.eventKey } })).toBe(1);
  });

  it("returns 404 for a non-existent endpoint", async () => {
    const res = await post("invalid-endpoint-id", { x: 1 });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Endpoint not found" });
  });
});
