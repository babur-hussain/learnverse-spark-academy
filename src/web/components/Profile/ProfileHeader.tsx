
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { MapPin, Phone, Mail, Calendar, GraduationCap, BookOpen, Award } from 'lucide-react';
import { UserProfile, StudyStats } from '@/hooks/use-profile-data';

interface ProfileHeaderProps {
  profile: UserProfile;
  studyStats: StudyStats;
  role: string;
  studyTime: number;
  isActive: boolean;
  onStartStudy: () => void;
  onEndStudy: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  studyStats,
  role,
  studyTime,
  isActive,
  onStartStudy,
  onEndStudy
}) => {
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return profile?.username?.charAt(0).toUpperCase() || 'U';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center md:items-start">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
              <p className="text-muted-foreground">@{profile?.username}</p>
              <Badge className={`mt-2 ${getRoleColor(role)}`}>
                {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-4">
            {profile?.bio && (
              <p className="text-muted-foreground">{profile.bio}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}
              
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {new Date(profile?.created_at).toLocaleDateString()}
                </span>
              </div>

              {role === 'teacher' && profile?.experience_years && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.experience_years} years experience</span>
                </div>
              )}
              
              {role === 'student' && profile?.school && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.school}</span>
                </div>
              )}
            </div>

            {/* Specializations/Interests */}
            {(profile?.specializations?.length || profile?.interests?.length) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(profile.specializations || profile.interests || []).map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Stats and Study Timer */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{studyStats?.level || 1}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{studyStats?.total_xp || 0}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{studyStats?.current_streak || 0}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{studyStats?.badges_earned || 0}</div>
                <div className="text-xs text-muted-foreground">Badges</div>
              </div>
            </div>

            {/* Study Timer */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold mb-2">Study Timer</div>
              <div className="text-2xl font-mono mb-3">{formatTime(studyTime)}</div>
              <Button
                onClick={isActive ? onEndStudy : onStartStudy}
                variant={isActive ? "destructive" : "default"}
                size="sm"
                className="w-full"
              >
                {isActive ? 'End Session' : 'Start Studying'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
