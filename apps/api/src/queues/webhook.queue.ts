import { Queue } from "bullmq";
import type { WebhookEventPayload } from "@hookbridge/types";
import { getRedis } from "../lib/redis.js";

export const WEBHOOK_QUEUE_NAME = "webhook-delivery";

export const webhookQueue = new Queue<WebhookEventPayload>(WEBHOOK_QUEUE_NAME, {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  },
});

/** Adds an event to the delivery queue. Uses the event id as job id so re-enqueues are idempotent. */
export async function enqueueWebhookJob(eventData: WebhookEventPayload): Promise<void> {
  await webhookQueue.add("deliver", eventData, { jobId: eventData.id });
}
