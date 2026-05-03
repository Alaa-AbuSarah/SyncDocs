import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocsLayout } from "@/components/docs/DocsLayout";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function DocsPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const displayName = (user.user_metadata?.full_name ?? user.email ?? "") as string;

  return (
    <DocsLayout
      projectId={projectId}
      userId={user.id}
      avatarUrl={avatarUrl}
      displayName={displayName}
    />
  );
}
