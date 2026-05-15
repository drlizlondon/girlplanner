# Founder OS Command Centre — Implementation Plan

This is a large redesign. I'll break it into phases so you can review the direction before I build everything. The core principle throughout: **the Agenda is the trusted system; nothing auto-creates tasks.**

---

## Phase 1 — Foundation (design system + navigation shell)

**Visual language**
- Switch to a cinematic dark theme as the default: deep navy/charcoal background, soft purple accents, subtle glow cards, generous whitespace.
- Update `index.css` and `tailwind.config.ts` with new semantic tokens (background, surface, surface-elevated, border-subtle, accent, accent-glow, text-primary/secondary/muted).
- Premium typography: keep Dancing Script only for the wordmark; switch body/UI to a clean sans (Inter / Geist-like) with tighter tracking.
- Card primitives: rounded-2xl, soft inner border, subtle radial glow on hover, no harsh shadows.

**App shell**
- Replace the top horizontal nav with a left sidebar using shadcn `Sidebar` (collapsible to icon mini-rail).
- Sidebar items: Command Centre, Agenda, Processing Inbox, Projects, Ideas, Opportunities, Calendar, People, Archive, Search.
- Sidebar shows active route, user avatar at bottom, sign-in/out.
- Wrap all routes in a single `AppLayout` with `SidebarProvider`.

---

## Phase 2 — Database (Lovable Cloud)

Two new tables with RLS (user-scoped):

**`daily_briefings`** — date, raw_text, overview, executive_signals, project_updates (jsonb), strategic_insights (jsonb), open_questions (jsonb), parked_ideas (jsonb).

**`briefing_suggestions`** — briefing_id, type (`priority_action` | `follow_up` | `insight` | `question` | `idea`), title, description, project, priority, source_section, status (`pending` | `accepted` | `saved` | `archived`).

Existing tables (tasks, ideas, opportunities, contacts, profiles, task_types) stay as-is. New `projects` field on suggestions is just text for now — Projects page in a later phase will formalise it.

---

## Phase 3 — Processing Inbox page (`/inbox`)

**Top:** Title "Processing Inbox" + subtitle "Paste a daily report and decide what deserves to become part of your system."

**Paste box:** large premium textarea, placeholder "Paste Daily Executive Processing report…", single primary button "Create Briefing".

**Deterministic parser** (no AI): splits the markdown by `##` / `###` headings, recognising:
- Overview
- Executive Signals
- Priority Actions → suggestion cards (type=priority_action)
- Possible Follow Ups → suggestion cards (type=follow_up)
- Project Updates → grouped by project sub-heading
- Strategic Insights → suggestion cards (type=insight)
- Open Questions → suggestion cards (type=question)
- Parked Ideas → suggestion cards (type=idea)

Bullet items under each section become individual suggestion rows. Project tags inferred from `[BishBash]`-style brackets or sub-headings.

**After submission** the page renders the saved briefing:

1. **Executive Summary card** — editorial layout, date + overview + signals, calm and readable.
2. **Priority Actions** — review cards with priority pill, title, project tag, editable description, source section. Buttons: *Add to Agenda*, *Edit*, *Archive*, *Save as Idea*.
3. **Follow Ups** — softer cards. Buttons: *Convert to Task*, *Save for Later*, *Archive*.
4. **Project Updates** — grouped by project, each card lists updates + next steps + linked actions/ideas.
5. **Strategic Insights** — softer visual weight, expandable. Buttons: *Save*, *Link to Project*, *Archive*.
6. **Open Questions** — expandable thinking-prompt cards.
7. **Parked Ideas** — Idea Vault cards. Buttons: *Save Idea*, *Expand Later*, *Convert to Project*, *Archive*.

**Critical:** every action is manual. "Add to Agenda" inserts into `tasks`, marks suggestion `accepted`, leaves the briefing intact.

---

## Phase 4 — Command Centre (`/`)

Replaces the current Index landing flow for signed-in users. Agenda-first.

**Top strip** (small, calm metric chips, not a dashboard wall): Today's Tasks · Overdue · Follow Ups · Meetings.

**Hero — Today's Agenda** (dominates the page):
- Sections: Today, This Week, Overdue, Completed (collapsible, visually minimised).
- Inline-edit titles, due dates, project tags, priority.
- Drag-and-drop reordering within a section (using `@dnd-kit` — already light, no heavy deps).
- Fast keyboard-friendly "+ add task" row at top of Today.

**Right sidebar — Processing Review** (secondary, muted):
- Suggested Actions (pending priority_action suggestions across recent briefings)
- Interesting Ideas
- Follow Ups
- Opportunities
- Each row links into the relevant briefing/page. Visual treatment makes clear these are *optional*, not commitments.

---

## Phase 5 — Briefing Archive (`/inbox/archive`)

List previous briefings by date with summary preview, accepted-task count, saved-idea count, archived count. Click → full briefing view (same component as post-submission view).

---

## Phase 6 — Stub pages for new sidebar entries

To keep the nav coherent without scope-creeping, these get minimal placeholder pages this round:
- Projects, Calendar, Archive, Search → "Coming soon" with consistent styling.
- Ideas, Opportunities, People → wire existing pages (`GoodIdeas`, `Opportunities`, `PeopleToContact`) into the new shell.

---

## Technical notes

- New deps: `@dnd-kit/core` + `@dnd-kit/sortable` for agenda DnD.
- Parser lives in `src/lib/briefingParser.ts`, pure function, unit-testable.
- Suggestion → task conversion goes through existing `dataService` so it works in both local and cloud modes. (Briefings themselves are cloud-only since they're a new table; signed-out users see a "Sign in to use Processing Inbox" prompt.)
- All colours via semantic tokens — no raw hex in components.
- Header component is replaced by the sidebar; old `Header` removed from pages.

---

## What I'd like to confirm before building

1. **Scope of this round** — happy to ship Phases 1–5 in this pass and leave Projects/Calendar/Archive/Search as styled stubs (Phase 6)? Or do you want any of those built fully now?
2. **Briefings are cloud-only** (require sign-in) — OK? Local-only users keep using the Agenda exactly as today.
3. **Drag-and-drop on Agenda** — adding `@dnd-kit` (~15kb). OK to add?

If yes to all three, I'll proceed straight through Phases 1 → 5.