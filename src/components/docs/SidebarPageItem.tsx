"use client";
import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Page } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarPageItemProps {
  page: Page;
  depth: number;
  isActive: boolean;
  children?: React.ReactNode;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function SidebarPageItem({
  page,
  depth,
  isActive,
  children,
  onSelect,
  onRename,
  onDelete,
  onAddChild,
}: SidebarPageItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(page.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  useEffect(() => {
    setTitle(page.title);
  }, [page.title]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    setEditing(false);
    const trimmed = title.trim() || "Untitled";
    setTitle(trimmed);
    onRename(page.id, trimmed);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${12 + depth * 16}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        "group flex items-center gap-1 pr-2 py-1 rounded-md cursor-pointer text-sm select-none",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-100"
      )}
      onClick={() => !editing && onSelect(page.id)}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing text-gray-400 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </span>

      {/* Title */}
      {editing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setTitle(page.title);
              setEditing(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent outline-none text-sm min-w-0"
        />
      ) : (
        <span className="flex-1 truncate">{page.title}</span>
      )}

      {/* Actions */}
      <div
        className="hidden group-hover:flex items-center gap-0.5 shrink-0"
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
          title="Rename"
          onClick={() => setEditing(true)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 text-xs"
        >
          ✎
        </button>
        <button
          title="Delete"
          onClick={() => onDelete(page.id)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-600 text-xs"
        >
          ×
        </button>
      </div>

      {children && <div className="w-full">{children}</div>}
    </div>
  );
}
