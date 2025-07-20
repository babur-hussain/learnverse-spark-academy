-- Migration: Add college_id to courses and subjects
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS college_id uuid REFERENCES colleges(id) ON DELETE SET NULL;

ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS college_id uuid REFERENCES colleges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_college_id ON public.courses(college_id);
CREATE INDEX IF NOT EXISTS idx_subjects_college_id ON public.subjects(college_id); 