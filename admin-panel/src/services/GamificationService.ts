
import apiClient from '@/integrations/api/client';
import type { Badge, UserBadge, UserXP, UserStreak, ActivityLog, BadgeType, BadgeTier } from '@/types/gamification';
import { toast } from 'sonner';

export class GamificationService {
  static async getUserXP(userId: string): Promise<UserXP | null> {
    try {
      const { data } = await apiClient.get(`/api/gamification/xp/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching user XP:', error);
      return null;
    }
  }

  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data } = await apiClient.get(`/api/gamification/badges/${userId}`);
      return (data || []).map((item: any) => ({
        ...item,
        badge: item.badge ? {
          ...item.badge,
          type: item.badge.type as BadgeType,
          tier: item.badge.tier as BadgeTier
        } : undefined
      })) as UserBadge[];
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  static async getUserStreak(userId: string): Promise<UserStreak | null> {
    try {
      const { data } = await apiClient.get(`/api/gamification/streak/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching user streak:', error);
      return null;
    }
  }

  static async getRecentActivity(userId: string, limit: number = 10): Promise<ActivityLog[]> {
    try {
      const { data } = await apiClient.get(`/api/gamification/activity/${userId}`, {
        params: { limit }
      });
      return (data || []).map((item: any) => ({
        ...item,
        metadata: item.metadata as Record<string, any> || {}
      })) as ActivityLog[];
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }

  static async logActivity(userId: string, activityType: string, xpEarned: number, metadata?: Record<string, any>): Promise<boolean> {
    try {
      await apiClient.post('/api/gamification/activity', {
        user_id: userId,
        activity_type: activityType,
        xp_earned: xpEarned,
        metadata
      });

      toast.success(`+${xpEarned} XP earned!`);
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      toast.error('Failed to log activity');
      return false;
    }
  }

  static async getLeaderboard(timeframe: 'week' | 'month' | 'all-time', limit: number = 10): Promise<UserXP[]> {
    try {
      const { data } = await apiClient.get('/api/gamification/leaderboard', {
        params: { timeframe, limit }
      });
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}
