-- Migration: Add class_id to audio_files for class/course assignment
ALTER TABLE public.audio_files
ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES classes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_audio_files_class_id ON public.audio_files(class_id); 