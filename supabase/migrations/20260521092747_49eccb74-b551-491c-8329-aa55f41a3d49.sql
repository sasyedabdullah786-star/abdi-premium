
-- =========================================
-- 1. MEDIA STORAGE BUCKET
-- =========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  524288000, -- 500 MB
  ARRAY[
    'image/png','image/jpeg','image/webp','image/gif','image/svg+xml',
    'video/mp4','video/webm','video/quicktime',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read of media
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Admin write
DROP POLICY IF EXISTS "Admins upload media" ON storage.objects;
CREATE POLICY "Admins upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins update media" ON storage.objects;
CREATE POLICY "Admins update media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins delete media" ON storage.objects;
CREATE POLICY "Admins delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));

-- =========================================
-- 2. NEXUS PUBLISHED ARTIFACTS
-- =========================================
CREATE TABLE IF NOT EXISTS public.nexus_published (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL DEFAULT 'Untitled',
  html        text NOT NULL,
  source_url  text,
  created_by  uuid,
  view_count  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nexus_published ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published" ON public.nexus_published;
CREATE POLICY "Anyone can view published" ON public.nexus_published
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authed can create published" ON public.nexus_published;
CREATE POLICY "Authed can create published" ON public.nexus_published
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners update published" ON public.nexus_published;
CREATE POLICY "Owners update published" ON public.nexus_published
  FOR UPDATE USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Owners delete published" ON public.nexus_published;
CREATE POLICY "Owners delete published" ON public.nexus_published
  FOR DELETE USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_nexus_published_updated_at
  BEFORE UPDATE ON public.nexus_published
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
