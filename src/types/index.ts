export type BlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "codeBlock"
  | "divider"
  | "callout"
  | "toggle"
  | "table";

export interface BlockMeta {
  level?: 1 | 2 | 3;
  checked?: boolean;
  language?: string | null;
  calloutType?: "default" | "info" | "success" | "warning" | "error";
  open?: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  meta?: BlockMeta;
}

export interface Page {
  id: string;
  title: string;
  parentId: string | null;
  order: number;
  blocks: Block[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
  updatedAt: number;
  pages: Page[];
}
