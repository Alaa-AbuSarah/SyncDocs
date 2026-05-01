"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Typography } from "@tiptap/extension-typography";
import { createLowlight, common } from "lowlight";
import { createPortal } from "react-dom";
import {
  SlashCommandExtension,
  SlashCommandItem,
  slashCommandItems,
} from "../extensions/SlashCommand";
import { SlashCommandMenu, SlashCommandMenuRef } from "../SlashCommandMenu";
import { BubbleMenuBar } from "../BubbleMenuBar";
import { TextContent } from "@/types";

const lowlight = createLowlight(common);

interface MenuState {
  items: SlashCommandItem[];
  clientRect: (() => DOMRect | null) | null;
  command: (item: SlashCommandItem) => void;
}

interface TextBlockProps {
  blockId: string;
  content: TextContent;
  onChange: (html: string) => void;
  isReadOnly: boolean;
}

export function TextBlock({
  content,
  onChange,
  isReadOnly,
}: TextBlockProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<SlashCommandMenuRef>(null);
  const [menuState, setMenuState] = useState<MenuState | null>(null);

  const debouncedSave = useCallback(
    (html: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(html), 300);
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: isReadOnly }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Typography,
      Placeholder.configure({
        placeholder: "Start writing, or type / for commands…",
      }),
      SlashCommandExtension.configure({
        suggestion: {
          char: "/",
          items: ({ query }: { query: string }) =>
            slashCommandItems.filter((item) =>
              item.title.toLowerCase().includes(query.toLowerCase())
            ),
          render: () => ({
            onStart: (props: {
              items: SlashCommandItem[];
              clientRect?: (() => DOMRect | null) | null;
              command: (item: SlashCommandItem) => void;
            }) => {
              setMenuState({
                items: props.items,
                clientRect: props.clientRect ?? null,
                command: props.command,
              });
            },
            onUpdate: (props: {
              items: SlashCommandItem[];
              clientRect?: (() => DOMRect | null) | null;
              command: (item: SlashCommandItem) => void;
            }) => {
              setMenuState({
                items: props.items,
                clientRect: props.clientRect ?? null,
                command: props.command,
              });
            },
            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === "Escape") {
                setMenuState(null);
                return true;
              }
              return menuRef.current?.onKeyDown(props) ?? false;
            },
            onExit: () => setMenuState(null),
          }),
          command: ({
            editor: e,
            range,
            props,
          }: {
            editor: unknown;
            range: { from: number; to: number };
            props: SlashCommandItem;
          }) => {
            props.command({ editor: e as import("@tiptap/core").Editor, range });
            setMenuState(null);
          },
        },
      }),
    ],
    content: content.html || "",
    editable: !isReadOnly,
    onUpdate: ({ editor: e }) => debouncedSave(e.getHTML()),
    immediatelyRender: false,
  });

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  useEffect(() => {
    if (editor && editor.isEditable === isReadOnly) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

  const menuPosition = menuState?.clientRect?.();

  return (
    <div className="tiptap-editor relative">
      {editor && !isReadOnly && <BubbleMenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-blue-600 prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:rounded prose-code:text-sm prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:text-gray-600 prose-blockquote:not-italic [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:min-h-[3rem]"
      />
      {menuState &&
        menuState.items.length > 0 &&
        menuPosition &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: menuPosition.bottom + 4,
              left: menuPosition.left,
              zIndex: 9999,
            }}
          >
            <SlashCommandMenu
              ref={menuRef}
              items={menuState.items}
              command={(item) => {
                menuState.command(item);
                setMenuState(null);
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
