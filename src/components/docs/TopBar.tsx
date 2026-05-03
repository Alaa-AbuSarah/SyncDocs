"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import { Button } from "@/components/shared/Button";
import { createClient } from "@/lib/supabase/client";

interface TopBarProps {
  project: Project;
  readOnly?: boolean;
  userId?: string;
  avatarUrl?: string;
  displayName?: string;
  onMobileMenuToggle?: () => void;
}

export function TopBar({ project, readOnly = false, userId, avatarUrl, displayName, onMobileMenuToggle }: TopBarProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/share/${userId}/${project.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
  };

  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — mobile only, opens page sidebar */}
        <button
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation"
          className="md:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleShare}>
            {copied ? "✓ Copied!" : "Share"}
          </Button>

          {/* Avatar + Logout icon */}
          <div className="flex items-center gap-1.5">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName ?? "User avatar"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white text-[10px] font-semibold">{initials}</span>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
