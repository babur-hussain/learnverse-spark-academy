import React from 'react';
<<<<<<< HEAD
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Video, 
  Users, 
  Settings, 
  Tags,
  BookMarked,
  BookOpenCheck,
  Goal,
  FileEdit,
  Book
} from 'lucide-react';
=======
import { useQuery } from '@tanstack/react-query';
import useIsMobile from '@/hooks/use-mobile';
import AuthGuard from '@/components/Layout/AuthGuard';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Link } from 'react-router-dom';
import { 
  BarChart3,
  Users,
  BookOpen,
  Video,
  MessageSquare,
  Settings,
  Activity,
  TrendingUp,
  DollarSign,
  Clock,
  BookMarked,
  TestTube,
  Tag,
  Mail
} from 'lucide-react';
import { AdminAnalytics } from '@/components/Admin/AdminAnalytics';
import { AdminUserManagement } from '@/components/Admin/AdminUserManagement';
import { AdminContentManager } from '@/components/Admin/AdminContentManager';
import { AdminSystemSettings } from '@/components/Admin/AdminSystemSettings';
import { CouponsList } from '@/components/Admin/CouponManager/CouponsList';
import { NewsletterManager } from '@/components/Admin/Newsletter/NewsletterManager';
import { supabase } from '@/lib/supabase';
>>>>>>> main

const AdminPage = () => {
  const isMobile = useIsMobile();

<<<<<<< HEAD
=======
  // Fetch real dashboard stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total courses count
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Get total videos count
      const { count: totalVideos } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      // Get total subjects count
      const { count: totalSubjects } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });

      // Get active live sessions
      const { count: activeSessions } = await supabase
        .from('live_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalVideos: totalVideos || 0,
        totalSubjects: totalSubjects || 0,
        activeSessions: activeSessions || 0
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const quickStats = [
    { 
      title: "Total Users", 
      value: isLoading ? "..." : dashboardStats?.totalUsers?.toString() || "0", 
      icon: Users, 
      trend: "Live data" 
    },
    { 
      title: "Active Courses", 
      value: isLoading ? "..." : dashboardStats?.totalCourses?.toString() || "0", 
      icon: BookOpen, 
      trend: "Live data" 
    },
    { 
      title: "Total Videos", 
      value: isLoading ? "..." : dashboardStats?.totalVideos?.toString() || "0", 
      icon: Video, 
      trend: "Live data" 
    },
    { 
      title: "Active Sessions", 
      value: isLoading ? "..." : dashboardStats?.activeSessions?.toString() || "0", 
      icon: Clock, 
      trend: "Live data" 
    },
  ];

>>>>>>> main
  const adminTools = [
    {
      title: "Course Management",
      description: "Create and manage courses",
      icon: <BookOpen className="h-6 w-6" />,
<<<<<<< HEAD
      link: "/course-management"
    },
    {
      title: "Subject Management",
      description: "Manage subjects, chapters and resources",
      icon: <Book className="h-6 w-6" />,
      link: "/subject-management"
=======
      link: "/course-management",
      color: "bg-blue-500"
    },
    {
      title: "Class Management",
      description: "Manage school classes (add, edit, delete)",
      icon: <BookOpen className="h-6 w-6" />,
      link: "/admin/classes",
      color: "bg-pink-500"
    },
    {
      title: "Subject Management", 
      description: "Manage subjects, chapters and resources",
      icon: <BookMarked className="h-6 w-6" />,
      link: "/subject-management",
      color: "bg-green-500"
>>>>>>> main
    },
    {
      title: "Video Management",
      description: "Upload and organize video content",
      icon: <Video className="h-6 w-6" />,
<<<<<<< HEAD
      link: "/video-management"
=======
      link: "/video-management",
      color: "bg-purple-500"
>>>>>>> main
    },
    {
      title: "Test Management",
      description: "Create tests and quizzes",
<<<<<<< HEAD
      icon: <BookOpenCheck className="h-6 w-6" />,
      link: "/test-management"
    },
    {
      title: "Simple Content",
      description: "Manage website content easily",
      icon: <FileEdit className="h-6 w-6" />,
      link: "/simple-content"
    },
    {
      title: "Access Control",
      description: "Manage user roles and permissions",
      icon: <Users className="h-6 w-6" />,
      link: "/admin/access"
    },
    {
      title: "Category Management",
      description: "Organize content categories",
      icon: <Tags className="h-6 w-6" />,
      link: "/admin/categories"
    },
    {
      title: "Learning Goals",
      description: "Define learning objectives",
      icon: <Goal className="h-6 w-6" />,
      link: "/admin/goals"
    },
    {
      title: "Notes Management",
      description: "Manage study notes and materials",
      icon: <BookMarked className="h-6 w-6" />,
      link: "/admin/notes"
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: <Settings className="h-6 w-6" />,
      link: "/admin/settings"
=======
      icon: <TestTube className="h-6 w-6" />,
      link: "/test-management",
      color: "bg-orange-500"
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: <Users className="h-6 w-6" />,
      link: "/admin/users",
      color: "bg-red-500"
    },
    {
      title: "Content Editor",
      description: "Manage website content easily",
      icon: <MessageSquare className="h-6 w-6" />,
      link: "/simple-content",
      color: "bg-teal-500"
>>>>>>> main
    }
  ];

  return (
    <AuthGuard>
      <AdminRoleGuard>
<<<<<<< HEAD
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Navbar />
          
          <main className="flex-1 container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminTools.map((tool, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      {tool.icon}
                      {tool.title}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={tool.link}>
                        Access {tool.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
          
          {isMobile ? (
            <MobileFooter />
          ) : (
            <footer className="py-8 bg-gray-100 dark:bg-gray-800">
              <div className="mx-auto px-4 text-center">
                <p className="text-muted-foreground">© 2025 LearnVerse: Spark Academy. All rights reserved.</p>
              </div>
            </footer>
          )}
        </div>
=======
        <MainLayout>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Coupons
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Newsletter
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {adminTools.map((tool, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {tool.icon}
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{tool.description}</p>
                      <Link to={tool.link}>
                        <Button className={`${tool.color} text-white w-full`}>Manage {tool.title.split(' ')[0]}</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserManagement />
            </TabsContent>

            <TabsContent value="content">
              <AdminContentManager />
            </TabsContent>

            <TabsContent value="coupons">
              <CouponsList />
            </TabsContent>

            <TabsContent value="newsletter">
              <NewsletterManager />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSystemSettings />
            </TabsContent>
          </Tabs>
        </MainLayout>
>>>>>>> main
      </AdminRoleGuard>
    </AuthGuard>
  );
};

export default AdminPage;
