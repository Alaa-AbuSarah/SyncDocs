import { createClient } from "@supabase/supabase-js";
import type { Block } from "@/types";
import { deterministicPageId, type ParsedFile } from "./parser";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface UpsertResult {
  created: number;
  updated: number;
}

interface PageRow {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  order: number;
  blocks: Block[];
}

/**
 * Upserts all pages (including intermediate folder pages) for a push.
 * Uses deterministic IDs so the same file path always maps to the same row,
 * making repeated pushes idempotent without needing a slug column.
 */
export async function upsertPages(
  projectId: string,
  parsedFiles: ParsedFile[]
): Promise<UpsertResult> {
  const supabase = serviceClient();

  // Snapshot existing page IDs to distinguish created vs updated
  const { data: existing, error: fetchErr } = await supabase
    .from("SyncDocs_pages")
    .select("id")
    .eq("project_id", projectId);

  if (fetchErr) throw fetchErr;

  const existingIds = new Set(
    (existing ?? []).map((r: { id: string }) => r.id)
  );

  // Build the full list of rows to upsert (files + folder stubs)
  const rows = buildRows(projectId, parsedFiles);

  const { error: upsertErr } = await supabase
    .from("SyncDocs_pages")
    .upsert(rows, { onConflict: "id" });

  if (upsertErr) throw upsertErr;

  let created = 0;
  let updated = 0;
  for (const row of rows) {
    existingIds.has(row.id) ? updated++ : created++;
  }

  return { created, updated };
}

/**
 * Builds the flat list of DB rows for the upsert, including any intermediate
 * folder pages required to satisfy parent_id constraints.
 *
 * Example for ["README.md", "api/auth.md", "api/users/profile.md"]:
 *   - README          (root)
 *   - api/            (root,  folder stub)
 *   - api/auth        (child of api/)
 *   - api/users/      (child of api/, folder stub)
 *   - api/users/profile (child of api/users/)
 */
function buildRows(projectId: string, files: ParsedFile[]): PageRow[] {
  const rows: PageRow[] = [];
  // Tracks folder paths already added so we don't duplicate them
  const seenFolders = new Set<string>();

  // Process shallower paths first so parent rows precede child rows
  const sorted = [...files].sort(
    (a, b) => a.pathSegments.length - b.pathSegments.length
  );

  for (const file of sorted) {
    // Ensure every ancestor folder has a stub page
    for (let depth = 0; depth < file.pathSegments.length; depth++) {
      const folderPath = file.pathSegments.slice(0, depth + 1).join("/");
      if (seenFolders.has(folderPath)) continue;
      seenFolders.add(folderPath);

      const parentFolderPath =
        depth === 0
          ? null
          : file.pathSegments.slice(0, depth).join("/");

      rows.push({
        id: deterministicPageId(projectId, folderPath),
        project_id: projectId,
        parent_id: parentFolderPath
          ? deterministicPageId(projectId, parentFolderPath)
          : null,
        title: file.pathSegments[depth],
        order: rows.length,
        blocks: [],
      });
    }

    // The file page itself
    const parentPath =
      file.pathSegments.length > 0
        ? file.pathSegments.join("/")
        : null;

    rows.push({
      id: deterministicPageId(projectId, file.path),
      project_id: projectId,
      parent_id: parentPath
        ? deterministicPageId(projectId, parentPath)
        : null,
      title: file.title,
      order: rows.length,
      blocks: file.blocks,
    });
  }

  return rows;
}
