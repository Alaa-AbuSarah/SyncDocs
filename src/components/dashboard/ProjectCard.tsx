"use client";

import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
      onClick={() => onOpen(project.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {project.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          title="Delete project"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex items-center gap-1 text-gray-400">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <span className="text-xs">Documentation</span>
      </div>
    </div>
  );
}
