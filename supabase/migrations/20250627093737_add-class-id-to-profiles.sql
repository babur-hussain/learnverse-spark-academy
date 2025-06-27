-- Add class_id column to profiles table
ALTER TABLE profiles ADD COLUMN class_id uuid REFERENCES classes(id);
