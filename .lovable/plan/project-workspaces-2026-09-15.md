# Project Workspaces

Turn each project from a one-line entry into a full workspace you can open, with a roadmap, notes, screenshots and everything already linked to it.

## What you'll get

**Projects page**
- Each project becomes a clickable card showing its name, a short description, and counts (roadmap items, notes, screenshots, linked agenda items).
- Click a project to open its own workspace page.

**Inside a project workspace**
- Header: editable project name and description, status (active / paused / done), and a back link.
- **Roadmap**: three stages — Now / Next / Later — shown as columns on desktop and stacked on mobile. Each item can carry an optional target date and be ticked off when done. Items move between stages, and completed items show clearly.
- **Notes**: quick-add note titles with an expandable body for longer writing; edit and delete inline.
- **Screenshots**: drag-and-drop or pick images to upload, shown as a thumbnail grid, click to view large, delete individually. Available when signed in; guests see a short sign-in prompt instead of the upload area.
- **Linked items**: agenda items, people, opportunities, ideas, signals and open questions already tied to this project, each grouped in its own small block with a link back to its page.
- **Recent activity** for the project.

## Technical notes

Database (one migration, additive):
- `project_roadmap_items` — `id`, `user_id`, `project_id`, `title`, `body`, `stage` (`now`/`next`/`later`), `target_date` (nullable), `done` boolean, `position`, timestamps. RLS + GRANTs scoped to `auth.uid()`; `updated_at` trigger.
- `project_screenshots` — `id`, `user_id`, `project_id`, `storage_path`, `caption`, `width`/`height` nullable, timestamps. Same RLS/GRANT pattern.
- `projects` gains nullable `description` and `position`; existing `status` reused for active/paused/done.
- Notes reuse the existing `notes.project_id`; no new table.

Storage:
- Private bucket `project-media` with `storage.objects` policies restricting select/insert/delete to `auth.uid()`-prefixed paths (`{user_id}/{project_id}/{file}`); images displayed via signed URLs.

Frontend:
- New route `/projects/:id` rendering `ProjectWorkspace` page composed of existing `ModuleCard` blocks.
- New components under `src/components/project/`: `ProjectHeader`, `RoadmapBoard`, `RoadmapItemRow`, `ProjectNotes`, `ProjectScreenshots`, `LinkedItemsBlock`.
- New hooks: `useProject(id)`, `useRoadmap(projectId)`, `useProjectScreenshots(projectId)`; linked items reuse `useSimpleTable` with a `project_id` filter (small addition to that hook's options).
- `/projects` page upgraded from the flat list to project cards linking into workspaces; dashboard Active Projects module links each row to its workspace.
- Styling follows current tokens: 20px radius cards, existing purple/blue/green/coral accents, no hardcoded colours; roadmap columns collapse to a single column on mobile with large tap targets.

Not included: drag-and-drop reordering across stages via pointer dragging (stage changes use a compact stage selector instead), and local-storage support for roadmap/screenshots for guests.
