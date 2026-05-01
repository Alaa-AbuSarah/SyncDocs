"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { getAllProjects } from "@/lib/storage/projects";
import { DocsLayout } from "@/components/docs/DocsLayout";

interface Params {
  projectId: string;
  pageId: string;
}

export default function SharePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectId, pageId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const projects = getAllProjects();
    const found = projects.find((p) => p.id === projectId);
    if (!found) {
      router.replace("/");
    } else {
      setProject(found);
    }
  }, [projectId, router]);

  if (!project) return null;

  return (
    <DocsLayout project={project} initialPageId={pageId} isReadOnly={true} />
  );
}
