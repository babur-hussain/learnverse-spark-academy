import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { CourseProgress } from '@/components/Profile/CourseProgress';
import { StudyAnalytics } from '@/components/Profile/StudyAnalytics';
import { GamificationStats } from '@/components/Profile/GamificationStats';
import { RecommendedCourses } from '@/components/Profile/RecommendedCourses';
import { ReferralDashboard } from '@/components/Profile/ReferralDashboard';
import { useProfileData } from '@/hooks/use-profile-data';
import { User, BookOpen, BarChart3, Trophy, Gift, LogOut, HelpCircle, FileText, ShieldCheck, RotateCcw, Phone, Edit2, Crown } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { Button } from '@/components/UI/button';
import { useNavigate } from 'react-router-dom';
import { isApp } from '@/utils/platform';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    profile,
    courseProgress,
    studyStats,
    isLoading,
    role,
    studyTime,
    isActive,
    startStudySession,
    endStudySession
  } = useProfileData();

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Please sign in to view your profile
            </h1>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Loading profile...
            </h1>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If running inside the Capacitor app, render a mobile-optimized profile screen
  if (isApp) {
    const fullName = profile?.full_name || (user.email?.split('@')[0] ?? 'Learner');
    const phone = profile?.phone || '';

    return (
      <MainLayout>
        <div className="px-4 py-6 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>{fullName?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-xl font-semibold">{fullName}</div>
              <div className="text-sm text-muted-foreground">
                {phone || user.email}
              </div>
              <button
                onClick={() => navigate('/profile/edit')}
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Edit2 className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Subscription */}
          <Card className="mt-6 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm rounded-full px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  Not Purchased
                </span>
                <Button
                  className="rounded-full"
                  variant="default"
                  onClick={() => navigate('/catalog')}
                >
                  <Crown className="h-4 w-4 mr-2" /> Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="mt-6 space-y-3">
            <button onClick={() => navigate('/support')}
              className="w-full flex items-center justify-between rounded-xl border bg-background px-4 py-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5" />
                <span>Help & Support</span>
              </div>
              <Phone className="h-4 w-4 opacity-60" />
            </button>

            <button onClick={() => navigate('/terms-of-service')}
              className="w-full flex items-center justify-between rounded-xl border bg-background px-4 py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <span>Terms & Conditions</span>
              </div>
            </button>

            <button onClick={() => navigate('/privacy-policy')}
              className="w-full flex items-center justify-between rounded-xl border bg-background px-4 py-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" />
                <span>Privacy Policy</span>
              </div>
            </button>

            <button onClick={() => navigate('/refund-policy')}
              className="w-full flex items-center justify-between rounded-xl border bg-background px-4 py-4">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5" />
                <span>Refund Policy</span>
              </div>
            </button>

            <Button
              variant="destructive"
              onClick={() => { logout(); navigate('/auth'); }}
              className="w-full rounded-xl mt-2"
            >
              <LogOut className="h-4 w-4 mr-2" /> Log Out
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Web experience (unchanged)
  const completedCourses = courseProgress
    .filter(course => course.status === 'completed')
    .map(course => course.course_id);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader 
          profile={profile}
          studyStats={studyStats}
          role={role}
          studyTime={studyTime}
          isActive={isActive}
          onStartStudy={startStudySession}
          onEndStudy={endStudySession}
        />
        
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CourseProgress courses={courseProgress} />
              <StudyAnalytics studyStats={studyStats} />
            </div>
            <div className="mt-6">
              <RecommendedCourses 
                userRole={role} 
                completedCourses={completedCourses}
              />
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <CourseProgress courses={courseProgress} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <StudyAnalytics studyStats={studyStats} />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <GamificationStats />
          </TabsContent>

          <TabsContent value="referrals" className="mt-6">
            <ReferralDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
