-- Migration: Create course_resources table for course file/folder management
CREATE TABLE IF NOT EXISTS public.course_resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    path text NOT NULL, -- Full path relative to course root, e.g. 'Science Resources/Chapter 1/Notes.pdf'
    name text NOT NULL, -- File or folder name
    type text NOT NULL CHECK (type IN ('file', 'folder')), -- 'file' or 'folder'
    size bigint, -- File size in bytes (null for folders)
    url text, -- Public URL for files (null for folders)
    mime_type text, -- MIME type for files (null for folders)
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON public.course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_path ON public.course_resources(path); 