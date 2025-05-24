
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeType = 'streak' | 'completion' | 'mastery' | 'social' | 'special';

export interface Badge {
  id: string;
  name: string;
  description?: string;
  type: BadgeType;
  tier: BadgeTier;
  icon: string;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge?: Badge;
  awarded_at: string;
}

export interface UserXP {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  xp_earned: number;
  metadata?: Record<string, any>;
  created_at: string;
}
