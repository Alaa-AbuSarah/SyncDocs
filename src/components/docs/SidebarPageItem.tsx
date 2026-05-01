"use client";

import { Page } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarPageItemProps {
  page: Page;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  isReadOnly: boolean;
}

export function SidebarPageItem({
  page,
  isActive,
  onClick,
  onDelete,
  isReadOnly,
}: SidebarPageItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-1 px-3 py-1.5 rounded-md cursor-pointer text-sm transition-colors",
        isActive
          ? "bg-gray-200 text-gray-900 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
      onClick={onClick}
    >
      <span className="truncate flex-1">{page.title}</span>
      {!isReadOnly && onDelete && (
        <button
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 text-gray-400 transition-all flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete page"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
