"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InspectorEvent } from "@/lib/sample-data";
import { JsonViewer } from "./json-viewer";
import { StatusBadge } from "./status-badge";

type Tab = "body" | "headers" | "response";

const TABS: { id: Tab; label: string }[] = [
  { id: "body", label: "Request Body" },
  { id: "headers", label: "Headers" },
  { id: "response", label: "Local Response" },
];

function HeaderTable({ headers, compact = false }: { headers: Record<string, string>; compact?: boolean }) {
  return (
    <table className="w-full">
      <tbody>
        {Object.entries(headers).map(([k, v]) => (
          <tr key={k} className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
            <td
              className={cn(
                "whitespace-nowrap px-4 align-top font-mono text-[13px] text-zinc-500 dark:text-zinc-400",
                compact ? "py-1.5" : "py-2",
              )}
            >
              {k}
            </td>
            <td
              className={cn(
                "break-all px-4 font-mono text-[13px] text-zinc-800 dark:text-zinc-200",
                compact ? "py-1.5" : "py-2",
              )}
            >
              {v}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const sectionLabel = "text-[11px] font-medium uppercase tracking-wider text-zinc-500";

function useFlash() {
  const [flashed, setFlashed] = useState<string | null>(null);
  return {
    flashed,
    flash: (key: string) => {
      setFlashed(key);
      setTimeout(() => setFlashed(null), 1200);
    },
  };
}

function toCurl(e: InspectorEvent) {
  const headerArgs = Object.entries(e.headers)
    .filter(([k]) => k !== "Host" && k !== "Content-Length")
    .map(([k, v]) => `  -H '${k}: ${v}'`)
    .join(" \\\n");
  return (
    `curl -X ${e.method} 'http://localhost:3000${e.path.replace("/in/wh_live_99x", "/webhooks")}' \\\n` +
    `${headerArgs} \\\n  -d '${JSON.stringify(e.body)}'`
  );
}

export function EventDetail({ event: e }: { event: InspectorEvent }) {
  const [tab, setTab] = useState<Tab>("body");
  const { flashed, flash } = useFlash();
  const ok = e.status >= 200 && e.status < 300;

  const paneLabel = tab === "body" ? "application/json" : tab === "headers" ? "Request headers" : "Local response";
  const paneMeta =
    tab === "body"
      ? `${new Blob([JSON.stringify(e.body)]).size} bytes`
      : tab === "headers"
        ? `${Object.keys(e.headers).length} headers`
        : `${e.response.status} ${e.response.statusText} · ${e.response.time}`;

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col md:w-[65%]">
      <div className="shrink-0 border-b border-zinc-200 px-5 pb-3 pt-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{e.id}</span>
              <StatusBadge status={e.status} />
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-sm">
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {e.method}
              </span>
              <code className="truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">{e.path}</code>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(toCurl(e)).catch(() => {});
                flash("curl");
              }}
              className="h-8 rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {flashed === "curl" ? "Copied" : "Copy as cURL"}
            </button>
            <button
              onClick={() => flash("replay")}
              className="h-8 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {flashed === "replay" ? "Replayed ✓" : "Replay to Local"}
            </button>
          </div>
        </div>

        <div className="-mb-3 mt-4 flex items-center gap-5" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "border-b-2 pb-2.5 text-sm transition-colors",
                tab === t.id
                  ? "border-current font-medium text-zinc-900 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-5 py-4">
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-800">
            <span className={sectionLabel}>{paneLabel}</span>
            <span className="font-mono text-[11px] text-zinc-500">{paneMeta}</span>
          </div>
          <div className="scroll-thin flex-1 overflow-auto">
            {tab === "body" && <JsonViewer value={e.body} />}
            {tab === "headers" && <HeaderTable headers={e.headers} />}
            {tab === "response" && (
              <>
                <div className="flex items-center gap-2 px-4 pb-2 pt-3">
                  <StatusBadge status={e.response.status} />
                  <span className="text-xs text-zinc-500">
                    {e.response.statusText} · {e.response.time}
                  </span>
                </div>
                <div className={cn("px-4 pb-1", sectionLabel)}>Headers</div>
                <div className="mb-2">
                  <HeaderTable headers={e.response.headers} compact />
                </div>
                <div className={cn("border-t border-zinc-200 px-4 pb-1 pt-2 dark:border-zinc-800", sectionLabel)}>
                  Body
                </div>
                <JsonViewer value={e.response.body} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-5 pb-4">
        <div
          className={cn(
            "flex h-9 items-center gap-2.5 rounded-md border px-3 text-xs",
            ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
          )}
        >
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", ok ? "bg-emerald-500" : "bg-rose-500")} />
          <span className="truncate">
            Forwarded to <span className="font-mono">{e.forwarded}</span> —{" "}
            <span className="font-semibold">
              {e.status} {ok ? "OK" : "Error"}
            </span>{" "}
            in {e.latency}ms
          </span>
        </div>
      </div>
    </section>
  );
}
