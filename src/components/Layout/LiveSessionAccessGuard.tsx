import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { AccessControlService } from '@/services/AccessControlService';
import { EducationalLoader } from '@/components/UI/educational-loader';

interface LiveSessionAccessGuardProps {
  children: ReactNode;
}

const LiveSessionAccessGuard: React.FC<LiveSessionAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { access, error, accessLevel, isAdmin, isInstructor } = 
          await AccessControlService.validateSessionAccess(user.id, sessionId);
        
        if (error) {
          console.error('Error validating access:', error);
          toast({
            title: "Access Error",
            description: "There was an error checking your access permissions. Please try again.",
            variant: "destructive"
          });
          setHasAccess(false);
        } else {
          console.log('Access check result:', { access, accessLevel, isAdmin, isInstructor });
          
          setHasAccess(access || isAdmin || isInstructor);
          
          if (!access && !isAdmin && !isInstructor) {
            toast({
              title: "Access Denied",
              description: accessLevel === 'subscription' 
                ? "This session requires an active subscription."
                : accessLevel === 'paid' 
                  ? "This session requires course purchase or subscription."
                  : "You don't have permission to access this live session.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Session access error:', error);
        toast({
          title: "Access Error",
          description: "Failed to verify session access. Please try again later.",
          variant: "destructive"
        });
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user, sessionId, toast, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <EducationalLoader message="Verifying your access..." />
      </div>
    );
  }

  if (!hasAccess && !isLoading) {
    return <Navigate to="/video-library" replace />;
  }

  return <>{children}</>;
};

export default LiveSessionAccessGuard;
