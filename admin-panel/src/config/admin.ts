
import { ADMIN_EMAIL } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';

// Deprecated - use useUserRole hook instead
export const isAdminUser = (email?: string): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};
