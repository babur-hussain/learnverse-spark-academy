
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GamificationService } from '@/services/GamificationService';
import type { UserXP, UserBadge, UserStreak, ActivityLog } from '@/types/gamification';

export function useGamification() {
  const { user } = useAuth();
  const [xp, setXp] = useState<UserXP | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchGamificationData = async () => {
      setLoading(true);
      try {
        const [xpData, badgesData, streakData, activityData] = await Promise.all([
          GamificationService.getUserXP(user.id),
          GamificationService.getUserBadges(user.id),
          GamificationService.getUserStreak(user.id),
          GamificationService.getRecentActivity(user.id)
        ]);

        setXp(xpData);
        setBadges(badgesData);
        setStreak(streakData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error fetching gamification data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, [user?.id]);

  const logActivity = async (activityType: string, xpEarned: number, metadata?: Record<string, any>) => {
    if (!user?.id) return false;
    return GamificationService.logActivity(user.id, activityType, xpEarned, metadata);
  };

  return {
    xp,
    badges,
    streak,
    recentActivity,
    loading,
    logActivity
  };
}
