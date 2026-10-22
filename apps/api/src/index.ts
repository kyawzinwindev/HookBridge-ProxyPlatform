import "dotenv/config";
import { createServer } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 4000);
// CORS_ORIGIN may be a comma-separated list; the local dashboard ports are always allowed.
const CORS_ORIGINS = [
  ...new Set([
    ...(process.env.CORS_ORIGIN ?? "http://localhost:3001").split(",").map((o) => o.trim()).filter(Boolean),
    "http://localhost:3000",
    "http://localhost:3001",
  ]),
];

// The Socket.io server needs the HTTP server, and the app needs io, so create them in this order.
let handler: (req: Request) => Response | Promise<Response> = () => new Response("starting", { status: 503 });
const httpServer = createServer(getRequestListener((req) => handler(req)));

const io = new SocketIOServer(httpServer, {
  cors: { origin: CORS_ORIGINS, credentials: true },
});

const app = createApp(io, CORS_ORIGINS);
handler = app.fetch;

io.on("connection", (socket) => {
  console.log(`[socket] connected ${socket.id}`);
  // Clients subscribe to an endpoint's room to receive live "webhook:received" events.
  socket.on("subscribe", (endpointId: unknown) => {
    if (typeof endpointId === "string") void socket.join(endpointId);
  });
  socket.on("disconnect", () => console.log(`[socket] disconnected ${socket.id}`));
});

httpServer.listen(PORT, () => {
  console.log(`HookBridge API listening on http://localhost:${PORT}`);
});

export { app, io };
