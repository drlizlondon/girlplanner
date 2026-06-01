
-- 1. Tasks: add status + project link
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS project_id uuid;

UPDATE public.tasks SET status = 'completed' WHERE completed = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);

-- 2. Briefing suggestions: add source, linked_task_id, next_steps, draft
ALTER TABLE public.briefing_suggestions
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'briefing',
  ADD COLUMN IF NOT EXISTS linked_task_id uuid,
  ADD COLUMN IF NOT EXISTS next_steps jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS draft text;

-- 3. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Notes
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  body text DEFAULT '',
  project_id uuid,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_select_own" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert_own" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update_own" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notes_delete_own" ON public.notes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Waiting on
CREATE TABLE IF NOT EXISTS public.waiting_on (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text DEFAULT '',
  who text,
  project_id uuid,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waiting_on TO authenticated;
GRANT ALL ON public.waiting_on TO service_role;
ALTER TABLE public.waiting_on ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waiting_on_select_own" ON public.waiting_on FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "waiting_on_insert_own" ON public.waiting_on FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "waiting_on_update_own" ON public.waiting_on FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "waiting_on_delete_own" ON public.waiting_on FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_waiting_on_updated_at BEFORE UPDATE ON public.waiting_on
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Strategic signals
CREATE TABLE IF NOT EXISTS public.strategic_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text DEFAULT '',
  project_id uuid,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strategic_signals TO authenticated;
GRANT ALL ON public.strategic_signals TO service_role;
ALTER TABLE public.strategic_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "strategic_signals_select_own" ON public.strategic_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "strategic_signals_insert_own" ON public.strategic_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strategic_signals_update_own" ON public.strategic_signals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "strategic_signals_delete_own" ON public.strategic_signals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_strategic_signals_updated_at BEFORE UPDATE ON public.strategic_signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Open questions
CREATE TABLE IF NOT EXISTS public.open_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text DEFAULT '',
  project_id uuid,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.open_questions TO authenticated;
GRANT ALL ON public.open_questions TO service_role;
ALTER TABLE public.open_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_questions_select_own" ON public.open_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "open_questions_insert_own" ON public.open_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "open_questions_update_own" ON public.open_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "open_questions_delete_own" ON public.open_questions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_open_questions_updated_at BEFORE UPDATE ON public.open_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
