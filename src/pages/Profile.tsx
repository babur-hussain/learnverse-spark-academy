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

const Profile = () => {
  const { platform } = usePlatform();
  const { user } = useAuth();
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
        
        {/* Platform-specific welcome message */}
        {platform.isMobile && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-sm font-medium">📱 Mobile Profile</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Optimized for mobile viewing and interaction
            </p>
          </div>
        )}
        
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className={`grid w-full ${platform.isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
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
            {!platform.isMobile && (
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Referrals
              </TabsTrigger>
            )}
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
          
          {/* Mobile-specific tab content */}
          {platform.isMobile && (
            <TabsContent value="mobile-features" className="mt-6">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  📱 Mobile-Exclusive Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      📍
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Location-based course recommendations
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      🔔
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Push notifications for study reminders
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      📱
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Offline content download
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
