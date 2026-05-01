"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { usePages } from "@/hooks/usePages";
import { EmptyState } from "@/components/shared/EmptyState";
import { saveBlock } from "@/lib/storage/blocks";
import { getBlocksForPage } from "@/lib/storage/blocks";
import { generateId } from "@/lib/utils";

interface DocsLayoutProps {
  project: Project;
  initialPageId: string;
  isReadOnly: boolean;
}

export function DocsLayout({
  project,
  initialPageId,
  isReadOnly: initialReadOnly,
}: DocsLayoutProps) {
  const router = useRouter();
  const { pages, createPage, updatePageTitle, deletePage, reorderPages } = usePages(
    project.id
  );
  const [activePageId, setActivePageId] = useState(initialPageId);
  const [isReadOnly, setIsReadOnly] = useState(initialReadOnly);

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pages.length > 0 && !pages.find((p) => p.id === activePageId)) {
        setActivePageId(pages[0].id);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [pages, activePageId]);

  const ensureHasTextBlock = (pageId: string) => {
    const blocks = getBlocksForPage(pageId);
    if (blocks.length === 0) {
      saveBlock({
        id: generateId(),
        pageId,
        type: "text",
        content: { html: "" },
        order: 0,
        isDynamic: false,
      });
    }
  };

  const handleSelectPage = (id: string) => {
    setActivePageId(id);
    if (!isReadOnly) {
      router.push(`/docs/${project.id}/${id}`, { scroll: false });
    }
  };

  const handleCreatePage = () => {
    const page = createPage("Untitled");
    ensureHasTextBlock(page.id);
    setActivePageId(page.id);
    router.push(`/docs/${project.id}/${page.id}`, { scroll: false });
  };

  const handleDeletePage = (id: string) => {
    const remaining = pages.filter((p) => p.id !== id);
    deletePage(id);
    if (id === activePageId && remaining.length > 0) {
      const next = remaining[0];
      setActivePageId(next.id);
      router.push(`/docs/${project.id}/${next.id}`, { scroll: false });
    }
  };

  const handleTitleChange = (title: string) => {
    if (!activePage) return;
    updatePageTitle(activePage.id, title);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        project={project}
        pages={pages}
        activePageId={activePage?.id ?? ""}
        onSelectPage={handleSelectPage}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        onReorderPages={reorderPages}
        isReadOnly={isReadOnly}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {activePage ? (
          <>
            <TopBar
              page={activePage}
              projectId={project.id}
              isReadOnly={isReadOnly}
              onToggleMode={() => setIsReadOnly((v) => !v)}
              onTitleChange={handleTitleChange}
            />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-[740px] mx-auto px-8 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
                  {activePage.title}
                </h1>
                <BlockEditor
                  pageId={activePage.id}
                  isReadOnly={isReadOnly}
                />
              </div>
            </main>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              title="No pages yet"
              description="Create your first page to start writing."
              action={
                !isReadOnly
                  ? { label: "Add a page", onClick: handleCreatePage }
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
