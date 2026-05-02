"use client";
import CodeBlock from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import React from "react";

const LANGUAGES = [
  { value: "", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
];

function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
  const lang = (node.attrs.language as string) ?? "";
  return (
    <NodeViewWrapper>
      <div className="code-block-wrapper">
        <div className="code-block-header" contentEditable={false}>
          <select
            className="code-lang-select"
            value={lang}
            onChange={(e) => updateAttributes({ language: e.target.value || null })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <pre className="code-block-pre">
          <NodeViewContent as="code" className={lang ? `language-${lang}` : ""} />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

export const CodeBlockWithLanguage = CodeBlock.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-language") || null,
        renderHTML: (attrs) =>
          attrs.language ? { "data-language": attrs.language } : {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});
