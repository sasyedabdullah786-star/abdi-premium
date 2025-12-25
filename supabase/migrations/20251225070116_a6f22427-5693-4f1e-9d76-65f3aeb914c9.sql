-- Add resource_type column to lessons table for categorizing content
ALTER TABLE public.lessons 
ADD COLUMN resource_type text DEFAULT 'video';

-- Add a comment explaining valid values
COMMENT ON COLUMN public.lessons.resource_type IS 'Type of resource: video, worksheet, notes, pdf, homework, dpp, timetable, pyq';