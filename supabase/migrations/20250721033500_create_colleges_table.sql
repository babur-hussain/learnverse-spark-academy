-- Migration: Create colleges table
CREATE TABLE IF NOT EXISTS public.colleges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_colleges_name ON public.colleges(name); 