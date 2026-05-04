
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/integrations/api/client';
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
        
        const { data } = await apiClient.get('/api/users/role');
        
        if (data?.role === 'admin') {
          setRole('admin');
        } else if (data?.role === 'teacher') {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
