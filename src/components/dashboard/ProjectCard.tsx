"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import { useProjectStore } from "@/store/useProjectStore";
import { DeleteProjectModal } from "@/components/dashboard/DeleteProjectModal";

interface ProjectCardProps {
  project: Project;
}

function formatDate(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ms);
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const pageCount = project.pages.length;
  const [showDelete, setShowDelete] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDelete(true);
  };

  return (
    <div
      onClick={() => router.push(`/docs/${project.id}`)}
      className="group relative bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-150 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        {/* Icon + name */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm leading-snug">{project.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">/{project.slug}</p>
          </div>
        </div>

        {/* Delete — only on hover */}
        <button
          onClick={handleDeleteClick}
          title="Delete project"
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {/* Stats footer */}
      <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-2">
        <Stat
          icon={
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          label="Pages"
          value={String(pageCount)}
        />
        <Stat
          icon={
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          label="Created"
          value={formatDate(project.createdAt)}
        />
        <Stat
          icon={
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="Updated"
          value={timeAgo(project.updatedAt)}
        />
      </div>

      <DeleteProjectModal
        open={showDelete}
        projectName={project.name}
        onConfirm={() => deleteProject(project.id)}
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-gray-400">
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <span className="text-xs font-medium text-gray-700 truncate">{value}</span>
    </div>
  );
}
