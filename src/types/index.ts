export type BlockType = "paragraph" | "heading" | "list";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
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
  pages: Page[];
}
