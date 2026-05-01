"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface BlockWrapperProps {
  onDelete: () => void;
  isReadOnly: boolean;
  children: ReactNode;
  isDragged?: boolean;
  isDropTarget?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function BlockWrapper({
  onDelete,
  isReadOnly,
  children,
  isDragged,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: BlockWrapperProps) {
  const [isDragReady, setIsDragReady] = useState(false);

  return (
    <div
      className={cn(
        "group relative transition-all",
        isDragged && "opacity-50",
        isDropTarget && "before:absolute before:inset-0 before:border-2 before:border-dashed before:border-gray-400 before:-m-2 before:rounded-lg before:pointer-events-none before:z-10"
      )}
      draggable={isDragReady && !isReadOnly}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={(e) => {
        setIsDragReady(false);
        onDragEnd?.(e);
      }}
    >
      {!isReadOnly && (
        <div
          className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-all"
          onMouseEnter={() => setIsDragReady(true)}
          onMouseLeave={() => setIsDragReady(false)}
          title="Drag to move"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </div>
      )}
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
