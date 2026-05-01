"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/shared/Button";
import { getPagesForProject, savePage } from "@/lib/storage/pages";
import { saveBlock } from "@/lib/storage/blocks";
import { generateId, slugify } from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const { projects, createProject, deleteProject } = useProjects();
  const [showModal, setShowModal] = useState(false);

  const handleOpen = (projectId: string) => {
    const pages = getPagesForProject(projectId);
    if (pages.length > 0) {
      router.push(`/docs/${projectId}/${pages[0].id}`);
    } else {
      const page = {
        id: generateId(),
        projectId,
        title: "Getting Started",
        slug: slugify("Getting Started"),
        order: 0,
      };
      savePage(page);
      saveBlock({
        id: generateId(),
        pageId: page.id,
        type: "text",
        content: { html: "" },
        order: 0,
        isDynamic: false,
      });
      router.push(`/docs/${projectId}/${page.id}`);
    }
  };

  const handleCreate = (name: string) => {
    const project = createProject(name);
    handleOpen(project.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            SyncDocs
          </span>
          <Button onClick={() => setShowModal(true)}>New project</Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to start writing documentation."
            action={{
              label: "Create a project",
              onClick: () => setShowModal(true),
            }}
          />
        ) : (
          <>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              All projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={handleOpen}
                  onDelete={deleteProject}
                />
              ))}
              <button
                onClick={() => setShowModal(true)}
                className="border border-dashed border-gray-300 rounded-xl p-5 text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors text-left flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                New project
              </button>
            </div>
          </>
        )}
      </main>

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
