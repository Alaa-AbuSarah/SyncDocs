import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Project, Page, Block } from "@/types";
import {
  getProjects,
  saveProjects,
  updateProject as persistUpdate,
  deleteProject as persistDelete,
} from "@/lib/storage";
import { slugify } from "@/lib/utils";

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  activePageId: string | null;

  // Hydrate from localStorage
  hydrate: () => void;

  // Projects
  createProject: (name: string) => Project;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;

  // Pages
  createPage: (projectId: string, parentId?: string | null) => Page;
  updatePageTitle: (projectId: string, pageId: string, title: string) => void;
  deletePage: (projectId: string, pageId: string) => void;
  reorderPages: (projectId: string, pages: Page[]) => void;
  setActivePage: (id: string | null) => void;

  // Blocks
  updateBlocks: (projectId: string, pageId: string, blocks: Block[]) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  activePageId: null,

  hydrate() {
    set({ projects: getProjects() });
  },

  createProject(name) {
    const project: Project = {
      id: nanoid(),
      name,
      slug: slugify(name) || nanoid(6),
      createdAt: Date.now(),
      pages: [],
    };
    const projects = [...get().projects, project];
    set({ projects });
    saveProjects(projects);
    return project;
  },

  deleteProject(id) {
    const projects = get().projects.filter((p) => p.id !== id);
    set({ projects, activeProjectId: null, activePageId: null });
    persistDelete(id);
  },

  setActiveProject(id) {
    set({ activeProjectId: id });
  },

  createPage(projectId, parentId = null) {
    const page: Page = {
      id: nanoid(),
      title: "Untitled",
      parentId,
      order: Date.now(),
      blocks: [],
    };
    const projects = get().projects.map((p) =>
      p.id === projectId ? { ...p, pages: [...p.pages, page] } : p
    );
    set({ projects, activePageId: page.id });
    const updated = projects.find((p) => p.id === projectId)!;
    persistUpdate(updated);
    return page;
  },

  updatePageTitle(projectId, pageId, title) {
    const projects = get().projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            pages: p.pages.map((pg) =>
              pg.id === pageId ? { ...pg, title } : pg
            ),
          }
        : p
    );
    set({ projects });
    persistUpdate(projects.find((p) => p.id === projectId)!);
  },

  deletePage(projectId, pageId) {
    // Also delete all descendants
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;

    const toDelete = new Set<string>();
    const collect = (id: string) => {
      toDelete.add(id);
      project.pages
        .filter((pg) => pg.parentId === id)
        .forEach((pg) => collect(pg.id));
    };
    collect(pageId);

    const projects = get().projects.map((p) =>
      p.id === projectId
        ? { ...p, pages: p.pages.filter((pg) => !toDelete.has(pg.id)) }
        : p
    );
    set({
      projects,
      activePageId:
        get().activePageId && toDelete.has(get().activePageId!)
          ? null
          : get().activePageId,
    });
    persistUpdate(projects.find((p) => p.id === projectId)!);
  },

  reorderPages(projectId, pages) {
    const projects = get().projects.map((p) =>
      p.id === projectId ? { ...p, pages } : p
    );
    set({ projects });
    persistUpdate(projects.find((p) => p.id === projectId)!);
  },

  setActivePage(id) {
    set({ activePageId: id });
  },

  updateBlocks(projectId, pageId, blocks) {
    const projects = get().projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            pages: p.pages.map((pg) =>
              pg.id === pageId ? { ...pg, blocks } : pg
            ),
          }
        : p
    );
    set({ projects });
    persistUpdate(projects.find((p) => p.id === projectId)!);
  },
}));
