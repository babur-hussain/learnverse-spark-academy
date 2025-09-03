-- Add icon and description columns to classes table
ALTER TABLE public.classes 
ADD COLUMN icon text,
ADD COLUMN description text;