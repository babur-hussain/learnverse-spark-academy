-- Migration: Add college_id to audio_files for college/course assignment
ALTER TABLE public.audio_files
ADD COLUMN IF NOT EXISTS college_id uuid REFERENCES colleges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_audio_files_college_id ON public.audio_files(college_id); 