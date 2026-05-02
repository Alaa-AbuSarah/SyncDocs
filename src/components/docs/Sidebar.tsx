"use client";
import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragStartEvent, DragMoveEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Project, Page } from "@/types";
import { SidebarPageItem } from "./SidebarPageItem";
import type { DropPosition } from "./SidebarPageItem";
import { Button } from "@/components/shared/Button";
import { useProjectStore } from "@/store/useProjectStore";
import { searchPages } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DropState {
  overId: string;
  position: DropPosition;
}

// Returns true if making `activeId` a child of `targetId` would create a cycle.
function wouldCreateCycle(pages: Page[], activeId: string, targetId: string): boolean {
  if (activeId === targetId) return true;
  let current = pages.find((p) => p.id === targetId);
  while (current) {
    if (current.parentId === activeId) return true;
    current = current.parentId ? pages.find((p) => p.id === current!.parentId) : undefined;
  }
  return false;
}

// Depth-first traversal to get all page IDs in visual (top-to-bottom) order.
function getVisualOrder(pages: Page[], parentId: string | null): string[] {
  return pages
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .flatMap((p) => [p.id, ...getVisualOrder(pages, p.id)]);
}

interface SidebarProps {
  project: Project;
  activePageId: string | null;
  readOnly?: boolean;
}

export function Sidebar({ project, activePageId, readOnly = false }: SidebarProps) {
  const { setActivePage, createPage, updatePageTitle, deletePage, reorderPages } =
    useProjectStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropState, setDropState] = useState<DropState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sorted = [...project.pages].sort((a, b) => a.order - b.order);
  const allIdsInOrder = getVisualOrder(sorted, null);

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    setDropState(null);
  }, []);

  const handleDragMove = useCallback(({ active, over }: DragMoveEvent) => {
    if (!over || active.id === over.id) { setDropState(null); return; }

    const translated = active.rect.current.translated;
    if (!translated) { setDropState(null); return; }

    const pointerY = translated.top + translated.height / 2;
    const { top, height } = over.rect;
    const ratio = (pointerY - top) / height;

    let position: DropPosition;
    if (ratio < 0.3) position = "before";
    else if (ratio > 0.7) position = "after";
    else position = "into";

    setDropState({ overId: over.id as string, position });
  }, []);

  const handleDragEnd = useCallback(
    ({ active }: DragEndEvent) => {
      const aid = active.id as string;
      setActiveId(null);

      if (!dropState || dropState.overId === aid) {
        setDropState(null);
        return;
      }

      const { overId, position } = dropState;
      const pages = project.pages;
      const activePage = pages.find((p) => p.id === aid);
      const overPage = pages.find((p) => p.id === overId);
      if (!activePage || !overPage) { setDropState(null); return; }

      if (position === "into") {
        if (wouldCreateCycle(pages, aid, overId)) { setDropState(null); return; }
        reorderPages(
          project.id,
          pages.map((p) => (p.id === aid ? { ...p, parentId: overId } : p))
        );
      } else {
        // Remove active from the flat list, insert before/after over, adopt over's parentId.
        const withoutActive = pages.filter((p) => p.id !== aid);
        const overIdx = withoutActive.findIndex((p) => p.id === overId);
        const insertAt = position === "before" ? overIdx : overIdx + 1;
        withoutActive.splice(insertAt, 0, { ...activePage, parentId: overPage.parentId });
        reorderPages(
          project.id,
          withoutActive.map((p, i) => ({ ...p, order: i }))
        );
      }

      setDropState(null);
    },
    [dropState, project.id, project.pages, reorderPages]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setDropState(null);
  }, []);

  // Search: compute matching IDs when a query is present.
  const matchingIds = searchQuery ? searchPages(sorted, searchQuery) : null;

  const renderTree = (parentId: string | null, depth: number): React.ReactNode => {
    const nodes = sorted.filter((p) => p.parentId === parentId);
    if (nodes.length === 0) return null;
    return nodes.map((page) => {
      // In search mode, hide pages that don't match (and have no matching descendants).
      if (matchingIds && !matchingIds.has(page.id)) return null;
      return (
        <div key={page.id}>
          <SidebarPageItem
            page={page}
            depth={depth}
            isActive={page.id === activePageId}
            dropPosition={dropState?.overId === page.id ? dropState.position : null}
            onSelect={setActivePage}
            onRename={(id, title) => updatePageTitle(project.id, id, title)}
            onDelete={(id) => deletePage(project.id, id)}
            onAddChild={(pid) => createPage(project.id, pid)}
            readOnly={readOnly}
          />
          {renderTree(page.id, depth + 1)}
        </div>
      );
    });
  };

  const activePage = activeId ? project.pages.find((p) => p.id === activeId) : null;

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-200 flex flex-col gap-2">
        {readOnly ? (
          // Search bar on share page
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-md">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search pages…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 text-xs leading-none">
                ×
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">Pages</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-500"
              onClick={() => createPage(project.id)}
            >
              + New page
            </Button>
          </>
        )}
      </div>

      {/* Page tree */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {project.pages.length === 0 ? (
          <p className="text-xs text-gray-400 px-2 py-4 text-center">No pages yet</p>
        ) : matchingIds !== null && matchingIds.size === 0 ? (
          <p className="text-xs text-gray-400 px-2 py-4 text-center">No results</p>
        ) : readOnly ? (
          renderTree(null, 0)
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={allIdsInOrder} strategy={verticalListSortingStrategy}>
              {renderTree(null, 0)}
            </SortableContext>

            <DragOverlay dropAnimation={null}>
              {activePage && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-md text-sm text-gray-700",
                  "opacity-95 cursor-grabbing"
                )}>
                  <span className="text-gray-400 text-xs">⠿</span>
                  <span className="truncate max-w-[160px]">{activePage.title}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </aside>
  );
}
