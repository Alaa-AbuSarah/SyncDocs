import { Project } from "@/types";
import { KEYS } from "./keys";
import { getPagesForProject } from "./pages";
import { getBlocksForPage, deleteBlock } from "./blocks";

export function getAllProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.projects);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Project): void {
  const projects = getAllProjects();
  const existing = projects.findIndex((p) => p.id === project.id);
  if (existing >= 0) {
    projects[existing] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(KEYS.projects, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const pages = getPagesForProject(id);
  for (const page of pages) {
    const blocks = getBlocksForPage(page.id);
    for (const block of blocks) {
      deleteBlock(block.id, page.id);
    }
    localStorage.removeItem(KEYS.pages(id));
  }
  const projects = getAllProjects().filter((p) => p.id !== id);
  localStorage.setItem(KEYS.projects, JSON.stringify(projects));
}
