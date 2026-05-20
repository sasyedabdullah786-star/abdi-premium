
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  viewed_lessons jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_lesson_id uuid,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own enrollments" ON public.enrollments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own enrollments" ON public.enrollments
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all enrollments" ON public.enrollments
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER enrollments_updated_at
BEFORE UPDATE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
