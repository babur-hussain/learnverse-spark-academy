import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/UI/button';
import { auth, deleteUser } from '@/integrations/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to delete your account.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(auth.currentUser);
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      navigate('/');
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast({
          title: "Recent Login Required",
          description: "Please log out and log back in to verify your identity before deleting your account.",
          variant: "destructive",
        });
        navigate('/auth');
      } else {
        toast({
          title: "Deletion Failed",
          description: error.message || "An error occurred while deleting your account. Please try again or contact support.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-12 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-2xl border border-red-200 dark:border-red-900 w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-red-700 dark:text-red-400">Delete Account</h1>
          
          <div className="text-left space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Deleting your account is a permanent action. All your personal data, course progress, and saved materials will be removed from our systems according to our Data Deletion Policy.
            </p>
            <p className="font-semibold">
              This action cannot be undone.
            </p>
          </div>

          {!user ? (
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/auth')} variant="default" className="w-full sm:w-auto">
                Log In to Continue
              </Button>
            </div>
          ) : (
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/profile')} 
                variant="outline" 
                className="w-full sm:w-auto"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteAccount} 
                variant="destructive" 
                className="w-full sm:w-auto"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Permanently Delete My Account"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DeleteAccount;
