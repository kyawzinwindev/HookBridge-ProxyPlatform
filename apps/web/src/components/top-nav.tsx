"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  ingestUrl: string;
  apiHost: string;
  connected: boolean;
}

export function TopNav({ ingestUrl, apiHost, connected }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(ingestUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    try {
      localStorage.setItem("hookbridge-theme", root.classList.contains("dark") ? "dark" : "light");
    } catch {}
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="shrink-0 text-sm font-semibold tracking-tight">HookBridge</span>

      <div className="ml-2 hidden min-w-0 items-center gap-2 md:flex">
        <div className="flex h-8 min-w-0 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 pl-3 pr-1 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-500">Ingest</span>
          <code className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">{ingestUrl}</code>
          <button
            onClick={copy}
            className="h-6 rounded px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="flex-1" />

      <div className="hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-800 dark:bg-zinc-900 sm:flex">
        <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-emerald-500" : "bg-rose-500")} />
        <span className="text-xs text-zinc-700 dark:text-zinc-300">
          {connected ? "Connected to" : "Disconnected from"} <span className="font-mono">{apiHost}</span>
        </span>
      </div>

      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        <Sun className="hidden h-4 w-4 dark:block" />
        <Moon className="block h-4 w-4 dark:hidden" />
      </button>
    </header>
  );
}
