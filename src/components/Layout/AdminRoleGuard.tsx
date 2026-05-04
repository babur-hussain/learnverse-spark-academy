
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAIL } from '@/contexts/AuthContext';

interface AdminRoleGuardProps {
  children: ReactNode;
}

const AdminRoleGuard: React.FC<AdminRoleGuardProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isAdmin, isLoading, error } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isAdminByEmail = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  useEffect(() => {
    if (error && user && !isAdminByEmail) {
      toast({
        title: "Role Verification Issue",
        description: "There was a problem verifying your role. Some features may be limited.",
        variant: "destructive"
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isLoading, user, error, isAdminByEmail]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
      </div>
    );
  }

  if (isAdmin || isAdminByEmail) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access the admin area. Please sign in with an administrator account.
        </p>
        <button 
          onClick={() => {
            if (logout) {
              logout().then(() => navigate('/auth'));
            } else {
              navigate('/auth');
            }
          }} 
          className="w-full py-2 px-4 bg-primary text-white rounded hover:opacity-90 transition-opacity"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminRoleGuard;
