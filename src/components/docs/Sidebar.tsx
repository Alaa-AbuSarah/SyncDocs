"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Project, Page } from "@/types";
import { SidebarPageItem } from "./SidebarPageItem";

interface SidebarProps {
  project: Project;
  pages: Page[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onDeletePage: (id: string) => void;
  onReorderPages?: (pageIds: string[]) => void;
  isReadOnly: boolean;
}

export function Sidebar({
  project,
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onReorderPages,
  isReadOnly,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id && onReorderPages) {
      const oldIndex = pages.findIndex((p) => p.id === draggedId);
      const newIndex = pages.findIndex((p) => p.id === id);
      
      const newPages = [...pages];
      const [removed] = newPages.splice(oldIndex, 1);
      newPages.splice(newIndex, 0, removed);
      
      onReorderPages(newPages.map((p) => p.id));
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const filtered = search.trim()
    ? pages.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    : pages;

  return (
    <aside className="w-60 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-gray-200">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← All projects
        </Link>
        <h1 className="text-sm font-semibold text-gray-900 mt-2 truncate">
          {project.name}
        </h1>
      </div>

      <div className="px-3 pt-3 pb-2">
        <input
          type="text"
          placeholder="Search pages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {filtered.length === 0 && search ? (
          <p className="text-xs text-gray-400 px-3 py-2">No pages match.</p>
        ) : null}
        {filtered.map((page) => (
          <SidebarPageItem
            key={page.id}
            page={page}
            isActive={page.id === activePageId}
            onClick={() => onSelectPage(page.id)}
            onDelete={() => onDeletePage(page.id)}
            isReadOnly={isReadOnly}
            draggable={!isReadOnly && !search.trim()}
            isDragged={draggedId === page.id}
            isDropTarget={dragOverId === page.id}
            onDragStart={(e: React.DragEvent) => handleDragStart(e, page.id)}
            onDragOver={(e: React.DragEvent) => handleDragOver(e, page.id)}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e: React.DragEvent) => handleDrop(e, page.id)}
            onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
          />
        ))}
      </nav>

      {!isReadOnly && (
        <div className="px-3 py-3 border-t border-gray-200">
          <button
            onClick={onCreatePage}
            className="w-full flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add page
          </button>
        </div>
      )}
    </aside>
  );
}
