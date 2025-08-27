-- Migration: Create audio_files table for class-wise audio library
CREATE TABLE IF NOT EXISTS public.audio_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    file_path text NOT NULL,
    file_size bigint,
    file_type text,
    is_public boolean DEFAULT false,
    uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    duration text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audio_files_course_id ON public.audio_files(course_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_is_public ON public.audio_files(is_public); 