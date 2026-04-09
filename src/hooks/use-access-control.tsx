
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AccessControlService } from '@/services/AccessControlService';
import { Video, LiveSession, UserCourseAccess } from '@/types/video';

// In a real application, this would fetch from your backend
const fetchUserAccess = async (userId: string, courseId: string, batchId: string): Promise<UserCourseAccess> => {
  // Mock implementation - replace with actual API call
  return {
    userId,
    courseId,
    batchId,
    hasPurchased: true,
    hasSubscription: false,
    enrollmentDate: '2025-01-01T00:00:00Z'
  };
};

export const useAccessControl = (
  contentItem: Video | LiveSession | null,
  options?: { simulateRole?: 'student' | 'paid' | 'subscriber' }
) => {
  const { user } = useAuth();
  const [userAccess, setUserAccess] = useState<UserCourseAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccessInfo = async () => {
      if (!contentItem || !user) {
        setIsLoading(false);
        setHasAccess(false);
        setAccessError('User not authenticated or content not provided');
        return;
      }

      try {
        setIsLoading(true);
        
        // In a real app, fetch from your backend
        const access = await fetchUserAccess(
          user.id, 
          contentItem.courseId, 
          contentItem.batchId
        );
        
        // For admin preview/simulation
        if (options?.simulateRole) {
          if (options.simulateRole === 'student') {
            access.hasPurchased = false;
            access.hasSubscription = false;
          } else if (options.simulateRole === 'paid') {
            access.hasPurchased = true;
            access.hasSubscription = false;
          } else if (options.simulateRole === 'subscriber') {
            access.hasPurchased = true;
            access.hasSubscription = true;
          }
        }
        
        setUserAccess(access);
        
        // Check if user can access this content
        let canAccess = false;
        if ('scheduledStartTime' in contentItem) {
          // It's a live session
          canAccess = AccessControlService.canAccessLiveSession(
            contentItem as LiveSession,
            access
          );
        } else {
          // It's a video
          canAccess = AccessControlService.canAccessVideo(
            contentItem as Video,
            access
          );
        }
        
        setHasAccess(canAccess);
        
        if (!canAccess) {
          // Set appropriate error message
          if (contentItem.batchId !== access.batchId) {
            setAccessError('You are not enrolled in this batch');
          } else if (contentItem.accessLevel === 'subscription' && !access.hasSubscription) {
            setAccessError('This content requires an active subscription');
          } else if (contentItem.accessLevel === 'paid' && !access.hasPurchased && !access.hasSubscription) {
            setAccessError('This content requires course purchase');
          } else {
            setAccessError('Access denied');
          }
        } else {
          setAccessError(null);
        }
      } catch (error) {
        console.error('Error checking content access:', error);
        setAccessError('Error checking access permissions');
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccessInfo();
  }, [contentItem, user, options?.simulateRole]);

  return {
    hasAccess,
    isLoading,
    accessError,
    userAccess,
    isLocked: contentItem ? AccessControlService.getLockedStatus(contentItem, userAccess || {
      userId: user?.id || '',
      courseId: contentItem.courseId,
      batchId: contentItem.batchId,
      hasPurchased: false,
      hasSubscription: false
    }) : true
  };
};
