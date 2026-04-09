
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalizedLearningService } from '@/services/PersonalizedLearningService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Progress } from '@/components/UI/progress';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/UI/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';

const LearningAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeFrame, setTimeFrame] = useState<string>('month');

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await PersonalizedLearningService.getLearningAnalytics(user?.id || '');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4">Loading your learning analytics...</div>
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Mock data for charts
  const skillProgressData = [
    { name: 'Jan', math: 30, science: 40, english: 65 },
    { name: 'Feb', math: 35, science: 45, english: 70 },
    { name: 'Mar', math: 45, science: 50, english: 72 },
    { name: 'Apr', math: 50, science: 55, english: 75 },
    { name: 'May', math: 65, science: 60, english: 78 },
  ];

  const testScoresData = [
    { name: 'Test 1', score: 68 },
    { name: 'Test 2', score: 72 },
    { name: 'Test 3', score: 76 },
    { name: 'Test 4', score: 85 },
    { name: 'Test 5', score: 82 },
  ];

  const resourceTypeData = [
    { name: 'Videos', value: 35 },
    { name: 'Notes', value: 30 },
    { name: 'Tests', value: 20 },
    { name: 'Exercises', value: 15 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const learningStyleData = analytics?.learningStyle || {
    visual: 25,
    auditory: 25,
    reading: 25,
    kinesthetic: 25,
  };

  const testPerformance = analytics?.testPerformance || {
    averageScore: 0,
    highestScore: 0,
    completedTests: 0,
    totalTests: 0,
  };

  const completionRate = analytics?.resourceCompletion?.completionRate || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Learning Analytics</h2>
          <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
        </div>
        
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Test Completion</CardDescription>
            <CardTitle className="text-2xl">{testPerformance.completedTests}/{testPerformance.totalTests}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Tests completed
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-2xl">{testPerformance.averageScore.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Across all tests
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resource Completion</CardDescription>
            <CardTitle className="text-2xl">{Math.round(completionRate)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Learning Streak</CardDescription>
            <CardTitle className="text-2xl">5 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Keep it up!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Skill Progress Over Time</CardTitle>
            <CardDescription>
              See how your skills have improved
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              className="h-full"
              config={{
                math: { label: "Math" },
                science: { label: "Science" },
                english: { label: "English" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={skillProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="math" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="science" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="english" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Performance</CardTitle>
            <CardDescription>
              Your scores on recent tests
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              className="h-full"
              config={{
                score: { label: "Score" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={testScoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Engagement</CardTitle>
            <CardDescription>
              Types of resources you interact with
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex justify-center h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {resourceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Learning Style Profile</CardTitle>
            <CardDescription>
              Based on your diagnostic assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Visual Learning</span>
                  <span>{learningStyleData.visual}%</span>
                </div>
                <Progress value={learningStyleData.visual} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Auditory Learning</span>
                  <span>{learningStyleData.auditory}%</span>
                </div>
                <Progress value={learningStyleData.auditory} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Reading/Writing</span>
                  <span>{learningStyleData.reading}%</span>
                </div>
                <Progress value={learningStyleData.reading} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Hands-on Learning</span>
                  <span>{learningStyleData.kinesthetic}%</span>
                </div>
                <Progress value={learningStyleData.kinesthetic} className="h-2" />
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Your preferred pace: <span className="font-medium">{analytics?.pacePreference || 'Moderate'}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningAnalytics;
