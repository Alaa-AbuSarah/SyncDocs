import { Block } from "@/types";
import { KEYS } from "./keys";

export function getBlocksForPage(pageId: string): Block[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.blocks(pageId));
    const blocks: Block[] = raw ? JSON.parse(raw) : [];
    return blocks.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function saveBlock(block: Block): void {
  const blocks = getBlocksForPage(block.pageId);
  const existing = blocks.findIndex((b) => b.id === block.id);
  if (existing >= 0) {
    blocks[existing] = block;
  } else {
    blocks.push(block);
  }
  localStorage.setItem(KEYS.blocks(block.pageId), JSON.stringify(blocks));
}

export function updateBlock(
  id: string,
  pageId: string,
  updates: Partial<Block>
): void {
  const blocks = getBlocksForPage(pageId);
  const idx = blocks.findIndex((b) => b.id === id);
  if (idx >= 0) {
    blocks[idx] = { ...blocks[idx], ...updates };
    localStorage.setItem(KEYS.blocks(pageId), JSON.stringify(blocks));
  }
}

export function deleteBlock(id: string, pageId: string): void {
  const blocks = getBlocksForPage(pageId).filter((b) => b.id !== id);
  localStorage.setItem(KEYS.blocks(pageId), JSON.stringify(blocks));
}

export function reorderBlocks(pageId: string, orderedIds: string[]): void {
  const blocks = getBlocksForPage(pageId);
  const reordered = orderedIds
    .map((id, index) => {
      const block = blocks.find((b) => b.id === id);
      return block ? { ...block, order: index } : null;
    })
    .filter(Boolean) as Block[];
  localStorage.setItem(KEYS.blocks(pageId), JSON.stringify(reordered));
}
