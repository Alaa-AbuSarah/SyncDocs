"use client";

import { useState, useEffect, useCallback } from "react";
import { Page } from "@/types";
import {
  getPagesForProject,
  savePage,
  updatePage as storageUpdatePage,
  deletePage as storageDeletePage,
} from "@/lib/storage/pages";
import { generateId, slugify } from "@/lib/utils";

export function usePages(projectId: string) {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    setPages(getPagesForProject(projectId));
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

  return { pages, createPage, updatePageTitle, deletePage };
}
