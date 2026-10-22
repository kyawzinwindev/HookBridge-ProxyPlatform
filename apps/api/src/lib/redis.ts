import { Redis } from "ioredis";

let client: Redis | null = null;

/** Returns a single shared Redis connection (lazily created and cached). */
export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      // Required by BullMQ; also avoids commands failing during brief reconnects.
      maxRetriesPerRequest: null,
    });
    client.on("error", (err) => console.error("[redis] error:", err.message));
  }
  return client;
}
