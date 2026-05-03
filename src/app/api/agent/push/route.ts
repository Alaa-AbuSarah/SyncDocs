import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agent/auth";
import { parseFiles } from "@/lib/agent/parser";
import { upsertPages } from "@/lib/agent/pages";

interface PushFile {
  path: string;
  content: string;
}

interface PushRequestBody {
  project_id: string;
  files: PushFile[];
}

export async function POST(req: NextRequest) {
  try {
    // ── user_id from Authorization header ─────────────────────────────────
    const authHeader = req.headers.get("authorization") ?? "";
    const userId = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing Authorization header (expected: Bearer <user_id>)" },
        { status: 401 }
      );
    }

    // ── Body validation ────────────────────────────────────────────────────
    let body: PushRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { project_id, files } = body;

    if (!project_id || typeof project_id !== "string") {
      return NextResponse.json(
        { error: "project_id is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "files must be a non-empty array" },
        { status: 400 }
      );
    }

    for (const f of files) {
      if (typeof f.path !== "string" || typeof f.content !== "string") {
        return NextResponse.json(
          { error: "Each file must have a string path and content" },
          { status: 400 }
        );
      }
    }

    // ── Verify ownership ───────────────────────────────────────────────────
    const { projectId } = await validateAgentRequest(userId, project_id);

    // ── Parse markdown → blocks ────────────────────────────────────────────
    const parsedFiles = parseFiles(files);

    // ── Upsert into DB ─────────────────────────────────────────────────────
    const result = await upsertPages(projectId, parsedFiles);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";

    if (message === "Project not found or access denied") {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    console.error("[agent/push]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
