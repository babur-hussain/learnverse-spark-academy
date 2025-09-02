import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { CourseProgress } from '@/components/Profile/CourseProgress';
import { StudyAnalytics } from '@/components/Profile/StudyAnalytics';
import { GamificationStats } from '@/components/Profile/GamificationStats';
import { RecommendedCourses } from '@/components/Profile/RecommendedCourses';
import { ReferralDashboard } from '@/components/Profile/ReferralDashboard';
import { useProfileData } from '@/hooks/use-profile-data';
import { User, BookOpen, BarChart3, Trophy, Gift } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import MobileProfilePage from '@/components/Profile/MobileProfilePage';

const Profile = () => {
  const { platform } = usePlatform();
  const { user } = useAuth();

  // For mobile devices, render the mobile profile page
  if (platform.isMobile) {
    return <MobileProfilePage />;
  }

  // For web, render the existing profile page
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

  // Get completed course IDs for recommendations
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
