
import { useState, useEffect } from 'react';
import { GamificationService } from '@/services/GamificationService';
import type { UserXP } from '@/types/gamification';

export function useLeaderboard(timeframe: 'week' | 'month' | 'all-time' = 'week', limit: number = 10) {
  const [leaderboard, setLeaderboard] = useState<UserXP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await GamificationService.getLeaderboard(timeframe, limit);
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe, limit]);

  return {
    leaderboard,
    loading
  };
}
