"use client";
import { useState, useEffect } from "react";
import type { Page } from "@/types";

interface PageTitleEditorProps {
  page: Page;
  onRename: (id: string, title: string) => void;
  readOnly?: boolean;
}

export function PageTitleEditor({ page, onRename, readOnly = false }: PageTitleEditorProps) {
  const [value, setValue] = useState(page.title);

  useEffect(() => {
    setValue(page.title);
  }, [page.id, page.title]);

  const commit = () => {
    const trimmed = value.trim() || "Untitled";
    setValue(trimmed);
    onRename(page.id, trimmed);
  };

  if (readOnly) {
    return (
      <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
        {page.title}
      </h1>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
      placeholder="Untitled"
      className="w-full text-3xl font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-300 mb-6 pb-4 border-b border-gray-100"
    />
  );
}
