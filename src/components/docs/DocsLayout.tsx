"use client";
import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PageTitleEditor } from "./PageTitleEditor";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Block } from "@/types";

interface DocsLayoutProps {
  projectId: string;
  readOnly?: boolean;
  // For read-only share page, project is passed directly without hydrate
  preloadedProjectId?: string;
}

export function DocsLayout({ projectId, readOnly = false }: DocsLayoutProps) {
  const { projects, hydrate, activePageId, setActivePage, updatePageTitle, updateBlocks } =
    useProjectStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const project = projects.find((p) => p.id === projectId);

  // Auto-select first page
  useEffect(() => {
    if (project && !activePageId && project.pages.length > 0) {
      setActivePage(project.pages[0].id);
    }
  }, [project, activePageId, setActivePage]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState title="Project not found" description="This project may have been deleted." />
      </div>
    );
  }

  const activePage = project.pages.find((p) => p.id === activePageId);

  const handleBlocksChange = (blocks: Block[]) => {
    if (!activePage || readOnly) return;
    updateBlocks(project.id, activePage.id, blocks);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar project={project} readOnly={readOnly} />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          project={project}
          activePageId={activePageId}
          readOnly={readOnly}
        />

        <main className="flex-1 overflow-y-auto">
          {activePage ? (
            <div className="max-w-3xl mx-auto px-10 py-10">
              <PageTitleEditor
                page={activePage}
                onRename={(id, title) => updatePageTitle(project.id, id, title)}
                readOnly={readOnly}
              />
              <BlockEditor
                pageId={activePage.id}
                blocks={activePage.blocks}
                onChange={handleBlocksChange}
                readOnly={readOnly}
              />
            </div>
          ) : (
            <EmptyState
              icon="📝"
              title="No page selected"
              description={
                readOnly
                  ? "Select a page from the sidebar."
                  : "Select a page or create one in the sidebar."
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
