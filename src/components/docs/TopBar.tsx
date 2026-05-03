"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import { Button } from "@/components/shared/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface TopBarProps {
  project: Project;
  readOnly?: boolean;
  userId?: string;
}

export function TopBar({ project, readOnly = false, userId }: TopBarProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/share/${userId}/${project.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {!readOnly && (
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-gray-700 transition-colors text-sm shrink-0"
          >
            ←
          </button>
        )}
        <span className="text-sm font-medium text-gray-900 truncate">
          {project.name}
        </span>
        {readOnly && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
            Read-only
          </span>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleShare}>
            {copied ? "✓ Copied!" : "Share"}
          </Button>
          <LogoutButton />
        </div>
      )}
    </header>
  );
}
