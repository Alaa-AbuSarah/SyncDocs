import { createClient } from "@supabase/supabase-js";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface AgentAuthResult {
  userId: string;
  projectId: string;
}

/**
 * Confirms that projectId exists in the DB and belongs to userId.
 * Both values come directly from the request — no keys table needed.
 */
export async function validateAgentRequest(
  userId: string,
  projectId: string
): Promise<AgentAuthResult> {
  const supabase = serviceClient();

  const { data: project, error } = await supabase
    .from("SyncDocs_projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error || !project) {
    throw new Error("Project not found or access denied");
  }

  return { userId, projectId };
}
