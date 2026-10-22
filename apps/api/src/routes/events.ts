import { Hono } from "hono";
import type { DeliveryLog, EndpointInfo, EventStatus, JsonValue, WebhookEventDetail } from "@hookbridge/types";
import { prisma } from "../lib/prisma.js";

const EVENT_LIMIT = 50;

/** Read-only REST API consumed by the dashboard. Mounted under `/api`. */
export function createEventsRouter() {
  const router = new Hono();

  router.get("/endpoints/:endpointId", async (c) => {
    const endpoint = await prisma.endpoint.findUnique({ where: { id: c.req.param("endpointId") } });
    if (!endpoint) return c.json({ error: "Endpoint not found" }, 404);

    const body: EndpointInfo = {
      id: endpoint.id,
      name: endpoint.name,
      targetUrl: endpoint.targetUrl,
      secretKey: endpoint.secretKey,
      createdAt: endpoint.createdAt.toISOString(),
    };
    return c.json(body);
  });

  router.get("/endpoints/:endpointId/events", async (c) => {
    const endpointId = c.req.param("endpointId");

    const endpoint = await prisma.endpoint.findUnique({ where: { id: endpointId }, select: { id: true } });
    if (!endpoint) return c.json({ error: "Endpoint not found" }, 404);

    const rows = await prisma.webhookEvent.findMany({
      where: { endpointId },
      orderBy: { createdAt: "desc" },
      take: EVENT_LIMIT,
      include: { logs: { orderBy: { createdAt: "desc" } } },
    });

    // Method/path aren't persisted; every stored event arrived via POST /in/:endpointId.
    const events: WebhookEventDetail[] = rows.map((row) => ({
      id: row.id,
      endpointId: row.endpointId,
      source: row.source,
      externalId: row.externalId,
      method: "POST",
      path: `/in/${row.endpointId}`,
      headers: row.headers as Record<string, string>,
      payload: row.payload as JsonValue,
      status: row.status as EventStatus,
      createdAt: row.createdAt.toISOString(),
      logs: row.logs.map(
        (log): DeliveryLog => ({
          id: log.id,
          eventId: log.eventId,
          destination: log.destination,
          statusCode: log.statusCode,
          latencyMs: log.latencyMs,
          responseBody: log.responseBody,
          createdAt: log.createdAt.toISOString(),
        }),
      ),
    }));

    return c.json(events);
  });

  return router;
}
