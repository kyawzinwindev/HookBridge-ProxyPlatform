import type { EventStatus, WebhookEventDetail } from "@hookbridge/types";

interface Metric {
  label: string;
  value: string;
  hint: string;
}

function computeMetrics(events: WebhookEventDetail[], connected: boolean): Metric[] {
  const count = (s: EventStatus) => events.filter((e) => e.status === s).length;
  const delivered = count("DELIVERED");
  const failed = count("FAILED");
  const settled = delivered + failed;

  const latencies = events.flatMap((e) => e.logs.map((l) => l.latencyMs).filter((n): n is number => n !== null));
  const avg = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

  return [
    { label: "Events Loaded", value: String(events.length), hint: "latest 50" },
    {
      label: "Delivery Rate",
      value: settled ? `${((delivered / settled) * 100).toFixed(1)}%` : "—",
      hint: `${failed} failed`,
    },
    { label: "Avg Relay Latency", value: avg === null ? "—" : `${avg}ms`, hint: `${latencies.length} attempts` },
    { label: "Live Stream", value: connected ? "On" : "Off", hint: connected ? "socket connected" : "reconnecting" },
  ];
}

export function MetricsBar({ events, connected }: { events: WebhookEventDetail[]; connected: boolean }) {
  const metrics = computeMetrics(events, connected);
  return (
    <section className="shrink-0 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{m.label}</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {m.value}
              </span>
              <span className="text-xs text-zinc-500">{m.hint}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
