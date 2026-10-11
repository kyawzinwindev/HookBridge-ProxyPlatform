import type { JsonValue } from "@hookbridge/types";
import type { ReactNode } from "react";

function render(value: JsonValue, indent: number): ReactNode {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);
  const punc = (s: string) => <span className="j-punc">{s}</span>;

  if (value === null) return <span className="j-null">null</span>;
  if (typeof value === "string") return <span className="j-str">&quot;{value}&quot;</span>;
  if (typeof value === "number") return <span className="j-num">{String(value)}</span>;
  if (typeof value === "boolean") return <span className="j-bool">{String(value)}</span>;

  if (Array.isArray(value)) {
    if (!value.length) return punc("[]");
    return (
      <>
        {punc("[")}
        {"\n"}
        {value.map((v, i) => (
          <span key={i}>
            {padIn}
            {render(v, indent + 1)}
            {i < value.length - 1 && punc(",")}
            {"\n"}
          </span>
        ))}
        {pad}
        {punc("]")}
      </>
    );
  }

  const keys = Object.keys(value);
  if (!keys.length) return punc("{}");
  return (
    <>
      {punc("{")}
      {"\n"}
      {keys.map((k, i) => (
        <span key={k}>
          {padIn}
          <span className="j-key">&quot;{k}&quot;</span>
          {punc(":")} {render(value[k], indent + 1)}
          {i < keys.length - 1 && punc(",")}
          {"\n"}
        </span>
      ))}
      {pad}
      {punc("}")}
    </>
  );
}

export function JsonViewer({ value }: { value: JsonValue }) {
  const lineCount = JSON.stringify(value, null, 2).split("\n").length;
  const nums = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");
  return (
    <div className="flex min-h-full font-mono text-[13px] leading-6">
      <pre className="shrink-0 select-none border-r border-zinc-200 px-3 py-3 text-right text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
        {nums}
      </pre>
      <pre className="flex-1 whitespace-pre px-4 py-3 text-zinc-800 dark:text-zinc-200">
        {render(value, 0)}
      </pre>
    </div>
  );
}
