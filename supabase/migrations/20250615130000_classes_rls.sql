-- Enable RLS on classes table
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for all authenticated users
CREATE POLICY "Allow read classes for authenticated" ON public.classes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow insert for admins only
CREATE POLICY "Allow insert classes for admins" ON public.classes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Allow update for admins only
CREATE POLICY "Allow update classes for admins" ON public.classes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Allow delete for admins only
CREATE POLICY "Allow delete classes for admins" ON public.classes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ); 