"use client";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import { useProjectStore } from "@/store/useProjectStore";
import { Button } from "@/components/shared/Button";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const pageCount = project.pages.length;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id);
    }
  };

  return (
    <div
      onClick={() => router.push(`/docs/${project.id}`)}
      className="group relative bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-sm">{project.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">/{project.slug}</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 shrink-0"
        >
          Delete
        </Button>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-400">
        <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
      </div>
    </div>
  );
}
