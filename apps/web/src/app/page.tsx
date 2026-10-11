"use client";

import { useMemo, useState } from "react";
import { EventDetail } from "@/components/event-detail";
import { EventList } from "@/components/event-list";
import { MetricsBar } from "@/components/metrics-bar";
import { TopNav } from "@/components/top-nav";
import { EVENTS } from "@/lib/sample-data";

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState(EVENTS[0].id);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return EVENTS.filter((e) => !q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
  }, [filter]);

  const selected = EVENTS.find((e) => e.id === selectedId) ?? EVENTS[0];

  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <MetricsBar />
      <h1 className="sr-only">HookBridge event inspector</h1>
      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <EventList
          events={filtered}
          selectedId={selectedId}
          filter={filter}
          onFilterChange={setFilter}
          onSelect={setSelectedId}
        />
        <EventDetail key={selected.id} event={selected} />
      </main>
    </div>
  );
}
