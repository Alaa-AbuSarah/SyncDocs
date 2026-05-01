"use client";

import { useState, useEffect } from "react";
import { ApiContent } from "@/types";
import { cn } from "@/lib/utils";

const METHOD_COLORS: Record<ApiContent["method"], string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
  PATCH: "bg-orange-100 text-orange-700",
};

const METHODS: ApiContent["method"][] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

interface ApiBlockProps {
  blockId: string;
  content: ApiContent;
  onChange: (content: ApiContent) => void;
  isReadOnly: boolean;
}

export function ApiBlock({ content, onChange, isReadOnly }: ApiBlockProps) {
  const [draft, setDraft] = useState<ApiContent>(content);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDraft(content);
    }, 0);
    return () => clearTimeout(timeout);
  }, [content]);

  const update = (partial: Partial<ApiContent>) => {
    const next = { ...draft, ...partial };
    setDraft(next);
    onChange(next);
  };

  if (isReadOnly) {
    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-xs font-mono font-bold",
              METHOD_COLORS[draft.method]
            )}
          >
            {draft.method}
          </span>
          <code className="text-sm font-mono text-gray-800 flex-1 truncate">
            {draft.endpoint || (
              <span className="text-gray-400 italic">No endpoint</span>
            )}
          </code>
        </div>
        {draft.description && (
          <div className="px-4 py-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              {draft.description}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <select
          value={draft.method}
          onChange={(e) =>
            update({ method: e.target.value as ApiContent["method"] })
          }
          className={cn(
            "px-2 py-0.5 rounded text-xs font-mono font-bold border-0 outline-none cursor-pointer",
            METHOD_COLORS[draft.method]
          )}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={draft.endpoint}
          onChange={(e) => update({ endpoint: e.target.value })}
          placeholder="/api/endpoint"
          className="flex-1 bg-transparent text-sm font-mono text-gray-800 border-0 outline-none placeholder-gray-400"
        />
      </div>
      <div className="px-4 py-3">
        <textarea
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe this endpoint…"
          rows={2}
          className="w-full text-sm text-gray-600 bg-transparent border-0 outline-none resize-none placeholder-gray-400 leading-relaxed"
        />
      </div>
    </div>
  );
}
