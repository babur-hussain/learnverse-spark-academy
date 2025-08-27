
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/UI/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Clock, TrendingUp, Award, Target } from 'lucide-react';
import { StudyStats } from '@/hooks/use-profile-data';

interface StudyAnalyticsProps {
  studyStats: StudyStats;
}

export const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({ studyStats }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', time: Math.floor(Math.random() * 120) + 30 },
    { day: 'Tue', time: Math.floor(Math.random() * 120) + 30 },
    { day: 'Wed', time: Math.floor(Math.random() * 120) + 30 },
    { day: 'Thu', time: Math.floor(Math.random() * 120) + 30 },
    { day: 'Fri', time: Math.floor(Math.random() * 120) + 30 },
    { day: 'Sat', time: Math.floor(Math.random() * 120) + 30 },
    { day: 'Sun', time: Math.floor(Math.random() * 120) + 30 },
  ];

  const progressData = [
    { name: 'Completed', value: studyStats?.courses_completed || 0, color: '#22c55e' },
    { name: 'In Progress', value: studyStats?.courses_in_progress || 0, color: '#3b82f6' },
    { name: 'Not Started', value: Math.max(0, 10 - (studyStats?.courses_completed || 0) - (studyStats?.courses_in_progress || 0)), color: '#e5e7eb' },
  ];

  const chartConfig = {
    time: {
      label: "Study Time (minutes)",
      color: "#3b82f6",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTime(studyStats?.total_study_time || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Study Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studyStats?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studyStats?.badges_earned || 0}</p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studyStats?.level || 1}</p>
                <p className="text-xs text-muted-foreground">Current Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Time */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="time" fill="var(--color-time)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Course Progress Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {progressData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
