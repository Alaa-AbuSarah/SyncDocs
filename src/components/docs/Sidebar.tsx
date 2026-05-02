"use client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { Project } from "@/types";
import { SidebarPageItem } from "./SidebarPageItem";
import { Button } from "@/components/shared/Button";
import { useProjectStore } from "@/store/useProjectStore";

interface SidebarProps {
  project: Project;
  activePageId: string | null;
  readOnly?: boolean;
}

export function Sidebar({ project, activePageId, readOnly = false }: SidebarProps) {
  const { setActivePage, createPage, updatePageTitle, deletePage, reorderPages } =
    useProjectStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = project.pages.map((p) => p.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const reordered = arrayMove(project.pages, oldIndex, newIndex).map(
      (p, i) => ({ ...p, order: i })
    );
    reorderPages(project.id, reordered);
  };

  const sorted = [...project.pages].sort((a, b) => a.order - b.order);

  const renderTree = (parentId: string | null, depth: number): React.ReactNode => {
    const nodes = sorted.filter((p) => p.parentId === parentId);
    if (nodes.length === 0) return null;

    return (
      <SortableContext
        items={nodes.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        {nodes.map((page) => (
          <div key={page.id}>
            <SidebarPageItem
              page={page}
              depth={depth}
              isActive={page.id === activePageId}
              onSelect={setActivePage}
              onRename={(id, title) => updatePageTitle(project.id, id, title)}
              onDelete={(id) => deletePage(project.id, id)}
              onAddChild={(parentId) => createPage(project.id, parentId)}
            />
            {renderTree(page.id, depth + 1)}
          </div>
        ))}
      </SortableContext>
    );
  };

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-hidden">
      <div className="px-3 py-3 border-b border-gray-200">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1 mb-2">
          Pages
        </p>
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-500"
            onClick={() => createPage(project.id)}
          >
            + New page
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {project.pages.length === 0 ? (
          <p className="text-xs text-gray-400 px-2 py-4 text-center">
            No pages yet
          </p>
        ) : readOnly ? (
          renderTree(null, 0)
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {renderTree(null, 0)}
          </DndContext>
        )}
      </div>
    </aside>
  );
}
