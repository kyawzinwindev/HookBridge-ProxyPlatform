import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Server as SocketIOServer } from "socket.io";
import { prisma } from "./lib/prisma.js";
import { getRedis } from "./lib/redis.js";
import { createEventsRouter } from "./routes/events.js";
import { createIngestRouter } from "./routes/ingest.js";

/** Minimal surface of Socket.io the app needs; lets tests inject a stub. */
export type Broadcaster = Pick<SocketIOServer, "to">;

const withTimeout = <T>(p: Promise<T>, ms = 2000): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

/** Builds the Hono app without binding a port, so it can be imported by tests. */
export function createApp(io: Broadcaster, corsOrigin: string | string[]) {
  const app = new Hono();

  // Webhook providers call /in/* server-to-server, so they must not be restricted by CORS.
  app.use("/in/*", cors({ origin: "*" }));
  app.use("*", cors({ origin: corsOrigin, credentials: true, allowHeaders: ["Content-Type", "Authorization"] }));

  app.get("/health", async (c) => {
    const [redis, db] = await Promise.all([
      withTimeout(getRedis().ping()).then(
        () => "up" as const,
        () => "down" as const,
      ),
      withTimeout(prisma.$queryRaw`SELECT 1`).then(
        () => "up" as const,
        () => "down" as const,
      ),
    ]);
    const ok = redis === "up" && db === "up";
    return c.json(
      { status: ok ? "ok" : "degraded", service: "hookbridge-api", uptime: process.uptime(), redis, db },
      ok ? 200 : 503,
    );
  });

  // Ingestion: POST /in/:endpointId
  app.route("/in", createIngestRouter(io));

  // Dashboard REST API: GET /api/endpoints/:id and /api/endpoints/:id/events
  app.route("/api", createEventsRouter());

  return app;
}
