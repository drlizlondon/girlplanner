-- Daily briefings (raw + parsed sections)
CREATE TABLE public.daily_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  briefing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  raw_text TEXT NOT NULL,
  overview TEXT,
  executive_signals TEXT,
  project_updates JSONB DEFAULT '[]'::jsonb,
  strategic_insights JSONB DEFAULT '[]'::jsonb,
  open_questions JSONB DEFAULT '[]'::jsonb,
  parked_ideas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own briefings" ON public.daily_briefings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own briefings" ON public.daily_briefings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own briefings" ON public.daily_briefings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own briefings" ON public.daily_briefings
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_briefings_updated_at
  BEFORE UPDATE ON public.daily_briefings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Briefing suggestions (review cards)
CREATE TABLE public.briefing_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  briefing_id UUID NOT NULL REFERENCES public.daily_briefings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('priority_action','follow_up','insight','question','idea')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  project TEXT,
  priority TEXT DEFAULT 'medium',
  source_section TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','saved','archived')),
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.briefing_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions" ON public.briefing_suggestions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own suggestions" ON public.briefing_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suggestions" ON public.briefing_suggestions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suggestions" ON public.briefing_suggestions
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_briefing_suggestions_updated_at
  BEFORE UPDATE ON public.briefing_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_briefing_suggestions_briefing ON public.briefing_suggestions(briefing_id);
CREATE INDEX idx_briefing_suggestions_user_status ON public.briefing_suggestions(user_id, status);