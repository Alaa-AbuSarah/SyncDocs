"use client";
import { use, useEffect, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { EmptyState } from "@/components/shared/EmptyState";

interface Props {
  params: Promise<{ userId: string; projectSlug: string }>;
}

export default function SharePage({ params }: Props) {
  const { projectSlug } = use(params);
  const { projects, hydrate } = useProjectStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  if (!ready) return null;

  const project = projects.find((p) => p.slug === projectSlug);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon="🔍"
          title="Project not found"
          description="This shared link may be invalid or the project was deleted."
        />
      </div>
    );
  }

  return <DocsLayout projectId={project.id} readOnly />;
}
