"use client";

import { useState, useEffect, useCallback } from "react";
import { Block, BlockContent } from "@/types";
import {
  getBlocksForPage,
  saveBlock,
  updateBlock as storageUpdateBlock,
  deleteBlock as storageDeleteBlock,
  reorderBlocks as storageReorderBlocks,
} from "@/lib/storage/blocks";
import { generateId } from "@/lib/utils";

export function useBlocks(pageId: string) {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    setBlocks(getBlocksForPage(pageId));
  }, [pageId]);

  const addBlock = useCallback(
    (type: Block["type"]): Block => {
      const existing = getBlocksForPage(pageId);
      const defaultContent: BlockContent =
        type === "text"
          ? { html: "" }
          : type === "code"
          ? { code: "", language: "plaintext" }
          : { method: "GET", endpoint: "", description: "" };

      const block: Block = {
        id: generateId(),
        pageId,
        type,
        content: defaultContent,
        order: existing.length,
        isDynamic: false,
      };
      saveBlock(block);
      setBlocks(getBlocksForPage(pageId));
      return block;
    },
    [pageId]
  );

  const updateBlockContent = useCallback(
    (id: string, content: BlockContent) => {
      storageUpdateBlock(id, pageId, { content });
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content } : b))
      );
    },
    [pageId]
  );

  const removeBlock = useCallback(
    (id: string) => {
      storageDeleteBlock(id, pageId);
      setBlocks(getBlocksForPage(pageId));
    },
    [pageId]
  );

  const reorderBlocks = useCallback(
    (orderedIds: string[]) => {
      storageReorderBlocks(pageId, orderedIds);
      setBlocks(getBlocksForPage(pageId));
    },
    [pageId]
  );

  return { blocks, addBlock, updateBlockContent, removeBlock, reorderBlocks };
}
