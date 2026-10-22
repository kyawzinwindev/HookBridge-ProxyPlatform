"use client";

import { useState } from "react";
import type { DeliveryLog, EndpointInfo, WebhookEventDetail } from "@hookbridge/types";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/use-endpoint-stream";
import { JsonViewer } from "./json-viewer";
import { HttpStatusBadge, SourceBadge, StatusBadge } from "./status-badge";

type Tab = "body" | "headers" | "logs";

const TABS: { id: Tab; label: string }[] = [
  { id: "body", label: "Request Body" },
  { id: "headers", label: "Headers" },
  { id: "logs", label: "Delivery Logs" },
];

const sectionLabel = "text-[11px] font-medium uppercase tracking-wider text-zinc-500";

function HeaderTable({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers);
  if (!entries.length) return <div className="px-4 py-6 text-xs text-zinc-500">No headers captured.</div>;
  return (
    <table className="w-full">
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
            <td className="whitespace-nowrap px-4 py-2 align-top font-mono text-[13px] text-zinc-500 dark:text-zinc-400">
              {k}
            </td>
            <td className="break-all px-4 py-2 font-mono text-[13px] text-zinc-800 dark:text-zinc-200">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LogList({ logs }: { logs: DeliveryLog[] }) {
  if (!logs.length) {
    return (
      <div className="px-4 py-6 text-xs text-zinc-500">
        No delivery attempts yet. Logs appear here once a worker relays this event.
      </div>
    );
  }
  return (
    <ul>
      {logs.map((log) => (
        <li key={log.id} className="border-b border-zinc-200 px-4 py-3 last:border-0 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <HttpStatusBadge code={log.statusCode} small />
            <code className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">{log.destination}</code>
            <span className="ml-auto font-mono text-[11px] text-zinc-500">
              {log.latencyMs !== null ? `${log.latencyMs}ms` : "—"} · {new Date(log.createdAt).toLocaleTimeString()}
            </span>
          </div>
          {log.responseBody && (
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded bg-zinc-100 p-2 font-mono text-[12px] text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
              {log.responseBody}
            </pre>
          )}
        </li>
      ))}
    </ul>
  );
}

function toCurl(e: WebhookEventDetail) {
  const quote = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
  const skip = new Set(["host", "content-length", "connection", "accept-encoding"]);
  const headerArgs = Object.entries(e.headers)
    .filter(([k]) => !skip.has(k.toLowerCase()))
    .map(([k, v]) => `  -H ${quote(`${k}: ${v}`)}`)
    .join(" \\\n");
  return (
    `curl -X ${e.method} ${quote(`${API_URL}${e.path}`)} \\\n` +
    `${headerArgs ? `${headerArgs} \\\n` : ""}  -d ${quote(JSON.stringify(e.payload))}`
  );
}

interface Props {
  event: WebhookEventDetail;
  endpoint: EndpointInfo | null;
}

export function EventDetail({ event: e, endpoint }: Props) {
  const [tab, setTab] = useState<Tab>("body");
  const [copied, setCopied] = useState(false);

  const payloadText = JSON.stringify(e.payload);
  const paneLabel = tab === "body" ? "application/json" : tab === "headers" ? "Request headers" : "Delivery attempts";
  const paneMeta =
    tab === "body"
      ? `${new Blob([payloadText]).size} bytes`
      : tab === "headers"
        ? `${Object.keys(e.headers).length} headers`
        : `${e.logs.length} attempt${e.logs.length === 1 ? "" : "s"}`;

  const latest = e.logs[0];
  const ok = latest?.statusCode != null && latest.statusCode >= 200 && latest.statusCode < 300;

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col md:w-[65%]">
      <div className="shrink-0 border-b border-zinc-200 px-5 pb-3 pt-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-mono text-sm font-semibold">{e.externalId ?? e.id}</span>
              <StatusBadge status={e.status} />
              <SourceBadge source={e.source} />
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-sm">
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {e.method}
              </span>
              <code className="truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">{e.path}</code>
              <span className="text-xs text-zinc-500">· {new Date(e.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(toCurl(e)).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="h-8 rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {copied ? "Copied" : "Copy as cURL"}
          </button>
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
            {tab === "body" && <JsonViewer value={e.payload} />}
            {tab === "headers" && <HeaderTable headers={e.headers} />}
            {tab === "logs" && <LogList logs={e.logs} />}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-5 pb-4">
        <div
          className={cn(
            "flex h-9 items-center gap-2.5 rounded-md border px-3 text-xs",
            !latest
              ? "border-zinc-300 bg-zinc-500/5 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              : ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              !latest ? "bg-zinc-400" : ok ? "bg-emerald-500" : "bg-rose-500",
            )}
          />
          <span className="truncate">
            {latest ? (
              <>
                Last delivery to <span className="font-mono">{latest.destination}</span> —{" "}
                <span className="font-semibold">{latest.statusCode ?? "no response"}</span>
                {latest.latencyMs !== null && <> in {latest.latencyMs}ms</>}
              </>
            ) : (
              <>
                Awaiting delivery to <span className="font-mono">{endpoint?.targetUrl ?? "target"}</span>
              </>
            )}
          </span>
        </div>
      </div>
    </section>
  );
}
