-- Add page_settings column to site_settings for controlling page visibility
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS page_settings jsonb DEFAULT '{
  "courses": {"enabled": true, "coming_soon": false},
  "blog": {"enabled": true, "coming_soon": false},
  "contact": {"enabled": true, "coming_soon": false},
  "institution": {"enabled": true, "coming_soon": false}
}'::jsonb;