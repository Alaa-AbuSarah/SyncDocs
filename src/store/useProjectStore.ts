import { create } from "zustand";
import type { Project, Page, Block } from "@/types";
import { slugify, isSlugUnique } from "@/lib/utils";
import {
  fetchProjects,
  insertProject,
  updateProjectSlugInDB,
  removeProject,
  insertPage,
  updatePage,
  updatePagesBatch,
  removePage,
} from "@/lib/db";

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  activePageId: string | null;
  userId: string | null;
  loading: boolean;

  hydrate: (userId: string) => Promise<void>;

  // Projects
  createProject: (name: string, customSlug?: string) => Promise<Project>;
  deleteProject: (id: string) => void;
  updateProjectSlug: (id: string, slug: string) => boolean;
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
  userId: null,
  loading: false,

  async hydrate(userId) {
    set({ loading: true, userId });
    try {
      const projects = await fetchProjects(userId);
      set({ projects, loading: false });
    } catch (err) {
      console.error("hydrate error", err);
      set({ loading: false });
    }
  },

  async createProject(name, customSlug) {
    const slug = customSlug?.trim() || slugify(name) || crypto.randomUUID().slice(0, 8);
    const userId = get().userId!;
    const project = await insertProject(userId, name, slug);
    set({ projects: [...get().projects, project] });
    return project;
  },

  deleteProject(id) {
    set({
      projects: get().projects.filter((p) => p.id !== id),
      activeProjectId: null,
      activePageId: null,
    });
    removeProject(id).catch(console.error);
  },

  updateProjectSlug(id, slug) {
    if (!isSlugUnique(slug, get().projects, id)) return false;
    set({
      projects: get().projects.map((p) => (p.id === id ? { ...p, slug } : p)),
    });
    updateProjectSlugInDB(id, slug).catch(console.error);
    return true;
  },

  setActiveProject(id) {
    set({ activeProjectId: id });
  },

  createPage(projectId, parentId = null) {
    const page: Page = {
      id: crypto.randomUUID(),
      title: "Untitled",
      parentId,
      order: Date.now(),
      blocks: [],
    };
    set({
      projects: get().projects.map((p) =>
        p.id === projectId ? { ...p, pages: [...p.pages, page] } : p
      ),
      activePageId: page.id,
    });
    insertPage(projectId, page).catch(console.error);
    return page;
  },

  updatePageTitle(projectId, pageId, title) {
    const projects = get().projects.map((p) =>
      p.id === projectId
        ? { ...p, pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, title } : pg)) }
        : p
    );
    set({ projects });
    const page = projects
      .find((p) => p.id === projectId)
      ?.pages.find((pg) => pg.id === pageId);
    if (page) updatePage(projectId, page).catch(console.error);
  },

  deletePage(projectId, pageId) {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;

    const toDelete = new Set<string>();
    const collect = (id: string) => {
      toDelete.add(id);
      project.pages.filter((pg) => pg.parentId === id).forEach((pg) => collect(pg.id));
    };
    collect(pageId);

    const currentActiveId = get().activePageId;
    set({
      projects: get().projects.map((p) =>
        p.id === projectId
          ? { ...p, pages: p.pages.filter((pg) => !toDelete.has(pg.id)) }
          : p
      ),
      activePageId: currentActiveId && toDelete.has(currentActiveId) ? null : currentActiveId,
    });
    // DB cascade handles children via FK; only delete the root
    removePage(pageId).catch(console.error);
  },

  reorderPages(projectId, pages) {
    set({
      projects: get().projects.map((p) => (p.id === projectId ? { ...p, pages } : p)),
    });
    updatePagesBatch(projectId, pages).catch(console.error);
  },

  setActivePage(id) {
    set({ activePageId: id });
  },

  updateBlocks(projectId, pageId, blocks) {
    const projects = get().projects.map((p) =>
      p.id === projectId
        ? { ...p, pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, blocks } : pg)) }
        : p
    );
    set({ projects });
    const page = projects
      .find((p) => p.id === projectId)
      ?.pages.find((pg) => pg.id === pageId);
    if (page) updatePage(projectId, page).catch(console.error);
  },
}));
