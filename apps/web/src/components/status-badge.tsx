import { cn } from "@/lib/utils";

export function StatusBadge({ status, small = false }: { status: number; small?: boolean }) {
  let tone: string;
  let label: string;
  if (status >= 200 && status < 300) {
    tone = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    label = `${status} OK`;
  } else if (status >= 500) {
    tone = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
    label = `${status} Error`;
  } else {
    tone = "bg-amber-400/10 text-amber-700 dark:text-amber-400 border-amber-400/30";
    label = `${status} Warn`;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border font-mono font-semibold",
        small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        tone,
      )}
    >
      {label}
    </span>
  );
}
