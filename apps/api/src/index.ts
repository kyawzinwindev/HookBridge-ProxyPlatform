import "dotenv/config";
import { createServer } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Server as SocketIOServer } from "socket.io";

const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3001";

const app = new Hono();

app.use("*", cors({ origin: CORS_ORIGIN }));

app.get("/health", (c) =>
  c.json({ status: "ok", service: "hookbridge-api", uptime: process.uptime() }),
);

// Hono handles HTTP; Socket.io shares the same underlying Node server.
const httpServer = createServer(getRequestListener(app.fetch));

const io = new SocketIOServer(httpServer, {
  cors: { origin: CORS_ORIGIN },
});

io.on("connection", (socket) => {
  console.log(`[socket] connected ${socket.id}`);
  socket.on("disconnect", () => console.log(`[socket] disconnected ${socket.id}`));
});

httpServer.listen(PORT, () => {
  console.log(`HookBridge API listening on http://localhost:${PORT}`);
});

export { app, io };
