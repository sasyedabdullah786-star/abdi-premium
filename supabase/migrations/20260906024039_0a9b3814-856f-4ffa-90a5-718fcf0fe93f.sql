ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR';

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS is_free_preview boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.course_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

GRANT SELECT, INSERT ON public.course_purchases TO authenticated;
GRANT ALL ON public.course_purchases TO service_role;

ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own purchases" ON public.course_purchases;
CREATE POLICY "Users view own purchases" ON public.course_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own purchase requests" ON public.course_purchases;
CREATE POLICY "Users create own purchase requests" ON public.course_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Admins manage purchases" ON public.course_purchases;
CREATE POLICY "Admins manage purchases" ON public.course_purchases
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.id = _course_id AND c.is_paid)
    OR (_user_id IS NOT NULL AND (
      public.has_role(_user_id, 'admin')
      OR EXISTS (
        SELECT 1 FROM public.course_purchases p
        WHERE p.course_id = _course_id AND p.user_id = _user_id AND p.status = 'paid'
      )
    ));
$$;

DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
CREATE POLICY "Lessons visible when unlocked" ON public.lessons
  FOR SELECT
  USING (is_free_preview OR public.has_course_access(auth.uid(), course_id));

CREATE TRIGGER update_course_purchases_updated_at
  BEFORE UPDATE ON public.course_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();