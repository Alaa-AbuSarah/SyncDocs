import type { Project } from "@/types";

const KEY = "syncdocs_projects";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function updateProject(updated: Project): void {
  const all = getProjects();
  saveProjects(all.map((p) => (p.id === updated.id ? updated : p)));
}

export function deleteProject(id: string): void {
  saveProjects(getProjects().filter((p) => p.id !== id));
}
