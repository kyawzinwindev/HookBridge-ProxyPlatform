export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type EventStatus = "PENDING" | "RECEIVED" | "QUEUED" | "DELIVERED" | "FAILED" | "DUPLICATE";

/** An inbound webhook as ingested by the hub. */
export interface WebhookEventPayload {
  id: string;
  endpointId: string;
  source: string;
  externalId: string | null;
  method: string;
  path: string;
  headers: Record<string, string>;
  payload: JsonValue;
  status: EventStatus;
  createdAt: string;
}

/** The outcome of a single delivery attempt to a destination. */
export interface DeliveryLog {
  id: string;
  eventId: string;
  destination: string;
  statusCode: number | null;
  latencyMs: number | null;
  responseBody: string | null;
  createdAt: string;
}

/** Message relayed over Socket.io from the hub to a local tunnel agent (and back). */
export interface TunnelRelayMessage {
  eventId: string;
  endpointId: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: JsonValue;
  /** Local URL the CLI should forward this request to. */
  targetUrl: string;
  receivedAt: string;
}

export interface TunnelRelayResponse {
  eventId: string;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  latencyMs: number;
}
