import { clsx, type ClassValue } from "clsx";
import type { Project, Page } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isSlugUnique(
  slug: string,
  projects: Project[],
  excludeId?: string
): boolean {
  return !projects.some((p) => p.slug === slug && p.id !== excludeId);
}

// Returns the set of page IDs whose title or block content matches the query.
export function searchPages(pages: Page[], query: string): Set<string> {
  const q = query.trim().toLowerCase();
  if (!q) return new Set();
  return new Set(
    pages
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.blocks.some((b) => b.content.toLowerCase().includes(q))
      )
      .map((p) => p.id)
  );
}
