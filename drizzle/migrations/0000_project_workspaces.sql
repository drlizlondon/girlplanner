ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

CREATE TABLE public.project_roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'now',
  target_date DATE,
  done BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_roadmap_items TO authenticated;
GRANT ALL ON public.project_roadmap_items TO service_role;
ALTER TABLE public.project_roadmap_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY roadmap_select_own ON public.project_roadmap_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY roadmap_insert_own ON public.project_roadmap_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY roadmap_update_own ON public.project_roadmap_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY roadmap_delete_own ON public.project_roadmap_items FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_roadmap_updated_at BEFORE UPDATE ON public.project_roadmap_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_roadmap_project ON public.project_roadmap_items (project_id);

CREATE TABLE public.project_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  caption TEXT DEFAULT '',
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_screenshots TO authenticated;
GRANT ALL ON public.project_screenshots TO service_role;
ALTER TABLE public.project_screenshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY screenshots_select_own ON public.project_screenshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY screenshots_insert_own ON public.project_screenshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY screenshots_update_own ON public.project_screenshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY screenshots_delete_own ON public.project_screenshots FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_screenshots_updated_at BEFORE UPDATE ON public.project_screenshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_screenshots_project ON public.project_screenshots (project_id);