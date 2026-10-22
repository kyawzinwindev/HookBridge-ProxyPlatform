import { createHash } from "node:crypto";
import { getRedis } from "../lib/redis.js";

const DEFAULT_TTL_SECONDS = 86_400;

const dedupKey = (endpointId: string, eventKey: string) => `dedup:${endpointId}:${eventKey}`;

/**
 * Atomically claims `eventKey` for the endpoint using SET NX EX.
 * Returns true if the key already existed (duplicate), false if newly claimed.
 */
export async function isDuplicate(
  endpointId: string,
  eventKey: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<boolean> {
  const result = await getRedis().set(dedupKey(endpointId, eventKey), "1", "EX", ttlSeconds, "NX");
  return result === null;
}

/** Releases a claimed key (used when persisting the event failed, so provider retries aren't dropped). */
export async function releaseDedupKey(endpointId: string, eventKey: string): Promise<void> {
  await getRedis().del(dedupKey(endpointId, eventKey));
}

// Provider-supplied delivery IDs. Header names must be lowercase.
const ID_HEADERS = ["x-github-delivery", "x-event-id", "idempotency-key"] as const;
const BODY_ID_FIELDS = ["id", "event_id", "eventId"] as const;

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number") return String(value);
  return null;
}

/**
 * Derives a stable key identifying a webhook delivery.
 * Order: provider headers -> common body id fields -> stripe-signature -> SHA-256 of raw body.
 *
 * `stripe-signature` is checked after body ids because it embeds a timestamp and changes
 * on every retry, whereas Stripe's `body.id` (evt_...) is stable across retries.
 */
export function extractEventKey(
  headers: Record<string, string | undefined>,
  body: unknown,
  rawBody: string = JSON.stringify(body ?? null),
): string {
  const lower: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = v;

  for (const name of ID_HEADERS) {
    const v = pickString(lower[name]);
    if (v) return v;
  }

  if (body && typeof body === "object" && !Array.isArray(body)) {
    for (const field of BODY_ID_FIELDS) {
      const v = pickString((body as Record<string, unknown>)[field]);
      if (v) return v;
    }
  }

  const sig = pickString(lower["stripe-signature"]);
  if (sig) return sig;

  return `sha256:${createHash("sha256").update(rawBody).digest("hex")}`;
}

/** Best-effort provider detection from request headers. */
export function detectSource(headers: Record<string, string>): string {
  const names = new Set(Object.keys(headers).map((h) => h.toLowerCase()));
  if (names.has("stripe-signature")) return "stripe";
  if (names.has("x-github-event") || names.has("x-github-delivery")) return "github";
  return "generic";
}
