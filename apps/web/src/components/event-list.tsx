import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InspectorEvent } from "@/lib/sample-data";
import { StatusBadge } from "./status-badge";

interface Props {
  events: InspectorEvent[];
  selectedId: string;
  filter: string;
  onFilterChange: (v: string) => void;
  onSelect: (id: string) => void;
}

export function EventList({ events, selectedId, filter, onFilterChange, onSelect }: Props) {
  return (
    <aside className="flex max-h-[40vh] min-h-0 w-full flex-col border-b border-zinc-200 dark:border-zinc-800 md:max-h-none md:w-[35%] md:border-b-0 md:border-r">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 p-3 dark:border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Filter events…"
            className="h-8 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-sm placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:placeholder-zinc-600 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          />
        </div>
        <button
          onClick={() => onFilterChange("")}
          className="h-8 rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Clear
        </button>
      </div>

      <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-3">
        {events.length === 0 && (
          <div className="py-10 text-center text-xs text-zinc-500">No events match your filter.</div>
        )}
        {events.map((e) => {
          const active = e.id === selectedId;
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              aria-current={active}
              className={cn(
                "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 dark:border-zinc-100 dark:bg-zinc-900 dark:ring-zinc-100"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[13px] font-medium">{e.name}</span>
                <span className="shrink-0 text-[11px] text-zinc-500">{e.time}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {e.method}
                </span>
                <StatusBadge status={e.status} small />
                <span className="ml-auto font-mono text-[11px] text-zinc-500">{e.latency}ms</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800">
        <span>
          {events.length} event{events.length === 1 ? "" : "s"}
        </span>
        <span>Live · auto-refresh</span>
      </div>
    </aside>
  );
}
