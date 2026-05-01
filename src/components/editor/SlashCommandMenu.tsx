"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { SlashCommandItem } from "./extensions/SlashCommand";

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandMenu = forwardRef<
  SlashCommandMenuRef,
  SlashCommandMenuProps
>(({ items, command }, ref) => {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setSelected(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === "ArrowUp") {
        setSelected((s) => (s - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelected((s) => (s + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        if (items[selected]) {
          command(items[selected]);
        }
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) return null;

  return (
    <div className="z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-64 overflow-hidden">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 py-1">
        Blocks
      </p>
      {items.map((item, index) => (
        <button
          key={item.title}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
            index === selected
              ? "bg-gray-100 text-gray-900"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => command(item)}
          onMouseEnter={() => setSelected(index)}
        >
          <span className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-md text-xs font-bold text-gray-600 flex-shrink-0">
            {item.icon}
          </span>
          <div>
            <p className="text-xs font-medium leading-tight">{item.title}</p>
            <p className="text-[10px] text-gray-400 leading-tight">
              {item.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
});

SlashCommandMenu.displayName = "SlashCommandMenu";
