
import React from 'react';
import { useGuardian } from '@/contexts/GuardianContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Progress } from '@/components/UI/progress';
import { Badge } from '@/components/UI/badge';

// Mock data - this would come from your backend in production
const generateMockPerformanceData = () => {
  return Array.from({ length: 10 }).map((_, i) => {
    const date = format(subDays(new Date(), 9 - i), 'MMM dd');
    return {
      date,
      score: Math.floor(70 + Math.random() * 30),
      avgScore: Math.floor(65 + Math.random() * 20),
      timeSpent: Math.floor(30 + Math.random() * 60)
    };
  });
};

const generateMockAttendanceData = () => {
  return Array.from({ length: 7 }).map((_, i) => {
    return {
      day: format(subDays(new Date(), 6 - i), 'EEE'),
      present: Math.random() > 0.2 ? 1 : 0,
      absent: Math.random() > 0.8 ? 1 : 0,
    };
  });
};

const PerformanceReport = () => {
  const { currentStudent, performanceSummary } = useGuardian();
  const performanceData = generateMockPerformanceData();
  const attendanceData = generateMockAttendanceData();
  
  // Calculate attendance rate
  const presentDays = attendanceData.filter(day => day.present === 1).length;
  const totalDays = attendanceData.length;
  const attendanceRate = (presentDays / totalDays) * 100;
  
  // Mock AI insights - in production, these would come from an AI model via API
  const aiInsights = [
    "Shows strong engagement in mathematics subjects",
    "Tends to study more effectively in the evening hours",
    "Spends less time on revision modules than recommended",
    "Has shown consistent improvement in test scores over the past month"
  ];

  if (!currentStudent) {
    return <div>No student selected</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Academic progress and test performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  name="Student's Score" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#82ca9d" 
                  name="Batch Average" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                <h3 className="text-sm font-medium">Average Score</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{Math.round(performanceData.reduce((acc, cur) => acc + cur.score, 0) / performanceData.length)}%</p>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-sm font-medium">Course Completion</h3>
              </div>
              <p className="text-2xl font-bold mt-1">78%</p>
              <p className="text-xs text-muted-foreground">23 of 30 modules completed</p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                <h3 className="text-sm font-medium">Avg. Time Spent</h3>
              </div>
              <p className="text-2xl font-bold mt-1">45 min</p>
              <p className="text-xs text-muted-foreground">Per session this week</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Attendance & Participation
          </CardTitle>
          <CardDescription>
            Class attendance and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#4ade80" name="Present" />
                <Bar dataKey="absent" fill="#f87171" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Attendance Rate</span>
              <span className="text-sm font-medium">{attendanceRate.toFixed(0)}%</span>
            </div>
            <Progress value={attendanceRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Sessions Attended
              </h4>
              <p className="text-xl font-bold mt-1">18</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium flex items-center">
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Sessions Missed
              </h4>
              <p className="text-xl font-bold mt-1">3</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                Upcoming Sessions
              </h4>
              <p className="text-xl font-bold mt-1">5</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-primary" />
            Learning Behavior Insights
          </CardTitle>
          <CardDescription>
            AI-generated insights about learning patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start p-3 border rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-primary" />
              Recent Alerts
            </span>
            <Badge variant="outline">3 New</Badge>
          </CardTitle>
          <CardDescription>
            Important notifications about your student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start p-3 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 rounded">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Missed Quiz</h4>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-sm mt-1">Your child missed the "Advanced Algebra" quiz scheduled on Monday.</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20 rounded">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Achievement Unlocked</h4>
                  <span className="text-xs text-muted-foreground">3 days ago</span>
                </div>
                <p className="text-sm mt-1">100% completion of the Physics Module - First in the batch!</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">New Course Available</h4>
                  <span className="text-xs text-muted-foreground">1 week ago</span>
                </div>
                <p className="text-sm mt-1">A new elective course "Introduction to Computer Science" is available for enrollment.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceReport;
