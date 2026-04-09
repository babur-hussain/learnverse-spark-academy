
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Progress } from '@/components/UI/progress';
import { Award, Calendar, Flame, Trophy } from 'lucide-react';
import { Badge } from '@/components/UI/badge';
import { useGamification } from '@/hooks/use-gamification';

export function GamificationStats() {
  const { xp, badges, streak, loading } = useGamification();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading gamification stats...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const nextLevelXp = xp ? Math.pow(10, xp.level) * 100 : 100;
  const progressToNextLevel = xp ? (xp.total_xp / nextLevelXp) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Level {xp?.level || 1}
          </CardTitle>
          <CardDescription>
            {xp?.total_xp || 0} XP total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {(xp?.level || 1) + 1}</span>
              <span>{Math.round(progressToNextLevel)}%</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Badges Earned
          </CardTitle>
          <CardDescription>
            {badges.length} badges collected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {badges.map((userBadge) => (
              <Badge 
                key={userBadge.id}
                variant={userBadge.badge?.tier === 'gold' ? 'default' : 'secondary'}
                className="flex items-center gap-1"
              >
                {userBadge.badge?.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{streak?.current_streak || 0} days</p>
              <p className="text-sm text-muted-foreground">
                Longest: {streak?.longest_streak || 0} days
              </p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
