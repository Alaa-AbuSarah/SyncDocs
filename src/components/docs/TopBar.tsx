"use client";

import { useState } from "react";
import { Page } from "@/types";
import { PageTitleEditor } from "./PageTitleEditor";
import { Button } from "@/components/shared/Button";

interface TopBarProps {
  page: Page;
  projectId: string;
  isReadOnly: boolean;
  onToggleMode: () => void;
  onTitleChange: (title: string) => void;
}

export function TopBar({
  page,
  projectId,
  isReadOnly,
  onToggleMode,
  onTitleChange,
}: TopBarProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/share/${projectId}/${page.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 bg-white">
      <PageTitleEditor
        title={page.title}
        onChange={onTitleChange}
        isReadOnly={isReadOnly}
      />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleShare}>
          {copied ? (
            <span className="text-green-600">Copied!</span>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                />
              </svg>
              Share
            </>
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleMode}>
          {isReadOnly ? "Edit" : "Preview"}
        </Button>
      </div>
    </header>
  );
}
