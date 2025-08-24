-- Add college_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college_id uuid REFERENCES colleges(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON public.profiles(college_id);
