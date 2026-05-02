"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import React from "react";

function ToggleView({ node, updateAttributes }: NodeViewProps) {
  const isOpen = node.attrs.open !== false;
  return (
    <NodeViewWrapper>
      <div className="toggle-block">
        <button
          className={`toggle-arrow ${isOpen ? "toggle-arrow-open" : ""}`}
          contentEditable={false}
          onMouseDown={(e) => {
            e.preventDefault();
            updateAttributes({ open: !isOpen });
          }}
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          ▶
        </button>
        <div className={`toggle-content ${isOpen ? "" : "toggle-content-hidden"}`}>
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const ToggleExtension = Node.create({
  name: "toggle",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-open") !== "false",
        renderHTML: (attrs) => ({ "data-open": attrs.open ? "true" : "false" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-toggle]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-toggle": "", class: "toggle-block" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleView);
  },
});
