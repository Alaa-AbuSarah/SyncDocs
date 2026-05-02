# SyncDocs

A minimal, Notion-inspired documentation platform built for speed and clarity. Create projects, write pages, and share your docs with a single link — no account required.

---

## What is SyncDocs?

SyncDocs is a local-first documentation web app where you can organize your notes and docs into **projects** and **pages**, write content in a clean block-based editor, nest pages into folders, and share any project publicly via a read-only link.

Everything is stored in your browser's localStorage — no server, no login, no friction.

---

## Features

### Projects Dashboard
- Create and delete projects from a clean card grid
- Each project has a name and auto-generated URL slug
- Click any card to open the project editor

### Block-Based Editor
- Write in **paragraphs**, **headings**, and **bullet lists**
- Powered by [TipTap](https://tiptap.dev/) — fast, minimal, keyboard-friendly
- Auto-saves on every keystroke — no save button needed
- Click the page title to rename it inline

### Nested Sidebar
- Pages are displayed in a collapsible tree structure
- **Drag and drop** to reorder pages (powered by dnd-kit)
- Create sub-pages nested under any parent page
- Rename or delete pages directly from the sidebar
- Active page is highlighted for clear navigation

### Share Any Project
- Click **Share** in the top bar to copy a public link
- Shared link format: `/share/demo-user/[project-slug]`
- The shared view is fully **read-only** — no editing, no drag-and-drop
- Sidebar navigation still works on the shared page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Editor | TipTap 2 (StarterKit) |
| Drag & Drop | dnd-kit |
| Persistence | localStorage |
| IDs | nanoid |

---

## Routes

| Route | Description |
|---|---|
| `/` | Projects dashboard |
| `/docs/[projectId]` | Full editor for a project |
| `/share/demo-user/[slug]` | Public read-only view |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                           # Dashboard
│   ├── docs/[projectId]/page.tsx          # Editor page
│   └── share/[userId]/[projectSlug]/      # Public share page
│       └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── ProjectCard.tsx                # Project grid card
│   │   └── CreateProjectModal.tsx         # New project dialog
│   ├── docs/
│   │   ├── DocsLayout.tsx                 # Shared layout (editor + read-only)
│   │   ├── Sidebar.tsx                    # Page tree with drag-and-drop
│   │   ├── SidebarPageItem.tsx            # Individual draggable page row
│   │   ├── TopBar.tsx                     # Header with back + share button
│   │   └── PageTitleEditor.tsx            # Inline editable page title
│   ├── editor/
│   │   └── BlockEditor.tsx                # TipTap editor with block conversion
│   └── shared/
│       ├── Button.tsx                     # Reusable button variants
│       ├── Modal.tsx                      # Accessible modal dialog
│       └── EmptyState.tsx                 # Empty placeholder component
├── store/
│   └── useProjectStore.ts                 # Zustand store — all state + mutations
├── lib/
│   ├── storage.ts                         # localStorage abstraction layer
│   └── utils.ts                           # cn() helper, slugify()
└── types/
    └── index.ts                           # Project, Page, Block types
```

---

## Data Model

```ts
interface Project {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
  pages: Page[];
}

interface Page {
  id: string;
  title: string;
  parentId: string | null;   // null = top-level, string = nested under parent
  order: number;
  blocks: Block[];
}

interface Block {
  id: string;
  type: "paragraph" | "heading" | "list";
  content: string;
}
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to get started.

---

## Architecture Notes

**Storage is isolated.** Components never call `localStorage` directly. All reads and writes go through `src/lib/storage.ts`, which makes swapping in a real backend (e.g. Supabase) a single-file change.

**State is centralized.** The Zustand store in `useProjectStore.ts` owns all mutations. Components are purely presentational — they receive data as props or select from the store, and call store actions on user events.

**DocsLayout is shared.** The same component renders both the editable editor (`/docs/[id]`) and the public read-only view (`/share/...`), controlled by a `readOnly` prop. This keeps the two views in sync with zero duplication.

**Editor ↔ Block model.** TipTap's internal JSON is converted to and from the `Block[]` model on every update. This keeps the persistence format simple and backend-ready, independent of TipTap's internals.

---

## Roadmap

- [ ] Supabase backend (projects, pages, blocks)
- [ ] Google authentication
- [ ] Multi-user collaboration
- [ ] More block types (image, code, divider, callout)
- [ ] Page search
- [ ] Dark mode
