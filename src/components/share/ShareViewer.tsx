"use client";
import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { DocsLayout } from "@/components/docs/DocsLayout";
import type { Project } from "@/types";

interface ShareViewerProps {
  project: Project;
}

export function ShareViewer({ project }: ShareViewerProps) {
  const { setActiveProject, projects } = useProjectStore();

  useEffect(() => {
    // Seed the store with this single project so DocsLayout can find it.
    // We don't call hydrate() — the visitor may not be authenticated.
    useProjectStore.setState((s) => ({
      projects: [project, ...s.projects.filter((p) => p.id !== project.id)],
    }));
    setActiveProject(project.id);
  }, [project, setActiveProject]);

  const loaded = projects.find((p) => p.id === project.id);
  if (!loaded) return null;

  return <DocsLayout projectId={project.id} readOnly />;
}
