"use client";
import { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Block } from "@/types";
import { nanoid } from "nanoid";

interface BlockEditorProps {
  pageId: string;
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
}

function blocksToDoc(blocks: Block[]): JSONContent {
  const content: JSONContent[] =
    blocks.length > 0 ? blocks.map(blockToNode) : [{ type: "paragraph" }];
  return { type: "doc", content };
}

function blockToNode(block: Block): JSONContent {
  const text = block.content ? [{ type: "text", text: block.content }] : [];
  switch (block.type) {
    case "heading":
      return { type: "heading", attrs: { level: 1 }, content: text };
    case "list":
      return {
        type: "bulletList",
        content: [{ type: "listItem", content: [{ type: "paragraph", content: text }] }],
      };
    default:
      return { type: "paragraph", content: text };
  }
}

function extractText(node: JSONContent): string {
  if (!node.content) return "";
  return node.content
    .map((n) => (n.text ? n.text : extractText(n)))
    .join("");
}

function docToBlocks(doc: JSONContent): Block[] {
  return (doc.content ?? []).flatMap((node): Block[] => {
    if (node.type === "bulletList" || node.type === "orderedList") {
      return (node.content ?? []).map((item): Block => ({
        id: nanoid(),
        type: "list",
        content: extractText(item),
      }));
    }
    return [{
      id: nanoid(),
      type: node.type === "heading" ? "heading" : "paragraph",
      content: extractText(node),
    }];
  });
}

export function BlockEditor({ pageId, blocks, onChange, readOnly = false }: BlockEditorProps) {
  const handleUpdate = useCallback(
    (json: JSONContent) => {
      onChange(docToBlocks(json));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageId]
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: "Start writing…" }),
      ],
      content: blocksToDoc(blocks),
      editable: !readOnly,
      onUpdate({ editor }) {
        handleUpdate(editor.getJSON());
      },
    },
    [pageId]
  );

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(blocksToDoc(blocks));
    if (current !== next) {
      editor.commands.setContent(blocksToDoc(blocks), false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  return (
    <div className="prose prose-sm max-w-none [&_.ProseMirror]:min-h-[60vh] [&_.ProseMirror]:py-1">
      <EditorContent editor={editor} />
    </div>
  );
}
