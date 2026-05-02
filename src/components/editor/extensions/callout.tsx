"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import React from "react";

export type CalloutType = "default" | "info" | "success" | "warning" | "error";

const CALLOUT_ICONS: Record<CalloutType, string> = {
  default: "💡",
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "🚨",
};

function CalloutView({ node }: NodeViewProps) {
  const type = (node.attrs.calloutType as CalloutType) ?? "default";
  return (
    <NodeViewWrapper>
      <div className={`callout callout-${type}`} data-callout-type={type}>
        <span className="callout-icon" contentEditable={false}>
          {CALLOUT_ICONS[type] ?? CALLOUT_ICONS.default}
        </span>
        <NodeViewContent className="callout-body" />
      </div>
    </NodeViewWrapper>
  );
}

export const CalloutExtension = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      calloutType: {
        default: "default" as CalloutType,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-callout-type") as CalloutType,
        renderHTML: (attrs) => ({ "data-callout-type": attrs.calloutType }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout-type]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: `callout callout-${node.attrs.calloutType}` }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
});
