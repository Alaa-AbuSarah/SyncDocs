export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface Page {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  order: number;
}

export interface TextContent {
  html: string;
}

export interface CodeContent {
  code: string;
  language: string;
}

export interface ApiContent {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  description: string;
}

export type BlockContent = TextContent | CodeContent | ApiContent;

export interface Block {
  id: string;
  pageId: string;
  type: "text" | "code" | "api";
  content: BlockContent;
  order: number;
  isDynamic: boolean;
}
