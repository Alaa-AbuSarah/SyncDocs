"use client";
import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { CalloutExtension } from "./extensions/callout";
import { ToggleExtension } from "./extensions/toggle";
import { CodeBlockWithLanguage } from "./extensions/code-block";
import type { Block, BlockType, BlockMeta, Page } from "@/types";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Block ↔ TipTap JSON conversion
// ---------------------------------------------------------------------------

function extractText(node: JSONContent): string {
  if (node.type === "mention") return node.attrs?.label ?? "";
  if (!node.content) return node.text ?? "";
  return node.content.map(extractText).join("");
}

function blockToNode(block: Block): JSONContent {
  const text = block.content ? [{ type: "text", text: block.content }] : [];
  const level = block.meta?.level ?? 1;

  switch (block.type) {
    case "heading":
      return { type: "heading", attrs: { level }, content: text };
    case "blockquote":
      return { type: "blockquote", content: [{ type: "paragraph", content: text }] };
    case "codeBlock":
      return {
        type: "codeBlock",
        attrs: { language: block.meta?.language ?? null },
        content: text,
      };
    case "divider":
      return { type: "horizontalRule" };
    case "callout":
      return {
        type: "callout",
        attrs: { calloutType: block.meta?.calloutType ?? "default" },
        content: [{ type: "paragraph", content: text }],
      };
    case "toggle": {
      let inner: JSONContent[] = [{ type: "paragraph" }];
      if (block.content) {
        try {
          inner = JSON.parse(block.content) as JSONContent[];
        } catch {
          inner = [{ type: "paragraph", content: text }];
        }
      }
      return { type: "toggle", attrs: { open: block.meta?.open ?? true }, content: inner };
    }
    case "table": {
      if (block.content) {
        try {
          return JSON.parse(block.content) as JSONContent;
        } catch {}
      }
      return {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              { type: "tableHeader", content: [{ type: "paragraph" }] },
              { type: "tableHeader", content: [{ type: "paragraph" }] },
              { type: "tableHeader", content: [{ type: "paragraph" }] },
            ],
          },
          {
            type: "tableRow",
            content: [
              { type: "tableCell", content: [{ type: "paragraph" }] },
              { type: "tableCell", content: [{ type: "paragraph" }] },
              { type: "tableCell", content: [{ type: "paragraph" }] },
            ],
          },
        ],
      };
    }
    default:
      return { type: "paragraph", content: text };
  }
}

function blocksToDoc(blocks: Block[]): JSONContent {
  if (blocks.length === 0) return { type: "doc", content: [{ type: "paragraph" }] };

  const content: JSONContent[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "list" || block.type === "orderedList" || block.type === "taskList") {
      const listType = block.type;
      const tiptapType =
        listType === "list"
          ? "bulletList"
          : listType === "orderedList"
            ? "orderedList"
            : "taskList";
      const items: JSONContent[] = [];

      while (i < blocks.length && blocks[i].type === listType) {
        const b = blocks[i];
        const bText = b.content ? [{ type: "text", text: b.content }] : [];
        if (listType === "taskList") {
          items.push({
            type: "taskItem",
            attrs: { checked: b.meta?.checked ?? false },
            content: [{ type: "paragraph", content: bText }],
          });
        } else {
          items.push({
            type: "listItem",
            content: [{ type: "paragraph", content: bText }],
          });
        }
        i++;
      }

      content.push({ type: tiptapType, content: items });
    } else {
      content.push(blockToNode(block));
      i++;
    }
  }

  return { type: "doc", content };
}

function docToBlocks(doc: JSONContent): Block[] {
  return (doc.content ?? []).flatMap((node): Block[] => {
    switch (node.type) {
      case "bulletList":
        return (node.content ?? []).map(
          (item): Block => ({ id: nanoid(), type: "list", content: extractText(item) })
        );
      case "orderedList":
        return (node.content ?? []).map(
          (item): Block => ({ id: nanoid(), type: "orderedList", content: extractText(item) })
        );
      case "taskList":
        return (node.content ?? []).map(
          (item): Block => ({
            id: nanoid(),
            type: "taskList",
            content: extractText(item),
            meta: { checked: (item.attrs?.checked as boolean) ?? false },
          })
        );
      case "heading":
        return [
          {
            id: nanoid(),
            type: "heading",
            content: extractText(node),
            meta: { level: (node.attrs?.level as 1 | 2 | 3) ?? 1 },
          },
        ];
      case "blockquote":
        return [{ id: nanoid(), type: "blockquote", content: extractText(node) }];
      case "codeBlock":
        return [
          {
            id: nanoid(),
            type: "codeBlock",
            content: extractText(node),
            meta: { language: (node.attrs?.language as string) ?? null },
          },
        ];
      case "horizontalRule":
        return [{ id: nanoid(), type: "divider", content: "" }];
      case "callout":
        return [
          {
            id: nanoid(),
            type: "callout",
            content: extractText(node),
            meta: { calloutType: (node.attrs?.calloutType as BlockMeta["calloutType"]) ?? "default" },
          },
        ];
      case "toggle":
        return [
          {
            id: nanoid(),
            type: "toggle",
            content: JSON.stringify(node.content ?? [{ type: "paragraph" }]),
            meta: { open: (node.attrs?.open as boolean) ?? true },
          },
        ];
      case "table":
        return [{ id: nanoid(), type: "table", content: JSON.stringify(node) }];
      default:
        return [{ id: nanoid(), type: "paragraph", content: extractText(node) }];
    }
  });
}

// ---------------------------------------------------------------------------
// Slash command configuration
// ---------------------------------------------------------------------------

type SlashType = BlockType | "heading1" | "heading2" | "heading3" |
  "callout-info" | "callout-success" | "callout-warning" | "callout-error";

interface SlashOption {
  label: string;
  desc: string;
  type: SlashType;
  icon: string;
  keywords?: string;
}

interface SlashGroup {
  group: string;
  items: SlashOption[];
}

const SLASH_GROUPS: SlashGroup[] = [
  {
    group: "Text",
    items: [
      { label: "Text",       desc: "Plain paragraph",      type: "paragraph",  icon: "¶",  keywords: "text plain" },
      { label: "Heading 1",  desc: "Large title",           type: "heading1",   icon: "H1", keywords: "h1 heading title" },
      { label: "Heading 2",  desc: "Medium title",          type: "heading2",   icon: "H2", keywords: "h2 heading" },
      { label: "Heading 3",  desc: "Small title",           type: "heading3",   icon: "H3", keywords: "h3 heading" },
      { label: "Quote",      desc: "Blockquote",            type: "blockquote", icon: "❝",  keywords: "quote blockquote" },
      { label: "Divider",    desc: "Horizontal rule",       type: "divider",    icon: "─",  keywords: "hr divider rule line" },
    ],
  },
  {
    group: "Lists",
    items: [
      { label: "Bullet List",   desc: "Unordered list",   type: "list",        icon: "•",  keywords: "bullet list ul" },
      { label: "Numbered List", desc: "Ordered list",     type: "orderedList", icon: "1.",  keywords: "numbered ordered list ol" },
      { label: "To-do List",    desc: "Checkbox list",    type: "taskList",    icon: "☐",  keywords: "todo task check checkbox" },
      { label: "Toggle",        desc: "Collapsible block", type: "toggle",     icon: "▶",  keywords: "toggle collapse expand" },
    ],
  },
  {
    group: "Content",
    items: [
      { label: "Code Block", desc: "Code with language", type: "codeBlock", icon: "</>", keywords: "code block pre" },
      { label: "Table",      desc: "Insert a table",     type: "table",     icon: "⊞",   keywords: "table grid" },
    ],
  },
  {
    group: "Callouts",
    items: [
      { label: "Callout",  desc: "Highlighted note",  type: "callout",         icon: "💡", keywords: "callout note" },
      { label: "Info",     desc: "Info callout",      type: "callout-info",    icon: "ℹ️", keywords: "info callout" },
      { label: "Success",  desc: "Success callout",   type: "callout-success", icon: "✅", keywords: "success callout done" },
      { label: "Warning",  desc: "Warning callout",   type: "callout-warning", icon: "⚠️", keywords: "warning callout alert" },
      { label: "Error",    desc: "Error callout",     type: "callout-error",   icon: "🚨", keywords: "error callout danger" },
    ],
  },
];

function filterGroups(query: string): SlashGroup[] {
  if (!query) return SLASH_GROUPS;
  const q = query.toLowerCase();
  return SLASH_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.desc.toLowerCase().includes(q) ||
        o.keywords?.includes(q)
    ),
  })).filter((g) => g.items.length > 0);
}

function applySlashOption(editor: Editor, type: SlashType) {
  const { $from } = editor.state.selection;
  const from = $from.start();
  const to = $from.pos;
  const nodeFrom = $from.before($from.depth);
  const nodeTo = $from.after($from.depth);

  switch (type) {
    case "paragraph":
      editor.chain().focus().deleteRange({ from, to }).setParagraph().run();
      break;
    case "heading1":
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 1 }).run();
      break;
    case "heading2":
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 2 }).run();
      break;
    case "heading3":
      editor.chain().focus().deleteRange({ from, to }).setHeading({ level: 3 }).run();
      break;
    case "list":
      editor.chain().focus().deleteRange({ from, to }).toggleBulletList().run();
      break;
    case "orderedList":
      editor.chain().focus().deleteRange({ from, to }).toggleOrderedList().run();
      break;
    case "taskList":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.chain().focus().deleteRange({ from, to }) as any).toggleTaskList().run();
      break;
    case "blockquote":
      editor.chain().focus().deleteRange({ from, to }).setBlockquote().run();
      break;
    case "codeBlock":
      editor.chain().focus().deleteRange({ from, to }).setCodeBlock().run();
      break;
    case "divider":
      editor.chain().focus()
        .deleteRange({ from: nodeFrom, to: nodeTo })
        .insertContent({ type: "horizontalRule" })
        .run();
      break;
    case "toggle":
      editor.chain().focus()
        .deleteRange({ from: nodeFrom, to: nodeTo })
        .insertContent({ type: "toggle", attrs: { open: true }, content: [{ type: "paragraph" }] })
        .run();
      break;
    case "callout":
    case "callout-info":
    case "callout-success":
    case "callout-warning":
    case "callout-error": {
      const calloutType =
        type === "callout" ? "default" : (type.replace("callout-", "") as BlockMeta["calloutType"]);
      editor.chain().focus()
        .deleteRange({ from: nodeFrom, to: nodeTo })
        .insertContent({
          type: "callout",
          attrs: { calloutType },
          content: [{ type: "paragraph" }],
        })
        .run();
      break;
    }
    case "table":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.chain().focus().deleteRange({ from: nodeFrom, to: nodeTo }) as any)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
      break;
    default:
      break;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BlockEditorProps {
  pageId: string;
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
  pages?: Page[];
}

export function BlockEditor({
  pageId,
  blocks,
  onChange,
  readOnly = false,
}: BlockEditorProps) {
  const [slashMenu, setSlashMenu] = useState<{
    top: number;
    left: number;
    query: string;
  } | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const filteredGroups = useMemo(
    () => (slashMenu ? filterGroups(slashMenu.query) : []),
    [slashMenu]
  );
  const flatOptions = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups]
  );

  useEffect(() => {
    setSelectedIdx(0);
  }, [slashMenu?.query]);

  const slashCtx = useRef({ open: false, count: 0, idx: 0, options: flatOptions });
  slashCtx.current = {
    open: !!slashMenu,
    count: flatOptions.length,
    idx: selectedIdx,
    options: flatOptions,
  };

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
              if (opt) {
                applySlashOption(e, opt.type);
                setSlashMenu(null);
              }
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
      onChange(docToBlocks(editor.getJSON()));

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
        StarterKit.configure({ codeBlock: false }),
        Placeholder.configure({ placeholder: "Start writing… (type / for commands)" }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight,
        Table.configure({ resizable: false }),
        TableRow,
        TableCell,
        TableHeader,
        CalloutExtension,
        ToggleExtension,
        CodeBlockWithLanguage,
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

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(blocksToDoc(blocks));
    if (current !== next) editor.commands.setContent(blocksToDoc(blocks), false);
    setSlashMenu(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slashMenu) return;
    const close = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setSlashMenu(null);
    };
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [slashMenu]);

  // Track absolute position of flat option across groups for selectedIdx highlight
  let flatIdx = 0;

  return (
    <div className="relative">
      <div className="prose prose-sm max-w-none [&_.ProseMirror]:min-h-[60vh] [&_.ProseMirror]:py-1">
        <EditorContent editor={editor} />
      </div>

      {slashMenu && flatOptions.length > 0 && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: slashMenu.top + 6, left: slashMenu.left }}
          className="z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[220px] max-h-[420px] overflow-y-auto"
        >
          {filteredGroups.map((group) => (
            <div key={group.group}>
              <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {group.group}
              </p>
              {group.items.map((opt) => {
                const thisIdx = flatIdx++;
                return (
                  <button
                    key={opt.type}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (editor) applySlashOption(editor, opt.type);
                      setSlashMenu(null);
                    }}
                    onMouseEnter={() => setSelectedIdx(thisIdx)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-1.5 text-left transition-colors",
                      thisIdx === selectedIdx
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded text-sm font-semibold shrink-0",
                        thisIdx === selectedIdx
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {opt.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-none mb-0.5">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
