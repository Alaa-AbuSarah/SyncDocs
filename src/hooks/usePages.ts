"use client";

import { useState, useEffect, useCallback } from "react";
import { Page } from "@/types";
import {
  getPagesForProject,
  savePage,
  updatePage as storageUpdatePage,
  deletePage as storageDeletePage,
  updatePagesOrder as storageUpdatePagesOrder,
} from "@/lib/storage/pages";
import { generateId, slugify } from "@/lib/utils";

export function usePages(projectId: string) {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPages(getPagesForProject(projectId));
    }, 0);
    return () => clearTimeout(timeout);
  }, [projectId]);

  const createPage = useCallback(
    (title: string): Page => {
      const existingPages = getPagesForProject(projectId);
      const page: Page = {
        id: generateId(),
        projectId,
        title,
        slug: slugify(title),
        order: existingPages.length,
      };
      savePage(page);
      setPages(getPagesForProject(projectId));
      return page;
    },
    [projectId]
  );

  const updatePageTitle = useCallback(
    (id: string, title: string) => {
      storageUpdatePage(id, projectId, { title, slug: slugify(title) });
      setPages(getPagesForProject(projectId));
    },
    [projectId]
  );

  const deletePage = useCallback(
    (id: string) => {
      storageDeletePage(id, projectId);
      setPages(getPagesForProject(projectId));
    },
    [projectId]
  );

  const reorderPages = useCallback(
    (orderedIds: string[]) => {
      setPages((prev) => {
        const pagesMap = new Map(prev.map((p) => [p.id, p]));
        const updated = orderedIds
          .map((id, idx) => {
            const p = pagesMap.get(id);
            return p ? { ...p, order: idx } : null;
          })
          .filter((p): p is Page => p !== null);
        const existingIds = new Set(orderedIds);
        const remaining = prev.filter((p) => !existingIds.has(p.id));
        return [...updated, ...remaining];
      });
      storageUpdatePagesOrder(projectId, orderedIds);
    },
    [projectId]
  );

  return { pages, createPage, updatePageTitle, deletePage, reorderPages };
}
