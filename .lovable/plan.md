# Founder OS — Modular Refactor + Zero-Cost AI Bridge

A focused refactor of the dashboard, agenda model, and processing inbox. No paid APIs, no automatic task creation. The user remains the filter.

## 1. Language & model shift (Agenda)

- Rename "Today's Tasks" → **Current Agenda**. Remove "Overdue" everywhere.
- Tasks have a `status`: `active` | `focus` | `paused` | `archived` | `completed`. Items persist in Current Agenda until the user changes their status — `dueDate` becomes optional metadata, never a filter.
- New **Focus Now** lane: a manual user-curated subset (toggle "Move to Focus" on any card).
- Soft-delete via `archived`; trash icon → archive by default, with explicit Delete in a menu.

Migration: add `status text default 'active'` to `tasks` + index. Backfill `status='completed'` where `completed=true`.

## 2. Modular dashboard

Rebuild `CommandCentre` as a **block grid** of independent modules, each in its own card component under `src/components/modules/`:

```
ModuleCard (shell) — title, action slot, quick-add slot, body
├── CurrentAgendaModule       (checkbox-selectable rows + quick add)
├── FocusNowModule
├── ProcessingInboxModule     (pending suggestions count + recent cards)
├── ActiveProjectsModule      (placeholder list, quick add)
├── PeopleModule              (uses existing contacts)
├── OpportunitiesModule       (existing)
├── WaitingOnModule           (new lightweight table)
├── QuickNotesModule          (new)
├── IdeasIncubationModule     (existing ideas)
├── StrategicSignalsModule    (new)
├── OpenQuestionsModule       (new)
├── RecentActivityModule      (derived feed)
├── BriefingsArchiveModule    (last 5 briefings)
└── QuickCaptureModule        (universal capture → routes by prefix or chooser)
```

Layout: 12-col CSS grid, 24px outer padding, 20px gap, `max-w-[1600px]`. Tablet → 2-col. Mobile → single column with priority order: Quick Capture, Current Agenda, Focus Now, Processing Inbox, Active Projects/Recent Activity. Floating "+" capture button on mobile.

New lightweight tables (migration): `notes`, `waiting_on`, `strategic_signals`, `open_questions`, `projects` — all `(id, user_id, title, body, status, created_at, updated_at)` shape with RLS.

## 3. Selection + Export to ChatGPT

Selection state in `CurrentAgendaModule`:
- Each row gets a checkbox; selected rows get a left accent border + tinted bg.
- Toolbar appears when ≥1 selected: `Select all visible`, `Deselect all`, `Export to ChatGPT (n)`.

`ExportToChatGPTModal` builds a deterministic plain-text block:

```
# Founder OS — Task Processing Request
Date: 2026-05-17
Context: Current Agenda export
Selected items: 3

## Task 1
- id: <uuid>
- title: ...
- project: ...
- status: active
- priority: high
- due: 2026-05-20
- notes: ...
- help requested: recommendation, next steps, draft wording

(repeat per task)

---
Instructions:
Treat each task as a separate item. For each one, provide a clear
recommendation, next steps, any useful draft wording or structured
output, and then create a dashboard-ready return block that can be
pasted back into the dashboard.

Return format (strict, one per task):
=== TASK <id> ===
type: next_action | decision | draft | research | admin | follow_up | project_note
title: ...
recommendation: ...
next_steps:
- ...
draft: |
  ...
=== END ===
```

Modal: Copy button, character count, instructional footer. No network call.

## 4. Import from ChatGPT

New surface on Processing Inbox: tab/section "Import from ChatGPT".

Parser `src/lib/chatgptImportParser.ts`:
- Splits on `=== TASK <id> ===` … `=== END ===`.
- Extracts `type`, `title`, `recommendation`, `next_steps`, `draft`.
- Tolerant of whitespace/markdown.
- Returns `ImportedSuggestion[]`.

Each parsed item becomes a row in `briefing_suggestions` with a new `source='chatgpt_import'` and `linked_task_id` (new nullable column). They appear in Processing Inbox as review cards.

Review card actions: **Accept** (no-op marks accepted), **Edit**, **Add to Agenda**, **Convert to Project**, **Add to Focus Now**, **Archive**, **Delete**, **Link to Existing Project**. Nothing mutates the linked task automatically.

## 5. Processing Inbox refinements

- Keep existing daily-briefing paste flow.
- Add the ChatGPT-import textarea above the recent briefings list.
- Suggestion card actions extended (above). All non-destructive by default.

## 6. Project workspaces (lightweight)

Add `projects` table + `/projects/:id` route. Workspace renders a vertical stack of modules filtered to that project: linked agenda items, notes, opportunities, people, strategic signals, open questions, ideas, recent activity. Full spatial board is out-of-scope for this pass; modules use the same `ModuleCard` shell so they can be rearranged later.

Add nullable `project_id` to: `tasks`, `ideas`, `notes`, `waiting_on`, `opportunities`, `strategic_signals`, `open_questions`.

## 7. Design system

Update `index.css` tokens to spec:
- Dark: bg `#070B14`, surface `#0F1728`, card `rgba(18,24,38,0.82)`, border `rgba(255,255,255,0.08)`, fg `#F5F7FB`, muted `#A7B0C0`, accents purple `#A855F7`, blue `#4F8CFF`, green `#34D399`, coral `#FF7A59`.
- Light: bg `#F7F8FC`, surface `#FFFFFF`, card `rgba(255,255,255,0.92)`, border `rgba(15,23,42,0.08)`, fg `#111827`, muted `#5B6475`, accents per spec.
- Theme toggle in sidebar footer (class-based, persisted).
- Card radius `20px`, padding `20-24px`, hover `translateY(-2px)`, transition `180ms ease`.
- Type scale: hero 48 / section 28 / card 18 / body 15-16 / meta 12-13. Instrument Serif headings, Inter body (already loaded).
- Quick-add inputs: 48-56px height, rounded, inline action, audited contrast in both themes.

## 8. Files

New:
- `src/components/modules/ModuleCard.tsx`
- `src/components/modules/{CurrentAgenda,FocusNow,ProcessingInbox,ActiveProjects,People,Opportunities,WaitingOn,QuickNotes,IdeasIncubation,StrategicSignals,OpenQuestions,RecentActivity,BriefingsArchive,QuickCapture}Module.tsx`
- `src/components/agenda/ExportToChatGPTModal.tsx`
- `src/components/agenda/ImportFromChatGPT.tsx`
- `src/lib/chatgptExport.ts`
- `src/lib/chatgptImportParser.ts`
- `src/hooks/use{Notes,WaitingOn,StrategicSignals,OpenQuestions,Projects}.ts`
- `src/pages/ProjectWorkspace.tsx`
- `src/components/ThemeToggle.tsx` + `src/hooks/useTheme.ts`

Edited:
- `src/index.css`, `tailwind.config.ts` — token overhaul + light mode.
- `src/components/CommandCentre.tsx` → modular grid.
- `src/pages/ProcessingInbox.tsx` → add import flow + extended actions.
- `src/components/AppSidebar.tsx` → add Projects/Notes/Waiting On routes + theme toggle.
- `src/types/task.ts` → add `status`, `projectId`.
- `src/lib/dataService.ts`, `src/hooks/useTasks.ts` → status helpers, drop overdue concepts.
- `src/App.tsx` → routes for new pages.

Migration (single file): new tables (`projects`, `notes`, `waiting_on`, `strategic_signals`, `open_questions`) + RLS, `tasks.status`, `tasks.project_id`, `briefing_suggestions.source`, `briefing_suggestions.linked_task_id`, `briefing_suggestions.next_steps jsonb`, `briefing_suggestions.draft text`.

## Out of scope (this pass)

- Drag-and-drop module rearrangement (grid is fixed for now; shells are ready).
- Full spatial project board, screenshots/file attachments in workspaces.
- Mobile sticky bottom nav (will keep sidebar + floating capture button).

If you approve, I'll ship in this order: migration → tokens/theme → modules + dashboard → export/import → processing inbox actions → projects stub.
