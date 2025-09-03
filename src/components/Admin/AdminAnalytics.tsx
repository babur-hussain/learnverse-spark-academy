
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  Video, 
  Activity, 
  Clock, 
  DollarSign,
  TrendingUp,
  Eye,
  Download,
  UserCheck,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Badge } from '@/components/UI/badge';
import { supabase } from '@/integrations/supabase/client';

export const AdminAnalytics = () => {
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    currentSessions: 0,
    todaySignups: 0,
    onlineInstructors: 0
  });

  // Fetch real analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
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

      // Get recent user registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Get course enrollment data
      const { data: courseEnrollments } = await supabase
        .from('user_courses')
        .select(`
          course_id,
          courses(title),
          created_at
        `);

      // Get live sessions data
      const { data: liveSessions } = await supabase
        .from('live_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get forum activity
      const { count: forumThreads } = await supabase
        .from('forum_threads')
        .select('*', { count: 'exact', head: true });

      const { count: forumPosts } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalVideos: totalVideos || 0,
        totalSubjects: totalSubjects || 0,
        recentUsers: recentUsers || [],
        courseEnrollments: courseEnrollments || [],
        liveSessions: liveSessions || [],
        forumThreads: forumThreads || 0,
        forumPosts: forumPosts || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process user growth data
  const userGrowthData = React.useMemo(() => {
    if (!analyticsData?.recentUsers) return [];
    
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const usersInMonth = analyticsData.recentUsers.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= monthStart && userDate <= monthEnd;
      }).length;
      
      last6Months.push({
        month: monthName,
        users: usersInMonth,
        active: Math.floor(usersInMonth * 0.8) // Estimate active users as 80% of total
      });
    }
    return last6Months;
  }, [analyticsData?.recentUsers]);

  // Process course engagement data
  const courseEngagementData = React.useMemo(() => {
    if (!analyticsData?.courseEnrollments) return [];
    
    const courseStats = analyticsData.courseEnrollments.reduce((acc, enrollment) => {
      const courseTitle = enrollment.courses?.title || 'Unknown Course';
      if (!acc[courseTitle]) {
        acc[courseTitle] = { name: courseTitle, students: 0, completion: 75 };
      }
      acc[courseTitle].students++;
      return acc;
    }, {});
    
    return Object.values(courseStats).slice(0, 5);
  }, [analyticsData?.courseEnrollments]);

  const realTimeStats = [
    { 
      title: "Total Users", 
      value: analyticsData?.totalUsers || 0, 
      icon: Users, 
      color: "text-blue-600",
      change: "+5.2%"
    },
    { 
      title: "Total Courses", 
      value: analyticsData?.totalCourses || 0, 
      icon: BookOpen, 
      color: "text-green-600",
      change: "+12.1%"
    },
    { 
      title: "Total Videos", 
      value: analyticsData?.totalVideos || 0, 
      icon: Video, 
      color: "text-purple-600",
      change: "+8.7%"
    },
    { 
      title: "Total Subjects", 
      value: analyticsData?.totalSubjects || 0, 
      icon: Activity, 
      color: "text-orange-600",
      change: "+3.4%"
    }
  ];

  const lifetimeStats = [
    { title: "Total Users", value: analyticsData?.totalUsers?.toString() || "0", icon: Users, description: "Registered users" },
    { title: "Total Courses", value: analyticsData?.totalCourses?.toString() || "0", icon: BookOpen, description: "Published courses" },
    { title: "Total Videos", value: analyticsData?.totalVideos?.toString() || "0", icon: Video, description: "Video content" },
    { title: "Forum Threads", value: analyticsData?.forumThreads?.toString() || "0", icon: Eye, description: "Discussion threads" },
    { title: "Forum Posts", value: analyticsData?.forumPosts?.toString() || "0", icon: Download, description: "Forum posts" },
    { title: "Live Sessions", value: analyticsData?.liveSessions?.length?.toString() || "0", icon: Activity, description: "Conducted sessions" }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live Data
          </Badge>
          <Button variant="outline" size="sm">Export Report</Button>
        </div>
      </div>

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {realTimeStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Live data
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Growth Chart */}
          {userGrowthData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>User Registration (Last 6 Months)</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Total registered users: {analyticsData?.totalUsers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Active courses: {analyticsData?.totalCourses}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Video content: {analyticsData?.totalVideos}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Live sessions conducted: {analyticsData?.liveSessions?.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifetime" className="space-y-6">
          {/* Lifetime Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lifetimeStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Growth Chart */}
          {userGrowthData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>User registration trends over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="active" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {courseEngagementData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Course Engagement</CardTitle>
                <CardDescription>Student enrollment by course</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={courseEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Course Engagement</CardTitle>
                <CardDescription>No course enrollment data available yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Start creating courses and enrolling students to see engagement data.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
