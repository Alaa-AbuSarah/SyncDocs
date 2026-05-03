"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/useProjectStore";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { Button } from "@/components/shared/Button";
import { createClient } from "@/lib/supabase/client";
import { createDemoProjects } from "@/lib/createDemoProjects";

interface DashboardClientProps {
  userId: string;
  avatarUrl?: string;
  displayName?: string;
}

export function DashboardClient({ userId, avatarUrl, displayName }: DashboardClientProps) {
  const { projects, hydrate, loading } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    hydrate(userId);
  }, [hydrate, userId]);

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      await createDemoProjects(userId);
      await hydrate(userId);
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
  };

  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SyncDocs" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-gray-900">SyncDocs</span>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setShowCreate(true)}>+ New project</Button>

            {/* Avatar + Logout icon */}
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName ?? "User avatar"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-white text-[10px] font-semibold">{initials}</span>
                )}
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {loading ? (
          <p className="text-sm text-gray-400">Loading projects…</p>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-gray-900">No projects yet</p>
                  <p className="text-sm text-gray-400">Create a blank project or load demo content to explore.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={() => setShowCreate(true)}>New project</Button>
                  <div className="hidden sm:block w-px h-4 bg-gray-200" />
                  <button
                    onClick={handleLoadDemo}
                    disabled={loadingDemo}
                    className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    {loadingDemo ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Loading demo…
                      </>
                    ) : (
                      "Load demo projects"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
