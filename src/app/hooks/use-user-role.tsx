
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'teacher' | 'student';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // SECURITY FIX: Remove email-based admin bypass and implement proper role verification
        // Query user_roles table for proper role verification
        // Note: Using existing schema without is_active and verified columns
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (roleError) {
          console.error('Error in role query:', roleError);
          throw roleError;
        }
          
        // Grant admin role if explicitly assigned in database
        if (roleData?.role === 'admin') {
          setRole('admin');
        } else if (roleData?.role === 'teacher') {
          setRole('teacher');
        } else {
          // Default to student if no role found
          setRole('student');
        }
      } catch (e) {
        console.error('Error in useUserRole hook:', e);
        setError(e instanceof Error ? e : new Error('Unknown error occurred'));
        
        // Show user-friendly error message
        toast({
          title: "Role Verification Error",
          description: "There was a problem verifying your role. Defaulting to student access.",
          variant: "destructive"
        });
        
        // Default to student role on error
        setRole('student');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user, toast]);

  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher' || role === 'admin';
  const isStudent = role === 'student';

  return {
    role,
    isAdmin,
    isTeacher,
    isStudent,
    isLoading,
    error
  };
};
