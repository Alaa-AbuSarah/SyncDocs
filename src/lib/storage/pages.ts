import { Page } from "@/types";
import { KEYS } from "./keys";
import { getBlocksForPage, deleteBlock } from "./blocks";

export function getPagesForProject(projectId: string): Page[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.pages(projectId));
    const pages: Page[] = raw ? JSON.parse(raw) : [];
    return pages.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function savePage(page: Page): void {
  const pages = getPagesForProject(page.projectId);
  const existing = pages.findIndex((p) => p.id === page.id);
  if (existing >= 0) {
    pages[existing] = page;
  } else {
    pages.push(page);
  }
  localStorage.setItem(KEYS.pages(page.projectId), JSON.stringify(pages));
}

export function updatePage(
  id: string,
  projectId: string,
  updates: Partial<Page>
): void {
  const pages = getPagesForProject(projectId);
  const idx = pages.findIndex((p) => p.id === id);
  if (idx >= 0) {
    pages[idx] = { ...pages[idx], ...updates };
    localStorage.setItem(KEYS.pages(projectId), JSON.stringify(pages));
  }
}

export function deletePage(id: string, projectId: string): void {
  const blocks = getBlocksForPage(id);
  for (const block of blocks) {
    deleteBlock(block.id, id);
  }
  const pages = getPagesForProject(projectId).filter((p) => p.id !== id);
  localStorage.setItem(KEYS.pages(projectId), JSON.stringify(pages));
}

export function updatePagesOrder(projectId: string, orderedPageIds: string[]): void {
  const pages = getPagesForProject(projectId);
  const pagesMap = new Map(pages.map((p) => [p.id, p]));
  
  const updatedPages = orderedPageIds
    .map((id, index) => {
      const page = pagesMap.get(id);
      return page ? { ...page, order: index } : null;
    })
    .filter((p): p is Page => p !== null);

  const existingIds = new Set(orderedPageIds);
  const remaining = pages.filter((p) => !existingIds.has(p.id));
  
  const finalPages = [...updatedPages, ...remaining];
  
  localStorage.setItem(KEYS.pages(projectId), JSON.stringify(finalPages));
}
