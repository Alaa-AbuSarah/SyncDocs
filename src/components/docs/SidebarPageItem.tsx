"use client";
import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Page } from "@/types";
import { cn } from "@/lib/utils";

export type DropPosition = "before" | "after" | "into";

interface SidebarPageItemProps {
  page: Page;
  depth: number;
  isActive: boolean;
  dropPosition?: DropPosition | null;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  readOnly?: boolean;
}

export function SidebarPageItem({
  page,
  depth,
  isActive,
  dropPosition,
  onSelect,
  onRename,
  onDelete,
  onAddChild,
  readOnly = false,
}: SidebarPageItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(page.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id, disabled: readOnly });

  useEffect(() => { setTitle(page.title); }, [page.title]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commitRename = () => {
    setEditing(false);
    const trimmed = title.trim() || "Untitled";
    setTitle(trimmed);
    onRename(page.id, trimmed);
  };

  const handleDoubleClick = () => {
    if (readOnly) return;
    setEditing(true);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${12 + depth * 16}px`,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drop-before line */}
      {dropPosition === "before" && (
        <div className="absolute top-0 left-2 right-0 h-0.5 bg-blue-400 rounded-full z-10 pointer-events-none -translate-y-px" />
      )}

      {/* Row */}
      <div
        style={{ opacity: isDragging ? 0.35 : 1 }}
        className={cn(
          "group flex items-center gap-1 pr-2 py-[5px] rounded-md cursor-pointer text-sm select-none transition-colors",
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100",
          dropPosition === "into" && "ring-1 ring-inset ring-blue-400 bg-blue-50/60"
        )}
        onClick={() => !editing && onSelect(page.id)}
        onDoubleClick={handleDoubleClick}
      >
        {/* Drag handle — hidden in read-only */}
        {!readOnly && (
          <span
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-30 cursor-grab active:cursor-grabbing text-gray-400 shrink-0 text-xs leading-none"
            onClick={(e) => e.stopPropagation()}
          >
            ⠿
          </span>
        )}

        {/* Title or rename input */}
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setTitle(page.title); setEditing(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
          />
        ) : (
          <span className="flex-1 truncate leading-snug">{page.title}</span>
        )}

        {/* Hover actions — always visible on touch devices via sidebar-page-actions CSS class */}
        {!readOnly && (
          <div
            className="sidebar-page-actions hidden group-hover:flex items-center gap-0.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              title="Add sub-page"
              onClick={() => onAddChild(page.id)}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 text-xs"
            >
              +
            </button>
            <button
              title="Delete"
              onClick={() => onDelete(page.id)}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-500 text-xs"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Drop-after line */}
      {dropPosition === "after" && (
        <div className="absolute bottom-0 left-2 right-0 h-0.5 bg-blue-400 rounded-full z-10 pointer-events-none translate-y-px" />
      )}
    </div>
  );
}
