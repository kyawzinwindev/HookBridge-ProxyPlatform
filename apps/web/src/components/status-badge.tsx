import type { EventStatus } from "@hookbridge/types";
import { cn } from "@/lib/utils";

const base = "inline-flex items-center gap-1 rounded border font-mono font-semibold";
const size = (small: boolean) => (small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]");

const EVENT_TONES: Record<EventStatus, string> = {
  DELIVERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  FAILED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  PENDING: "bg-amber-400/10 text-amber-700 dark:text-amber-400 border-amber-400/30",
  RECEIVED: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  QUEUED: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  DUPLICATE: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
};

/** Badge for an event's processing status (PENDING, DELIVERED, ...). */
export function StatusBadge({ status, small = false }: { status: EventStatus; small?: boolean }) {
  const tone = EVENT_TONES[status] ?? EVENT_TONES.DUPLICATE;
  return <span className={cn(base, size(small), tone)}>{status}</span>;
}

/** Badge for an HTTP status code returned by a delivery attempt. */
export function HttpStatusBadge({ code, small = false }: { code: number | null; small?: boolean }) {
  let tone: string;
  let label: string;
  if (code === null) {
    tone = "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30";
    label = "no response";
  } else if (code >= 200 && code < 300) {
    tone = EVENT_TONES.DELIVERED;
    label = `${code} OK`;
  } else if (code >= 500) {
    tone = EVENT_TONES.FAILED;
    label = `${code} Error`;
  } else {
    tone = EVENT_TONES.PENDING;
    label = `${code} Warn`;
  }
  return <span className={cn(base, size(small), tone)}>{label}</span>;
}

/** Badge for the webhook provider (stripe, github, generic, ...). */
export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      {source}
    </span>
  );
}
