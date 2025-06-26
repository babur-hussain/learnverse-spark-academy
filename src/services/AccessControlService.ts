
import { LiveSession, UserCourseAccess, Video } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';

export class AccessControlService {
  /**
   * Check if user can access a specific video
   */
  static canAccessVideo(video: Video, userAccess: UserCourseAccess): boolean {
    // If no access level specified, default to free
    const accessLevel = video.accessLevel || 'free';
    
    // Check based on access level
    switch (accessLevel) {
      case 'free':
        // Free videos can be accessed by anyone enrolled in the batch
        return true;
      case 'paid':
        // Paid videos require course purchase or subscription
        return userAccess.hasPurchased || userAccess.hasSubscription;
      case 'subscription':
        // Subscription videos require active subscription
        return userAccess.hasSubscription;
      default:
        return false;
    }
  }
  
  /**
   * Check if user can access a specific live session
   */
  static canAccessLiveSession(session: LiveSession, userAccess: UserCourseAccess): boolean {
    // If no access level specified, default to free
    const accessLevel = session.accessLevel || 'free';
    
    // Check based on access level
    switch (accessLevel) {
      case 'free':
        // Free sessions can be accessed by anyone enrolled in the batch
        return true;
      case 'paid':
        // Paid sessions require course purchase or subscription
        return userAccess.hasPurchased || userAccess.hasSubscription;
      case 'subscription':
        // Subscription sessions require active subscription
        return userAccess.hasSubscription;
      default:
        return false;
    }
  }
  
  /**
   * Get the lock status for content
   */
  static getLockedStatus(content: Video | LiveSession, userAccess: UserCourseAccess): boolean {
    // If no access level specified, default to free
    const accessLevel = content.accessLevel || 'free';
    
    // Check based on access level
    switch (accessLevel) {
      case 'free':
        // Free content is unlocked
        return false;
      case 'paid':
        // Paid content is locked if user hasn't purchased or subscribed
        return !(userAccess.hasPurchased || userAccess.hasSubscription);
      case 'subscription':
        // Subscription content is locked if user doesn't have active subscription
        return !userAccess.hasSubscription;
      default:
        return true;
    }
  }
  
  /**
   * Check if user can manage (create/update/delete) live sessions
   */
  static async canManageLiveSessions(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      const roles = data?.map(r => r.role) || [];
      return roles.includes('admin') || roles.includes('instructor');
    } catch (error) {
      console.error('Error checking live session management permissions:', error);
      return false;
    }
  }
  
  /**
   * Validate access via the edge function
   */
  static async validateSessionAccess(userId: string, sessionId: string): Promise<{
    access: boolean;
    isAdmin?: boolean;
    isInstructor?: boolean;
    accessLevel?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('check-live-access', {
        body: { userId, sessionId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating session access:', error);
      return { access: false, error: error.message };
    }
  }
}
