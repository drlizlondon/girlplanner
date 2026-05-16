# Founder OS — Local-First Implementation Pass

This pass keeps the existing cinematic visual identity but rebuilds the foundation around: local-only mode, day/night themes, mobile-first layout, manual ChatGPT bridge, and a config-driven template structure.

## 1. Config + theme foundation

**New files**
- `src/config/founderOS.ts` — central `founderOSConfig` (systemName, storageMode, sections, accentColour, tone, prompts).
- `src/lib/storageKeys.ts` — namespaced `founderOS.*` keys + helpers.
- `src/lib/theme.ts` + `src/hooks/useTheme.tsx` — provider managing `"day" | "night" | "system"`, persisted to `founderOS.theme`, applies `data-theme` to `<html>`.

**index.css**
- Replace existing HSL token block with the requested raw CSS variables (`--bg`, `--card`, `--card-soft`, `--text`, `--text-muted`, `--border`, `--input-bg`, `--input-text`, `--accent`, `--accent-gradient`, `--button-text`, `--shadow`) under `[data-theme="day"]` and `[data-theme="night"]`.
- Keep a thin shadcn compatibility layer: map shadcn semantic tokens (`--background`, `--foreground`, `--card`, `--primary`, `--border`, `--input`, `--muted`, `--sidebar-*`, etc.) to the new vars via HSL approximations so existing shadcn components continue to render correctly under both themes.
- Mobile typography utilities using `clamp()` for page/section/body sizes.
- `html, body, #root { width: 100%; max-width: 100vw; overflow-x: hidden; box-sizing: border-box; }`.

## 2. Mobile layout fixes

- `AppLayout`: main wrapper `min-w-0 overflow-x-hidden`, mobile horizontal padding 20px, bottom padding 120px, header height tightened on mobile (sidebar trigger left, storage chip right).
- `AppSidebar`: mobile drawer width `min(82vw, 340px)`.
- Replace ad-hoc `max-w-*` containers in `CommandCentre`, `ProcessingInbox`, `BriefingView`, `Agenda`, `Opportunities`, `GoodIdeas`, `PeopleToContact` with a shared `<PageShell>` component that enforces the responsive padding/width rules.
- Stats / metric cards → 4-col desktop, 2-col tablet, 1-col under 390px (`grid-cols-1 min-[391px]:grid-cols-2 md:grid-cols-4 gap-3.5`).
- Task rows: `whitespace-normal break-words [overflow-wrap:anywhere]`, remove fixed widths.
- Tables in Opportunities / People → card layout under `md`.

## 3. Local-Only mode

- `dataService.initialize()` no longer requires auth; always falls back to local. Cloud sync becomes opt-in (kept under the hood but not surfaced as the default).
- Remove the large Sign In / Local Storage promo panel from the dashboard.
- All section hooks (`useTasks`, `useOpportunities`, ideas, contacts, briefings, suggestions) read/write namespaced `founderOS.*` keys via a new `localStore` utility.
- Briefings + suggestions migrated from Supabase-only to local-first: `founderOS.processingInbox`, `founderOS.chatgptImports`, `founderOS.pendingSuggestions`, `founderOS.archivedSuggestions`, `founderOS.archive`.

## 4. Settings page (`/settings`)

New `src/pages/Settings.tsx` with:
- **Theme** — Day / Night / System segmented control.
- **Storage** — Current mode: Local-Only · Data location · Sync Off · No account required · Last export date · App version.
- **Data** — Export JSON (`founder-os-backup-YYYY-MM-DD.json`), Import JSON (validated), Clear local data (confirm modal).
- Copy: "Local-Only Mode keeps your data on this device. Export regularly if you want a backup."

`src/lib/backup.ts` — `exportAll()` / `importAll(json)` covering every namespaced key, with schema check.

## 5. Section quick capture + review controls

Shared `<QuickCapture placeholder onSubmit />` component used by Agenda, People, Projects, Ideas, Opportunities, Processing Inbox. Saved items expose Edit / Save / Archive / Delete with a confirm dialog on delete ("Delete this item? This cannot be undone.").

Stub `Projects` page wired to `founderOS.projects` so the section list matches config.

## 6. Manual ChatGPT bridge

**Agenda selection**
- Add checkbox column to task rows, `Select all visible` / `Deselect all` / `Export selected to ChatGPT` toolbar that appears when ≥1 selected.

**Export modal** (`src/components/chatgpt/ExportModal.tsx`)
- Builds the exact `FOUNDER_OS_CHATGPT_EXPORT` block from the spec, shows selected task count, Copy button (writes to clipboard + toast), saves to `founderOS.chatgptExports`.

**Import area** (`src/pages/ProcessingInbox.tsx` gains an "Import from ChatGPT" tab)
- Parser `src/lib/chatgptBridge.ts`:
  - `buildExport(tasks)` → string.
  - `parseReturn(text)` → array of suggestion objects. Detects `FOUNDER_OS_CHATGPT_RETURN`, splits on `TASK_RESPONSE` / `END_TASK_RESPONSE`, extracts fields.
  - On parse failure: gentle error toast + raw text saved to Processing Inbox.
- Each parsed item becomes a row in `founderOS.pendingSuggestions` with original task linkage.

**Review screen** (`src/pages/Review.tsx`, also embedded in Processing Inbox)
- Tabs: Pending · Accepted · Archived.
- Suggestion card shows original task, recommendation, next actions, draft text, target section, status, type badge.
- Actions: Accept (commits to target section via dataService, moves to Accepted), Edit (inline), Archive (moves to `founderOS.archivedSuggestions`), Delete (confirm).
- Mobile-first: cards stack, compact action row.

## 7. Search + Archive

- `src/pages/Search.tsx` — single input, filters across all `founderOS.*` collections client-side, grouped results by section, click jumps to source.
- `src/pages/Archive.tsx` — filter tabs by type (Tasks, Ideas, Opportunities, People, Suggestions, Briefings); restore / delete actions.

## 8. Visual clean-up

- Single `<Button>` variant policy: `primary` uses `--accent-gradient`, `secondary` uses `--card-soft`, `ghost` plain. Remove duplicated "+ + Add" labels.
- Inputs: `bg-[--input-bg] text-[--input-text] border-[--border]` so they're never black in Day Mode.
- Consistent radius `var(--radius)` (~14px small / 22px hero), shadow `var(--shadow)`.
- Script font (`Instrument Serif`) only on page titles.

## 9. Routing

`App.tsx` routes wrapped in `AppLayout`:
`/` Command Centre · `/agenda` · `/people` · `/projects` · `/ideas` · `/opportunities` · `/inbox` (Processing) · `/review` · `/search` · `/archive` · `/settings`. Sidebar items derive from `founderOSConfig.sections` + utility links.

## 10. Acceptance verification

- Manual viewport check at 390 / 430 / 768 / 1280.
- Verify: no horizontal scroll, themes persist after refresh, export round-trips through import, ChatGPT export+return parses, suggestion lifecycle works, dashboard renders with no account.

## Out of scope (explicit)

No OpenAI API, no automatic AI, no cloud-only features added, no auth-gating of core flows, no subscriptions, no collaboration. Existing Supabase tables remain but become an optional sync layer (not enabled by default in this pass).

## Notes for non-technical readers

- "Local-only" means everything lives in your browser. Clearing site data wipes it — use Export from Settings to back up.
- The ChatGPT bridge is purely copy/paste. No keys, no fees, no data leaving your machine except what you paste into ChatGPT yourself.
- Themes are remembered per browser. "System" follows your OS setting.
