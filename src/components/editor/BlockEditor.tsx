"use client";
import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Block } from "@/types";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Block ↔ TipTap JSON conversion
// ---------------------------------------------------------------------------

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
  return node.content.map((n) => (n.text ? n.text : extractText(n))).join("");
}

function docToBlocks(doc: JSONContent): Block[] {
  return (doc.content ?? []).flatMap((node): Block[] => {
    if (node.type === "bulletList" || node.type === "orderedList") {
      return (node.content ?? []).map(
        (item): Block => ({ id: nanoid(), type: "list", content: extractText(item) })
      );
    }
    return [
      {
        id: nanoid(),
        type: node.type === "heading" ? "heading" : "paragraph",
        content: extractText(node),
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// Slash command options
// ---------------------------------------------------------------------------

type SlashType = "paragraph" | "heading" | "list";

const SLASH_OPTIONS: { label: string; desc: string; type: SlashType; icon: string }[] = [
  { label: "Text",    desc: "Plain paragraph",    type: "paragraph", icon: "¶" },
  { label: "Heading", desc: "Large section title", type: "heading",   icon: "H" },
  { label: "List",    desc: "Bullet list",         type: "list",      icon: "•" },
];

function applySlashOption(editor: Editor, type: SlashType) {
  const { $from } = editor.state.selection;
  const from = $from.start();
  const to = $from.pos;
  const chain = editor.chain().focus().deleteRange({ from, to });
  if (type === "heading") chain.setHeading({ level: 1 });
  else if (type === "list") chain.toggleBulletList();
  else chain.setParagraph();
  chain.run();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BlockEditorProps {
  pageId: string;
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
}

export function BlockEditor({ pageId, blocks, onChange, readOnly = false }: BlockEditorProps) {
  const [slashMenu, setSlashMenu] = useState<{ top: number; left: number; query: string } | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const filteredOptions = useMemo(
    () =>
      slashMenu
        ? SLASH_OPTIONS.filter((o) => o.label.toLowerCase().startsWith(slashMenu.query.toLowerCase()))
        : [],
    [slashMenu]
  );

  // Reset selection when query changes
  useEffect(() => { setSelectedIdx(0); }, [slashMenu?.query]);

  // Shared ref so the TipTap extension can read current state without stale closures
  const slashCtx = useRef({ open: false, count: 0, idx: 0, options: filteredOptions });
  slashCtx.current = { open: !!slashMenu, count: filteredOptions.length, idx: selectedIdx, options: filteredOptions };

  // One-time extension: intercepts arrow/enter/escape when the menu is open
  const slashExtension = useMemo(
    () =>
      Extension.create({
        name: "slashInterceptor",
        addKeyboardShortcuts() {
          const ctx = slashCtx;
          return {
            ArrowDown: () => {
              if (!ctx.current.open || !ctx.current.count) return false;
              setSelectedIdx((i) => (i + 1) % ctx.current.count);
              return true;
            },
            ArrowUp: () => {
              if (!ctx.current.open || !ctx.current.count) return false;
              setSelectedIdx((i) => (i - 1 + ctx.current.count) % ctx.current.count);
              return true;
            },
            Enter: ({ editor: e }) => {
              if (!ctx.current.open || !ctx.current.count) return false;
              const opt = ctx.current.options[ctx.current.idx];
              if (opt) { applySlashOption(e, opt.type); setSlashMenu(null); }
              return true;
            },
            Escape: () => {
              if (!ctx.current.open) return false;
              setSlashMenu(null);
              return true;
            },
          };
        },
      }),
    []
  );

  const handleUpdate = useCallback(
    (editor: Editor) => {
      // Persist block changes
      onChange(docToBlocks(editor.getJSON()));

      // Detect slash command: show menu when current paragraph starts with "/"
      const { $from } = editor.state.selection;
      const nodeType = $from.parent.type.name;
      const text = $from.parent.textContent;

      if (!readOnly && nodeType === "paragraph" && text.startsWith("/")) {
        const coords = editor.view.coordsAtPos(editor.state.selection.from);
        setSlashMenu({ top: coords.bottom, left: coords.left, query: text.slice(1) });
      } else {
        setSlashMenu(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageId, readOnly]
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: "Start writing… (type / for commands)" }),
        slashExtension,
      ],
      content: blocksToDoc(blocks),
      editable: !readOnly,
      onUpdate({ editor: e }) {
        handleUpdate(e);
      },
    },
    [pageId]
  );

  // Sync content when the page switches without a full remount
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(blocksToDoc(blocks));
    if (current !== next) editor.commands.setContent(blocksToDoc(blocks), false);
    setSlashMenu(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  // Close slash menu on scroll
  useEffect(() => {
    if (!slashMenu) return;
    const close = () => setSlashMenu(null);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [slashMenu]);

  return (
    <div className="relative">
      <div className="prose prose-sm max-w-none [&_.ProseMirror]:min-h-[60vh] [&_.ProseMirror]:py-1">
        <EditorContent editor={editor} />
      </div>

      {/* Slash command menu */}
      {slashMenu && filteredOptions.length > 0 && (
        <div
          style={{ position: "fixed", top: slashMenu.top + 6, left: slashMenu.left }}
          className="z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[200px] overflow-hidden"
        >
          {filteredOptions.map((opt, i) => (
            <button
              key={opt.type}
              onMouseDown={(e) => {
                // mousedown fires before blur; use it to apply without losing editor focus
                e.preventDefault();
                if (editor) applySlashOption(editor, opt.type);
                setSlashMenu(null);
              }}
              onMouseEnter={() => setSelectedIdx(i)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                i === selectedIdx
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className={cn(
                "w-7 h-7 flex items-center justify-center rounded text-sm font-semibold shrink-0",
                i === selectedIdx ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
              )}>
                {opt.icon}
              </span>
              <div>
                <p className="text-sm font-medium leading-none mb-0.5">{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
