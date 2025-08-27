
import { supabase } from '@/lib/supabase';
import type { Badge, UserBadge, UserXP, UserStreak, ActivityLog, BadgeType, BadgeTier } from '@/types/gamification';
import { toast } from 'sonner';

export class GamificationService {
  static async getUserXP(userId: string): Promise<UserXP | null> {
    try {
      const { data, error } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user XP:', error);
      return null;
    }
  }

  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      // Map the raw data to match our type definitions
      return (data || []).map(item => ({
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
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user streak:', error);
      return null;
    }
  }

  static async getRecentActivity(userId: string, limit: number = 10): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Convert Json metadata to Record<string, any>
      return (data || []).map(item => ({
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
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          activity_type: activityType,
          xp_earned: xpEarned,
          metadata
        });

      if (error) throw error;

      // The triggers will handle XP updates, streaks, and badge awards
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
      let query = supabase
        .from('user_xp')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(limit);

      // Add timeframe filtering if needed
      if (timeframe !== 'all-time') {
        const startDate = timeframe === 'week' 
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        query = query.gte('updated_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}
