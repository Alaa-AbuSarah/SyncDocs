import { createClient } from "@/lib/supabase/server";
import { fetchProjectBySlug } from "@/lib/db";
import { ShareViewer } from "@/components/share/ShareViewer";
import { EmptyState } from "@/components/shared/EmptyState";

interface Props {
  params: Promise<{ userId: string; projectSlug: string }>;
}

export default async function SharePage({ params }: Props) {
  const { userId, projectSlug } = await params;
  const supabase = await createClient();

  const project = await fetchProjectBySlug(supabase, userId, projectSlug);

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

  return <ShareViewer project={project} />;
}
