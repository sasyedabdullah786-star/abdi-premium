-- Ensure helper exists first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  total_lessons_completed INTEGER NOT NULL DEFAULT 0,
  total_courses_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public leaderboard" ON public.user_stats FOR SELECT USING (true);

CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Award',
  color TEXT NOT NULL DEFAULT 'primary',
  requirement_type TEXT NOT NULL DEFAULT 'xp',
  requirement_value INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admins manage badges" ON public.badges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view earned badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.badges (name, description, icon, color, requirement_type, requirement_value, sort_order) VALUES
  ('First Steps', 'Complete your first lesson', 'Footprints', 'primary', 'lessons', 1, 1),
  ('Dedicated Learner', 'Complete 10 lessons', 'BookOpen', 'secondary', 'lessons', 10, 2),
  ('Course Champion', 'Complete your first course', 'Trophy', 'accent', 'courses', 1, 3),
  ('Week Warrior', '7-day learning streak', 'Flame', 'destructive', 'streak', 7, 4),
  ('XP Master', 'Earn 1000 XP', 'Sparkles', 'primary', 'xp', 1000, 5);