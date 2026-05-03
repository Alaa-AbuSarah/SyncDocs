import type { Project, Page, Block } from "@/types";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// DB row shapes
// ---------------------------------------------------------------------------

interface DBProject {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface DBPage {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  order: number;
  blocks: Block[];
  updated_at: string;
}

function dbPageToPage(row: DBPage): Page {
  return {
    id: row.id,
    title: row.title,
    parentId: row.parent_id,
    order: row.order,
    blocks: row.blocks ?? [],
  };
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function fetchProjects(userId: string): Promise<Project[]> {
  const supabase = createClient();

  const { data: projectRows, error: pErr } = await supabase
    .from("SyncDocs_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (pErr) throw pErr;
  if (!projectRows?.length) return [];

  const projectIds = (projectRows as DBProject[]).map((p) => p.id);

  const { data: pageRows, error: pgErr } = await supabase
    .from("SyncDocs_pages")
    .select("*")
    .in("project_id", projectIds)
    .order("order", { ascending: true });

  if (pgErr) throw pgErr;

  return (projectRows as DBProject[]).map((p): Project => {
    const pages = ((pageRows ?? []) as DBPage[]).filter((pg) => pg.project_id === p.id);
    const latestPageMs = pages.reduce(
      (max, pg) => Math.max(max, new Date(pg.updated_at).getTime()),
      0
    );
    const updatedAt = Math.max(new Date(p.updated_at).getTime(), latestPageMs);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      createdAt: new Date(p.created_at).getTime(),
      updatedAt,
      pages: pages.map(dbPageToPage),
    };
  });
}

export async function insertProject(
  userId: string,
  name: string,
  slug: string
): Promise<Project> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("SyncDocs_projects")
    .insert({ user_id: userId, name, slug })
    .select()
    .single();

  if (error) throw error;
  const row = data as DBProject;
  const now = new Date(row.created_at).getTime();
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: now,
    updatedAt: now,
    pages: [],
  };
}

export async function updateProjectSlugInDB(id: string, slug: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("SyncDocs_projects")
    .update({ slug })
    .eq("id", id);
  if (error) throw error;
}

export async function removeProject(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("SyncDocs_projects")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export async function insertPage(projectId: string, page: Page): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("SyncDocs_pages").insert({
    id: page.id,
    project_id: projectId,
    parent_id: page.parentId,
    title: page.title,
    order: page.order,
    blocks: page.blocks,
  });
  if (error) throw error;
}

export async function updatePage(projectId: string, page: Page): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("SyncDocs_pages")
    .update({
      parent_id: page.parentId,
      title: page.title,
      order: page.order,
      blocks: page.blocks,
    })
    .eq("id", page.id)
    .eq("project_id", projectId);
  if (error) throw error;
}

export async function updatePagesBatch(projectId: string, pages: Page[]): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("SyncDocs_pages").upsert(
    pages.map((p) => ({
      id: p.id,
      project_id: projectId,
      parent_id: p.parentId,
      title: p.title,
      order: p.order,
      blocks: p.blocks,
    }))
  );
  if (error) throw error;
}

export async function removePage(pageId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("SyncDocs_pages")
    .delete()
    .eq("id", pageId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Share page — accepts a pre-created server client to stay server-safe
// ---------------------------------------------------------------------------

// Using unknown here so the server client type doesn't need to be imported in db.ts
export async function fetchProjectBySlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  slug: string
): Promise<Project | null> {
  const { data: projectRow, error: pErr } = await supabase
    .from("SyncDocs_projects")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .single();

  if (pErr || !projectRow) return null;

  const { data: pageRows, error: pgErr } = await supabase
    .from("SyncDocs_pages")
    .select("*")
    .eq("project_id", projectRow.id)
    .order("order", { ascending: true });

  if (pgErr) return null;

  const pages = (pageRows ?? []) as DBPage[];
  const latestPageMs = pages.reduce(
    (max, pg) => Math.max(max, new Date(pg.updated_at).getTime()),
    0
  );
  return {
    id: projectRow.id,
    name: projectRow.name,
    slug: projectRow.slug,
    createdAt: new Date(projectRow.created_at).getTime(),
    updatedAt: Math.max(new Date(projectRow.updated_at).getTime(), latestPageMs),
    pages: pages.map(dbPageToPage),
  };
}
