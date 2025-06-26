
import React from 'react';
<<<<<<< HEAD
import { useUserRole } from '@/hooks/use-user-role';
import { useAuth } from '@/contexts/AuthContext';
import { GamificationStats } from '@/components/Profile/GamificationStats';

const Profile = () => {
  const { role, isTeacher, isAdmin } = useUserRole();
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <p className="mb-2"><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p className="mb-4"><strong>User Role:</strong> {role || 'Unknown'}</p>
            
            {isTeacher && (
              <div className="p-3 bg-blue-100 text-blue-800 rounded">
                You have teacher privileges!
              </div>
            )}
            
            {isAdmin && (
              <div className="mt-3 p-3 bg-purple-100 text-purple-800 rounded">
                You have admin privileges!
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Achievements</h2>
          <GamificationStats />
        </div>
      </div>
=======
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
import { User, BookOpen, BarChart3, Trophy, Gift } from 'lucide-react';

const Profile = () => {
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Please sign in to view your profile
          </h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Loading profile...
          </h1>
        </div>
      </div>
    );
  }

  // Get completed course IDs for recommendations
  const completedCourses = courseProgress
    .filter(course => course.status === 'completed')
    .map(course => course.course_id);

  return (
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
>>>>>>> main
    </div>
  );
};

export default Profile;
