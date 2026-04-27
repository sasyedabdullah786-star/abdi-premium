-- Discussions table for course Q&A and threaded replies
CREATE TABLE public.discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read discussions"
  ON public.discussions FOR SELECT USING (true);

CREATE POLICY "Authenticated can post discussions"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own discussions"
  ON public.discussions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own discussions"
  ON public.discussions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage discussions"
  ON public.discussions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_discussions_course ON public.discussions(course_id, created_at DESC);
CREATE INDEX idx_discussions_parent ON public.discussions(parent_id);

CREATE TRIGGER update_discussions_updated_at
BEFORE UPDATE ON public.discussions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.discussions;

-- Weekly goals table
CREATE TABLE public.weekly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  target_xp INTEGER NOT NULL DEFAULT 200,
  achieved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own goals"
  ON public.weekly_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own goals"
  ON public.weekly_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own goals"
  ON public.weekly_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_weekly_goals_updated_at
BEFORE UPDATE ON public.weekly_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();