"use client";

import { ReactNode } from "react";

interface BlockWrapperProps {
  onDelete: () => void;
  isReadOnly: boolean;
  children: ReactNode;
}

export function BlockWrapper({ onDelete, isReadOnly, children }: BlockWrapperProps) {
  return (
    <div className="group relative">
      {children}
      {!isReadOnly && (
        <button
          onClick={onDelete}
          className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete block"
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
