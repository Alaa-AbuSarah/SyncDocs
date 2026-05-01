"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";

interface PageTitleEditorProps {
  title: string;
  onChange: (title: string) => void;
  isReadOnly: boolean;
}

export function PageTitleEditor({
  title,
  onChange,
  isReadOnly,
}: PageTitleEditorProps) {
  const [draft, setDraft] = useState(title);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);

  const [displayWidth, setDisplayWidth] = useState<number>(80);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFocused) setDraft(title);
    }, 0);
    return () => clearTimeout(timeout);
  }, [title, isFocused]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (sizerRef.current) {
        setDisplayWidth(sizerRef.current.offsetWidth + 16);
      } else {
        setDisplayWidth(Math.max(draft.length * 8, 80));
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [draft]);

  const commit = () => {
    setIsFocused(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) {
      onChange(trimmed);
    } else {
      setDraft(title);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") inputRef.current?.blur();
    if (e.key === "Escape") {
      setDraft(title);
      inputRef.current?.blur();
    }
  };

  if (isReadOnly) {
    return (
      <span className="text-sm font-semibold text-gray-900 truncate max-w-xs">
        {title}
      </span>
    );
  }

  // displayWidth is managed via effect now

  return (
    <div className="relative flex items-center">
      <span
        ref={sizerRef}
        aria-hidden
        className="absolute invisible text-sm font-semibold whitespace-pre px-1"
      >
        {draft || " "}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="text-sm font-semibold text-gray-900 bg-transparent border-0 outline-none focus:ring-0 hover:bg-gray-100 focus:bg-gray-100 rounded px-1 py-0.5 transition-colors max-w-[240px] min-w-[80px]"
        style={{ width: displayWidth }}
      />
    </div>
  );
}
