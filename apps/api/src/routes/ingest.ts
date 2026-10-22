import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import type { Prisma } from "@prisma/client";
import type { Broadcaster } from "../app.js";
import type { JsonValue, WebhookEventPayload } from "@hookbridge/types";
import { prisma } from "../lib/prisma.js";
import { detectSource, extractEventKey, isDuplicate, releaseDedupKey } from "../services/dedup.service.js";
import { enqueueWebhookJob } from "../queues/webhook.queue.js";

/** Parses the raw body as JSON; non-JSON bodies are preserved as `{ raw: "<text>" }`. */
function parseBody(rawBody: string): JsonValue {
  if (rawBody.length === 0) return {};
  try {
    return JSON.parse(rawBody) as JsonValue;
  } catch {
    return { raw: rawBody };
  }
}

export function createIngestRouter(io: Broadcaster) {
  const ingest = new Hono();

  ingest.post("/:endpointId", async (c) => {
    const endpointId = c.req.param("endpointId");

    const endpoint = await prisma.endpoint.findUnique({
      where: { id: endpointId },
      select: { id: true },
    });
    if (!endpoint) return c.json({ error: "Endpoint not found" }, 404);

    const rawBody = await c.req.text();
    const headers = c.req.header();
    const body = parseBody(rawBody);

    const eventKey = extractEventKey(headers, body, rawBody);

    if (await isDuplicate(endpoint.id, eventKey)) {
      return c.json({ status: "ignored", reason: "duplicate_event", eventKey }, 200);
    }

    const id = randomUUID();
    const source = detectSource(headers);

    let createdAt: Date;
    try {
      const row = await prisma.webhookEvent.create({
        data: {
          id,
          endpointId: endpoint.id,
          source,
          externalId: eventKey,
          headers: headers as Prisma.InputJsonValue,
          payload: body as Prisma.InputJsonValue,
          status: "PENDING",
        },
        select: { createdAt: true },
      });
      createdAt = row.createdAt;
    } catch (err) {
      // Free the dedup slot so the provider's retry isn't wrongly dropped.
      await releaseDedupKey(endpoint.id, eventKey).catch(() => undefined);
      console.error("[ingest] failed to persist event:", err);
      return c.json({ error: "Failed to persist event" }, 500);
    }

    const event: WebhookEventPayload = {
      id,
      endpointId: endpoint.id,
      source,
      externalId: eventKey,
      method: c.req.method,
      path: c.req.path,
      headers,
      payload: body,
      status: "PENDING",
      createdAt: createdAt.toISOString(),
    };

    // Fire-and-forget: never block the provider's response on the queue or sockets.
    void enqueueWebhookJob(event).catch(async (err) => {
      console.error(`[ingest] enqueue failed for ${id}:`, err);
      await prisma.webhookEvent
        .update({ where: { id }, data: { status: "FAILED" } })
        .catch(() => undefined);
    });

    io.to(endpoint.id).emit("webhook:received", event);

    return c.json(
      {
        status: "received",
        id,
        endpointId: endpoint.id,
        timestamp: new Date().toISOString(),
      },
      200,
    );
  });

  return ingest;
}
