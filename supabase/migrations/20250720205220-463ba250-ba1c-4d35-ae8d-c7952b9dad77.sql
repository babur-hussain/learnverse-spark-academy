-- Create kids content tables for managing all educational content

-- Kids content categories table
CREATE TABLE public.kids_content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  age_group TEXT NOT NULL CHECK (age_group IN ('infants', 'preschool')),
  icon TEXT NOT NULL,
  color_gradient TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kids content items table
CREATE TABLE public.kids_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.kids_content_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'flashcard', 'game', 'rhyme', 'story', 'activity')),
  thumbnail_url TEXT,
  content_url TEXT, -- For videos, games, etc.
  content_data JSONB, -- For flashcard data, game config, etc.
  duration_minutes INTEGER, -- For videos and activities
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kids progress tracking
CREATE TABLE public.kids_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.kids_content_items(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_item_id)
);

-- Kids favorites
CREATE TABLE public.kids_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.kids_content_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_item_id)
);

-- Enable RLS
ALTER TABLE public.kids_content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kids_content_categories
CREATE POLICY "Everyone can view active categories" ON public.kids_content_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.kids_content_categories
  FOR ALL USING (is_admin());

-- RLS Policies for kids_content_items
CREATE POLICY "Everyone can view active content items" ON public.kids_content_items
  FOR SELECT USING (is_active = true AND EXISTS (
    SELECT 1 FROM public.kids_content_categories 
    WHERE id = kids_content_items.category_id AND is_active = true
  ));

CREATE POLICY "Admins can manage content items" ON public.kids_content_items
  FOR ALL USING (is_admin());

-- RLS Policies for kids_progress
CREATE POLICY "Users can view their own progress" ON public.kids_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress" ON public.kids_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" ON public.kids_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all progress" ON public.kids_progress
  FOR SELECT USING (is_admin());

-- RLS Policies for kids_favorites
CREATE POLICY "Users can manage their own favorites" ON public.kids_favorites
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all favorites" ON public.kids_favorites
  FOR SELECT USING (is_admin());

-- Create storage bucket for kids content
INSERT INTO storage.buckets (id, name, public) VALUES ('kids-content', 'kids-content', true);

-- Storage policies for kids content
CREATE POLICY "Everyone can view kids content files" ON storage.objects
  FOR SELECT USING (bucket_id = 'kids-content');

CREATE POLICY "Admins can upload kids content files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kids-content' AND is_admin());

CREATE POLICY "Admins can update kids content files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'kids-content' AND is_admin());

CREATE POLICY "Admins can delete kids content files" ON storage.objects
  FOR DELETE USING (bucket_id = 'kids-content' AND is_admin());

-- Insert default categories
INSERT INTO public.kids_content_categories (name, slug, description, age_group, icon, color_gradient, order_index) VALUES
  ('Colorful Notes & Flashcards', 'notes-flashcards-infants', 'Simple, image-rich educational flashcards with alphabets, shapes, and animals', 'infants', 'BookOpen', 'from-pink-400 to-rose-400', 1),
  ('Baby Videos', 'baby-videos', 'Short, engaging visual content with music and baby rhymes', 'infants', 'Play', 'from-purple-400 to-pink-400', 2),
  ('Baby Rhymes & Poems', 'baby-rhymes', 'Classic and modern baby rhymes with audio and animated visuals', 'infants', 'Music', 'from-indigo-400 to-purple-400', 3),
  ('Mini Baby Games', 'mini-baby-games', 'Simple touch-interactive games for sensory development', 'infants', 'Gamepad2', 'from-teal-400 to-cyan-400', 4),
  ('Interactive Learning Notes', 'learning-notes-preschool', 'Illustrated notes and worksheets for foundational learning', 'preschool', 'BookOpen', 'from-blue-500 to-indigo-500', 1),
  ('Educational Videos', 'educational-videos', 'Fun videos mixing entertainment with foundational learning', 'preschool', 'Play', 'from-green-500 to-teal-500', 2),
  ('Poems & Sing-Alongs', 'poems-singalongs', 'Animated poems with read-along features and karaoke subtitles', 'preschool', 'Music', 'from-orange-500 to-red-500', 3),
  ('Fun Learning Games', 'fun-learning-games', 'Engaging educational games for memory and problem-solving', 'preschool', 'Gamepad2', 'from-purple-500 to-pink-500', 4);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_kids_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kids_content_categories_updated_at
  BEFORE UPDATE ON public.kids_content_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kids_updated_at_column();

CREATE TRIGGER update_kids_content_items_updated_at
  BEFORE UPDATE ON public.kids_content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kids_updated_at_column();

CREATE TRIGGER update_kids_progress_updated_at
  BEFORE UPDATE ON public.kids_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kids_updated_at_column();