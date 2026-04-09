
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAIL } from '@/contexts/AuthContext';

interface InstructorRoleGuardProps {
  children: ReactNode;
}

const InstructorRoleGuard: React.FC<InstructorRoleGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const { isTeacher, isLoading, error } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isAdminByEmail = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  useEffect(() => {
    if (!isLoading && !isTeacher && !isAdminByEmail && user) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access instructor features.",
        variant: "destructive"
      });
      navigate('/', { replace: true });
    }
    
    if (error && user && !isAdminByEmail) {
      toast({
        title: "Role Verification Issue",
        description: "There was a problem verifying your role. Some features may be limited.",
        variant: "destructive"
      });
    }
  }, [isTeacher, isLoading, user, toast, error, isAdminByEmail, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
      </div>
    );
  }

  if (isTeacher || isAdminByEmail) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
};

export default InstructorRoleGuard;
