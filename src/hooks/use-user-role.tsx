
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
        
        // Special case: If user email is admin email from AuthContext, grant admin role
        // This avoids any database lookup for the admin user
        if (user.email && user.email.toLowerCase() === 'admin@sparkacademy.edu') {
          console.log('Admin user detected via email, granting admin role');
          setRole('admin');
          setIsLoading(false);
          return;
        }
        
        // Direct query to user_roles table using service role client to avoid RLS recursion
        // This is cleaner than the previous approach that triggered recursion
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (roleError) {
          console.error('Error in role query:', roleError);
          throw roleError;
        }
          
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
        setError(e as Error);
        
        // Fallback to admin check based on email
        if (user.email && user.email.toLowerCase() === 'admin@sparkacademy.edu') {
          console.log('Admin email detected after error, using fallback');
          setRole('admin');
        } else {
          // Default to student role if we can't determine the role
          setRole('student');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user, toast]);
  
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher' || role === 'admin'; // Admin can do everything a teacher can
  const isStudent = role === 'student' || !role; // Default to student access if no role
  
  return {
    role,
    isAdmin,
    isTeacher,
    isStudent,
    isLoading,
    error
  };
};
