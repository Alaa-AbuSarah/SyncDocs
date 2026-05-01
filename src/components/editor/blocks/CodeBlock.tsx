"use client";

import { useState, useEffect, useRef } from "react";
import { CodeContent } from "@/types";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  "plaintext",
  "javascript",
  "typescript",
  "python",
  "bash",
  "json",
  "html",
  "css",
  "sql",
  "go",
  "rust",
  "java",
];

interface CodeBlockProps {
  blockId: string;
  content: CodeContent;
  onChange: (content: CodeContent) => void;
  isReadOnly: boolean;
}

export function CodeBlock({
  content,
  onChange,
  isReadOnly,
}: CodeBlockProps) {
  const [code, setCode] = useState(content.code);
  const [language, setLanguage] = useState(content.language || "plaintext");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(content.code);
    setLanguage(content.language || "plaintext");
  }, [content.code, content.language]);

  const handleCodeChange = (value: string) => {
    setCode(value);
    onChange({ code: value, language });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    onChange({ code, language: value });
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  if (isReadOnly) {
    return (
      <div className="rounded-xl overflow-hidden bg-[#1e1e2e]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <span className="text-xs font-mono text-gray-400">{language}</span>
        </div>
        <pre className="px-4 py-4 overflow-x-auto text-sm font-mono text-gray-100 leading-relaxed">
          <code>{code || <span className="text-gray-500 italic">Empty code block</span>}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-[#1e1e2e]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="text-xs bg-transparent text-gray-400 border-0 outline-none cursor-pointer"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l} className="bg-gray-900 text-gray-100">
              {l}
            </option>
          ))}
        </select>
      </div>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => {
          handleCodeChange(e.target.value);
          autoResize();
        }}
        onFocus={autoResize}
        placeholder="// Write code here…"
        spellCheck={false}
        className={cn(
          "w-full bg-transparent text-gray-100 font-mono text-sm leading-relaxed px-4 py-4",
          "border-0 outline-none resize-none min-h-[80px] placeholder-gray-600"
        )}
        rows={Math.max(code.split("\n").length, 3)}
      />
    </div>
  );
}
