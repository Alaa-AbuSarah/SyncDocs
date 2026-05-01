"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Editor, posToDOMRect } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface BubbleMenuBarProps {
  editor: Editor;
}

interface MenuPos {
  top: number;
  left: number;
}

export function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  const [pos, setPos] = useState<MenuPos | null>(null);

  useEffect(() => {
    const update = () => {
      const { from, to, empty } = editor.state.selection;
      if (empty || !editor.isFocused) {
        setPos(null);
        return;
      }
      const rect = posToDOMRect(editor.view, from, to);
      setPos({
        top: rect.top + window.scrollY - 48,
        left: rect.left + rect.width / 2,
      });
    };

    editor.on("selectionUpdate", update);
    editor.on("blur", () => setPos(null));
    return () => {
      editor.off("selectionUpdate", update);
    };
  }, [editor]);

  if (!pos) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        transform: "translateX(-50%)",
        zIndex: 9998,
      }}
      className="flex items-center gap-0.5 bg-gray-900 text-white rounded-lg px-1.5 py-1 shadow-xl pointer-events-auto"
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolButton
        label="B"
        title="Bold"
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="font-bold"
      />
      <ToolButton
        label="I"
        title="Italic"
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="italic"
      />
      <ToolButton
        label="S"
        title="Strikethrough"
        isActive={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className="line-through"
      />
      <ToolButton
        label="U"
        title="Underline"
        isActive={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="underline"
      />
      <ToolButton
        label="</>"
        title="Inline code"
        isActive={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        className="font-mono text-[10px]"
      />
      <div className="w-px h-4 bg-gray-700 mx-1" />
      <LinkButton editor={editor} />
    </div>,
    document.body
  );
}

function ToolButton({
  label,
  title,
  isActive,
  onClick,
  className,
}: {
  label: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded text-xs transition-colors",
        isActive
          ? "bg-gray-600 text-white"
          : "text-gray-300 hover:text-white hover:bg-gray-700",
        className
      )}
    >
      {label}
    </button>
  );
}

function LinkButton({ editor }: { editor: Editor }) {
  const isActive = editor.isActive("link");
  const handleLink = () => {
    if (isActive) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };
  return (
    <button
      title="Link"
      onClick={handleLink}
      className={cn(
        "px-2 py-1 rounded text-xs transition-colors",
        isActive
          ? "bg-gray-600 text-white"
          : "text-gray-300 hover:text-white hover:bg-gray-700"
      )}
    >
      ⌘K
    </button>
  );
}
