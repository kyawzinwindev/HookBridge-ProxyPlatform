"use client";

import { useEffect, useMemo, useState } from "react";
import { EventDetail } from "@/components/event-detail";
import { EventList } from "@/components/event-list";
import { MetricsBar } from "@/components/metrics-bar";
import { TopNav } from "@/components/top-nav";
import { API_URL, DEFAULT_ENDPOINT_ID, useEndpointStream } from "@/lib/use-endpoint-stream";

export default function DashboardPage() {
  // Endpoint comes from `?endpoint=<id>`, falling back to the seeded dev endpoint.
  const [endpointId, setEndpointId] = useState<string | null>(null);
  useEffect(() => {
    setEndpointId(new URLSearchParams(window.location.search).get("endpoint") ?? DEFAULT_ENDPOINT_ID);
  }, []);

  const { endpoint, events, loading, error, connected } = useEndpointStream(endpointId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // Re-render periodically so relative timestamps stay fresh.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        (e.externalId ?? "").toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q),
    );
  }, [events, filter]);

  // Until the user picks one, follow the newest event.
  const selected = events.find((e) => e.id === selectedId) ?? events[0] ?? null;

  const ingestUrl = `${API_URL}/in/${endpoint?.id ?? endpointId ?? DEFAULT_ENDPOINT_ID}`;

  return (
    <div className="flex h-screen flex-col">
      <TopNav ingestUrl={ingestUrl} apiHost={new URL(API_URL).host} connected={connected} />
      <MetricsBar events={events} connected={connected} />
      <h1 className="sr-only">HookBridge event inspector</h1>
      {error && (
        <div role="alert" className="shrink-0 border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-700 dark:text-rose-300">
          Could not load endpoint <span className="font-mono">{endpointId}</span>: {error}
        </div>
      )}
      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <EventList
          events={filtered}
          totalCount={events.length}
          loading={loading}
          selectedId={selected?.id ?? null}
          now={now}
          filter={filter}
          onFilterChange={setFilter}
          onSelect={setSelectedId}
        />
        {selected ? (
          <EventDetail key={selected.id} event={selected} endpoint={endpoint} />
        ) : (
          <section className="flex min-h-0 w-full flex-1 items-center justify-center px-6 text-center text-sm text-zinc-500 md:w-[65%]">
            {loading ? "Loading…" : "Select an event to inspect its headers, payload and delivery logs."}
          </section>
        )}
      </main>
    </div>
  );
}
