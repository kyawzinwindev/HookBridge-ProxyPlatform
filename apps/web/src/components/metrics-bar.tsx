import { METRICS } from "@/lib/sample-data";

export function MetricsBar() {
  return (
    <section className="shrink-0 border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {METRICS.map((m) => (
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
