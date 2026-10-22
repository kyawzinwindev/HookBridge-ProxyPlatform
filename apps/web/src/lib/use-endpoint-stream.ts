"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { EndpointInfo, WebhookEventDetail, WebhookEventPayload } from "@hookbridge/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const DEFAULT_ENDPOINT_ID = "ep_dev_test_123";

interface StreamState {
  endpoint: EndpointInfo | null;
  events: WebhookEventDetail[];
  loading: boolean;
  error: string | null;
  connected: boolean;
}

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/**
 * Loads an endpoint and its latest events, then keeps the list live by prepending
 * every `webhook:received` Socket.io event for that endpoint.
 */
export function useEndpointStream(endpointId: string | null): StreamState {
  const [state, setState] = useState<StreamState>({
    endpoint: null,
    events: [],
    loading: true,
    error: null,
    connected: false,
  });

  useEffect(() => {
    if (!endpointId) return;

    const controller = new AbortController();
    setState({ endpoint: null, events: [], loading: true, error: null, connected: false });

    const id = encodeURIComponent(endpointId);
    const socket = io(API_URL, { transports: ["websocket", "polling"] });

    // Subscribe before fetching so nothing arriving during the fetch is missed.
    socket.on("connect", () => {
      socket.emit("subscribe", endpointId);
      setState((s) => ({ ...s, connected: true }));
    });
    socket.on("disconnect", () => setState((s) => ({ ...s, connected: false })));

    socket.on("webhook:received", (incoming: WebhookEventPayload) => {
      const event: WebhookEventDetail = { ...incoming, logs: [] };
      setState((s) =>
        s.events.some((e) => e.id === event.id) ? s : { ...s, events: [event, ...s.events] },
      );
    });

    Promise.all([
      getJson<EndpointInfo>(`/api/endpoints/${id}`, controller.signal),
      getJson<WebhookEventDetail[]>(`/api/endpoints/${id}/events`, controller.signal),
    ])
      .then(([endpoint, fetched]) => {
        setState((s) => {
          // Merge: keep socket events that arrived while the fetch was in flight.
          const known = new Set(fetched.map((e) => e.id));
          const live = s.events.filter((e) => !known.has(e.id));
          return { ...s, endpoint, events: [...live, ...fetched], loading: false, error: null };
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load data",
        }));
      });

    return () => {
      controller.abort();
      socket.off("webhook:received");
      socket.disconnect();
    };
  }, [endpointId]);

  return state;
}
