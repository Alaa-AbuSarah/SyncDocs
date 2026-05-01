export const KEYS = {
  projects: "syncdocs:projects",
  pages: (projectId: string) => `syncdocs:pages:${projectId}`,
  blocks: (pageId: string) => `syncdocs:blocks:${pageId}`,
} as const;
