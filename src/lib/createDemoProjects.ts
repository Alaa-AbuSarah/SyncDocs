import type { Block, Page } from "@/types";
import { insertProject, insertPage } from "@/lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function id() {
  return crypto.randomUUID();
}

function p(content: string): Block {
  return { id: id(), type: "paragraph", content };
}

function h(level: 1 | 2 | 3, content: string): Block {
  return { id: id(), type: "heading", content, meta: { level } };
}

function li(content: string): Block {
  return { id: id(), type: "list", content };
}

function ol(content: string): Block {
  return { id: id(), type: "orderedList", content };
}

function task(content: string, checked = false): Block {
  return { id: id(), type: "taskList", content, meta: { checked } };
}

function quote(content: string): Block {
  return { id: id(), type: "blockquote", content };
}

function code(content: string, language = "bash"): Block {
  return { id: id(), type: "codeBlock", content, meta: { language } };
}

function divider(): Block {
  return { id: id(), type: "divider", content: "" };
}

function callout(
  content: string,
  calloutType: "default" | "info" | "success" | "warning" | "error" = "default"
): Block {
  return { id: id(), type: "callout", content, meta: { calloutType } };
}

function page(title: string, blocks: Block[], order: number): Page {
  return { id: id(), title, parentId: null, order, blocks };
}

// ---------------------------------------------------------------------------
// Demo content
// ---------------------------------------------------------------------------

const PROJECTS: Array<{
  name: string;
  slug: string;
  pages: Page[];
}> = [
  {
    name: "Engineering Wiki",
    slug: "engineering-wiki",
    pages: [
      page("Getting Started", [
        h(2, "Welcome to the Engineering Wiki"),
        p("The central knowledge base for our engineering team — onboarding guides, architecture decisions, and runbooks all live here."),
        callout("Use / while editing to insert any block type — headings, lists, code, callouts, and more.", "info"),
        divider(),
        h(2, "Prerequisites"),
        li("Node.js 18 or higher"),
        li("pnpm (preferred) or npm"),
        li("Docker Desktop for local Postgres"),
        divider(),
        h(2, "Initial Setup"),
        ol("Clone the repository from GitHub"),
        ol("Run npm install in the project root"),
        ol("Copy .env.example to .env.local and fill in the values"),
        ol("Run npm run dev — the app starts on http://localhost:3000"),
        divider(),
        h(2, "First Steps"),
        p("Once you're running locally, open the app, sign in with Google, and create your first project. The editor supports rich content — try the slash command menu to explore all block types."),
      ], Date.now()),

      page("Architecture Overview", [
        h(2, "System Architecture"),
        p("Our stack is Next.js 15 on the frontend, Supabase (PostgreSQL + Auth) as the backend, and Vercel for hosting. The architecture is deliberately simple — no microservices, no message queues."),
        divider(),
        h(3, "Frontend"),
        p("Built with Next.js 15 App Router. Server Components are the default; Client Components are used only where interactivity is required. All data fetching happens server-side in page components."),
        h(3, "Database"),
        p("PostgreSQL via Supabase. Row Level Security (RLS) enforces data isolation at the DB layer — no user can read or write another user's data even if the application layer has a bug."),
        h(3, "Authentication"),
        p("Google OAuth via Supabase Auth. Sessions are managed with JWTs stored in httpOnly cookies and refreshed transparently by Next.js middleware."),
        divider(),
        callout("Never bypass RLS policies for convenience. All write operations must be validated at the database level.", "warning"),
        divider(),
        h(2, "Key Decisions"),
        li("JSONB for block storage — no separate blocks table, simpler queries, flexible schema"),
        li("Server Components for all data fetching — no client-side loading states on initial render"),
        li("Optimistic updates in Zustand — UI feels instant, DB writes are fire-and-forget"),
      ], Date.now() + 1),

      page("API Reference", [
        h(2, "API Reference"),
        p("All endpoints follow REST conventions and return JSON. Authentication is required for all write operations. Reads on public projects work without a session."),
        divider(),
        h(3, "Projects"),
        ol("GET /api/projects — list all projects for the authenticated user"),
        ol("POST /api/projects — create a new project (name, slug)"),
        ol("PATCH /api/projects/:id — update project name or slug"),
        ol("DELETE /api/projects/:id — delete a project and all its pages"),
        divider(),
        h(3, "Pages"),
        ol("GET /api/projects/:id/pages — list all pages with blocks"),
        ol("POST /api/projects/:id/pages — create a new page"),
        ol("PATCH /api/pages/:id — update title, order, or block content"),
        ol("DELETE /api/pages/:id — delete a page (cascades to children)"),
        divider(),
        h(3, "Example Response"),
        code(`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Getting Started",
  "order": 1714000000000,
  "blocks": [
    { "id": "abc123", "type": "heading", "content": "Welcome", "meta": { "level": 2 } },
    { "id": "def456", "type": "paragraph", "content": "Hello world." }
  ]
}`, "json"),
      ], Date.now() + 2),
    ],
  },

  {
    name: "Product Roadmap",
    slug: "product-roadmap",
    pages: [
      page("Q2 2025 Roadmap", [
        h(2, "Q2 2025 Roadmap"),
        callout("Q2 runs April 1 – June 30, 2025. This document tracks team commitments and key results.", "info"),
        divider(),
        h(3, "Theme: Scale & Reliability"),
        p("This quarter we focus on performance improvements, security hardening, and laying the groundwork for enterprise features."),
        divider(),
        h(3, "Initiatives & Status"),
        task("Migrate authentication to Supabase Auth", true),
        task("Move all data from localStorage to Supabase", true),
        task("Improve editor performance for large documents"),
        task("Launch public share links with read-only view", true),
        task("Achieve 99.9% uptime SLA"),
        task("Launch public API v1"),
        divider(),
        h(3, "Success Metrics"),
        li("P95 page load under 1.5 seconds"),
        li("Zero data-loss incidents"),
        li("50% reduction in bug reports vs Q1"),
      ], Date.now()),

      page("Feature Backlog", [
        h(2, "Feature Backlog"),
        p("Prioritized list of features under consideration. Updated weekly during planning sessions. Add ideas in Slack #product before they make it here."),
        divider(),
        h(3, "High Priority"),
        li("Inline comments and @mention annotations"),
        li("Export to PDF and Markdown"),
        li("Version history and point-in-time restore"),
        li("Real-time collaborative editing"),
        divider(),
        h(3, "Medium Priority"),
        li("Custom themes and workspace branding"),
        li("Slack and GitHub integrations"),
        li("Advanced permission roles (viewer / editor / admin)"),
        li("Full-text search across all pages"),
        divider(),
        h(3, "Low Priority"),
        li("Mobile app (iOS and Android)"),
        li("Offline support with background sync"),
        li("AI writing assistant"),
        divider(),
        callout("Items in High Priority are committed for the next two quarters. Medium and Low are not scheduled.", "default"),
      ], Date.now() + 1),

      page("Release Notes", [
        h(2, "Release Notes"),
        divider(),
        h(3, "v1.2.0 — May 2025"),
        callout("Released May 1, 2025 · 0 incidents", "success"),
        li("Google OAuth login via Supabase Auth"),
        li("All project and page data migrated to Supabase"),
        li("Row Level Security enforced on all tables"),
        li("Slash command menu with 15 block types"),
        li("Share links with read-only view"),
        divider(),
        h(3, "v1.1.0 — April 2025"),
        li("Drag-and-drop page reordering in the sidebar"),
        li("Nested page hierarchy (unlimited depth)"),
        li("Double-click to rename pages inline"),
        li("Project slug editing from the sidebar"),
        divider(),
        h(3, "v1.0.0 — March 2025"),
        li("Initial release with basic rich text editor"),
        li("Project and page management"),
        li("localStorage persistence"),
        divider(),
        quote("We ship small and often. Every release should make at least one user's day better."),
      ], Date.now() + 2),
    ],
  },

  {
    name: "Team Handbook",
    slug: "team-handbook",
    pages: [
      page("Our Values", [
        h(2, "Our Values"),
        p("These principles guide how we work, make decisions, and treat each other. They're not aspirational — they're descriptive of the team we've already built."),
        divider(),
        h(3, "Ship with care"),
        p("We move fast but never cut corners on quality. Code reviews, tests, and documentation are part of the job, not optional extras."),
        h(3, "Default to transparency"),
        p("Share context early and often. Write decisions down. When in doubt, over-communicate. Async-first means written-first."),
        h(3, "Own your outcomes"),
        p("Take responsibility for the full lifecycle of your work — from design to deployment to monitoring. Done means running in production, not merged to main."),
        h(3, "Grow together"),
        p("Invest in your teammates. Give generous, specific feedback. Ask for help early. Learning in public is a sign of strength, not weakness."),
        divider(),
        callout("Values aren't a checklist. If something feels off, name it — that's how we keep these real.", "default"),
      ], Date.now()),

      page("Onboarding Checklist", [
        h(2, "Onboarding Checklist"),
        callout("Complete these in your first two weeks. Your buddy is your first call if you get stuck.", "info"),
        divider(),
        h(3, "Week 1 — Get Set Up"),
        task("Set up local development environment", true),
        task("Get access to GitHub, Supabase, Vercel, and Linear", true),
        task("Read Architecture Overview in the Engineering Wiki", true),
        task("Read Our Values in the Team Handbook", true),
        task("Ship your first small improvement or bug fix"),
        divider(),
        h(3, "Week 2 — Go Deeper"),
        task("Pair with a team member on a real task"),
        task("Review the API Reference docs"),
        task("Attend a planning session"),
        task("Give a 10-minute demo of something you built or learned"),
        task("Share one thing you'd improve about the onboarding process"),
        divider(),
        h(3, "Ongoing"),
        li("Weekly async standup in Slack every Monday"),
        li("Join #engineering and #product Slack channels"),
        li("Add your working hours and timezone to your profile"),
      ], Date.now() + 1),

      page("Processes & Rituals", [
        h(2, "Processes & Rituals"),
        divider(),
        h(3, "Weekly Rhythm"),
        ol("Monday — async standup in Slack: what you're working on, any blockers"),
        ol("Wednesday — 30-minute engineering sync (optional, always recorded)"),
        ol("Friday — ship something, then share a demo or one-paragraph write-up"),
        divider(),
        h(3, "Code Review"),
        p("All PRs require at least one approval before merging. Reviewers should respond within one business day. If your PR is urgent, say so in Slack."),
        quote("Critique the code, not the person. Assume good intent."),
        li("Keep PRs small — under 400 lines of diff is the target"),
        li("Write a clear description with context and a test plan"),
        li("Resolve all comments before merging, or explicitly defer with a ticket"),
        divider(),
        h(3, "Incident Response"),
        ol("Detect: alert fires via Vercel / Supabase monitoring"),
        ol("Acknowledge: on-call responds within 15 minutes"),
        ol("Mitigate: rollback or hotfix as appropriate"),
        ol("Communicate: post updates in #incidents every 30 minutes"),
        ol("Review: incident report written within 48 hours"),
        callout("For P0 incidents, loop in the team lead immediately regardless of timezone.", "warning"),
      ], Date.now() + 2),
    ],
  },
];

// ---------------------------------------------------------------------------
// Public function
// ---------------------------------------------------------------------------

export async function createDemoProjects(userId: string): Promise<void> {
  for (const def of PROJECTS) {
    const project = await insertProject(userId, def.name, def.slug);
    for (const pg of def.pages) {
      await insertPage(project.id, pg);
    }
  }
}
