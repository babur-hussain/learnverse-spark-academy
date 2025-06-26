import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const SUPABASE_URL = "https://wdmzylggisbudnddcpfw.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbXp5bGdnaXNidWRuZGRjcGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3Nzg2OTYsImV4cCI6MjA1OTM1NDY5Nn0.IBw-F_-mAZIuhClAB6RtFp34czJcAQWOXXfhZj0RMzE";

// Regular client with RLS
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Public client for anonymous access
export const publicSupabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-client-info': 'public-access',
      },
    },
  }
);
