"use client";

import { Block } from "@/types";

interface AddBlockMenuProps {
  onAdd: (type: Block["type"]) => void;
}

const BLOCK_TYPES: { type: Block["type"]; label: string; description: string; icon: string }[] = [
  { type: "text", label: "Text", description: "Rich text editor", icon: "T" },
  { type: "code", label: "Code", description: "Code snippet", icon: "</>" },
  { type: "api", label: "API", description: "API endpoint reference", icon: "⚡" },
];

export function AddBlockMenu({ onAdd }: AddBlockMenuProps) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs text-gray-400 font-medium">Add block</span>
      <div className="flex items-center gap-1">
        {BLOCK_TYPES.map(({ type, label, description, icon }) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            title={description}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <span className="font-mono text-[10px] font-bold">{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
