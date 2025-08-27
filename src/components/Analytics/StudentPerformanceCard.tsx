
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Progress } from '@/components/UI/progress';
import { usePerformanceAnalytics } from '@/hooks/use-performance-analytics';
import { AlertTriangle, TrendingUp, Clock, Brain } from 'lucide-react';

export const StudentPerformanceCard = () => {
  const { metrics, loading, error } = usePerformanceAnalytics();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Loading your performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Unable to load performance data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Your learning progress and achievements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Average Score</span>
            <span className="text-sm font-medium">{metrics.averageScore.toFixed(1)}%</span>
          </div>
          <Progress value={metrics.averageScore} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Completion Rate</p>
              <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Participation Rate</p>
              <p className="text-2xl font-bold">{metrics.participationRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Time Spent</p>
              <p className="text-2xl font-bold">{Math.round(metrics.timeSpent / 3600)}h</p>
            </div>
          </div>
        </div>

        {metrics.weakAreas.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <h4 className="font-medium">Areas Needing Attention</h4>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {metrics.weakAreas.map((area, index) => (
                <li key={index} className="text-sm text-muted-foreground">{area}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
