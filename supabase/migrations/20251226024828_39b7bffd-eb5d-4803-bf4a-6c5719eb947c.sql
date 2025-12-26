-- Add trending/featured flag to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';

-- Create announcements table for admin notices
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements" ON public.announcements
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active announcements" ON public.announcements
FOR SELECT USING (is_active = true);

-- Create testimonials table for student reviews
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_image text,
  course_name text,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  content text NOT NULL,
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials
FOR SELECT USING (is_approved = true);

-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text DEFAULT 'BookOpen',
  color text DEFAULT 'primary',
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage categories" ON public.categories
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view categories" ON public.categories
FOR SELECT USING (true);

-- Insert default categories
INSERT INTO public.categories (name, icon, color, sort_order) VALUES
('Science', 'Atom', 'primary', 1),
('Mathematics', 'Calculator', 'secondary', 2),
('Technology', 'Laptop', 'accent', 3),
('Languages', 'Globe', 'success', 4),
('Arts', 'Palette', 'warning', 5);

-- Add certificates_enabled to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificates_enabled boolean DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price text DEFAULT 'Free';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration text;