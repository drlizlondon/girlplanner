-- Prune the command-centre sprawl to GirlPlanner's core loop.
--
-- Founder ruling 2026-09-20: these tables hold only test data and are safe to
-- drop. Each duplicates a concept that lives in another portfolio product:
--   * contacts / contact_history  -> MyBishBash People
--   * opportunities               -> Opportunity Engine
--   * strategic_signals           -> Mission Control
--
-- KEEP (the core loop): tasks, task_types, ideas, projects, notes, waiting_on,
-- open_questions, daily_briefings, briefing_suggestions, profiles, task_files.
--
-- DISCIPLINE: this repo applies migrations BY HAND in the Supabase SQL editor.
-- Do NOT expect a deploy to run it. Paste this file's body into the SQL editor
-- for project buhplmcahaahgimrkrgy when ready. CASCADE also removes the RLS
-- policies, triggers and indexes attached to each table.

BEGIN;

DROP TABLE IF EXISTS public.contact_history CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.opportunities CASCADE;
DROP TABLE IF EXISTS public.strategic_signals CASCADE;

-- The opportunities table had its own timestamp trigger function. With the
-- table gone, drop the now-orphaned function too. (update_updated_at_column is
-- shared by the kept tables and is intentionally left in place.)
DROP FUNCTION IF EXISTS public.update_opportunities_updated_at() CASCADE;

COMMIT;
