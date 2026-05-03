import crypto from "crypto";
import type { Block, BlockType } from "@/types";

export interface ParsedFile {
  path: string;
  title: string;
  blocks: Block[];
  /** Directory segments above the file, e.g. ["api", "users"] for api/users/profile.md */
  pathSegments: string[];
}

export function parseFiles(
  files: { path: string; content: string }[]
): ParsedFile[] {
  return files.map(({ path, content }) => parseFile(path, content));
}

function parseFile(path: string, content: string): ParsedFile {
  // Normalise separators and strip .md extension
  const normalised = path.replace(/\\/g, "/").replace(/\.md$/i, "");
  const segments = normalised.split("/").filter(Boolean);
  const pathSegments = segments.slice(0, -1);
  const title = extractTitle(content) ?? segments[segments.length - 1];
  const blocks = parseBlocks(content);

  return { path, title, blocks, pathSegments };
}

// ─── Title extraction ────────────────────────────────────────────────────────

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

// ─── Markdown → Block[] ──────────────────────────────────────────────────────

function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block
    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || null;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      blocks.push(makeBlock("codeBlock", codeLines.join("\n"), { language }));
      continue;
    }

    // ATX heading (H1–H3 only; H4+ become H3)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 3) as 1 | 2 | 3;
      blocks.push(makeBlock("heading", headingMatch[2].trim(), { level }));
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      blocks.push(makeBlock("blockquote", line.slice(2).trim()));
      i++;
      continue;
    }

    // Unordered list (accumulate consecutive items)
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s/, "").trim());
        i++;
      }
      blocks.push(makeBlock("list", items.join("\n")));
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, "").trim());
        i++;
      }
      blocks.push(makeBlock("orderedList", items.join("\n")));
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      blocks.push(makeBlock("divider", ""));
      i++;
      continue;
    }

    // Paragraph — accumulate adjacent non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isSpecialLine(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      blocks.push(makeBlock("paragraph", paraLines.join(" ")));
    }
  }

  return blocks.filter((b) => b.content.trim() || b.type === "divider");
}

function isSpecialLine(line: string): boolean {
  return (
    /^#{1,6}\s/.test(line) ||
    line.startsWith("```") ||
    /^[-*+]\s/.test(line) ||
    /^\d+\.\s/.test(line) ||
    line.startsWith("> ") ||
    /^[-*_]{3,}\s*$/.test(line)
  );
}

function makeBlock(
  type: BlockType,
  content: string,
  meta?: Block["meta"]
): Block {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    ...(meta !== undefined ? { meta } : {}),
  };
}

// ─── Deterministic page ID ───────────────────────────────────────────────────

/**
 * Generates a stable UUID-shaped ID for a given (projectId, filePath) pair.
 * The same inputs always produce the same output, enabling reliable upserts
 * without needing a slug column on the pages table.
 */
export function deterministicPageId(
  projectId: string,
  filePath: string
): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${projectId}:${filePath}`)
    .digest("hex");

  // Shape into UUID v4 format (variant bits set correctly)
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16),
    ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16) + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join("-");
}
