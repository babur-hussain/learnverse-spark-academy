
import React from 'react';
import { useGuardian } from '@/contexts/GuardianContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Progress } from '@/components/UI/progress';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  LineChart,
  School,
  Users
} from 'lucide-react';

const PerformanceSummary: React.FC = () => {
  const { performanceSummary, currentStudent } = useGuardian();

  if (!performanceSummary || !currentStudent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            No performance data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Performance Summary
        </CardTitle>
        <CardDescription>
          Overview of {currentStudent?.student?.full_name}'s academic performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Attendance Rate
            </h4>
            <span className="text-sm font-medium">
              {Math.round(performanceSummary.attendance_rate * 100)}%
            </span>
          </div>
          <Progress value={performanceSummary.attendance_rate * 100} className="h-2" />
        </div>

        {/* Participation */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm flex items-center gap-1.5">
            <Users className="h-4 w-4" /> Participation
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted p-3 rounded-lg">
              <div className="font-semibold text-lg">
                {performanceSummary.participation_metrics.live_class_participation}%
              </div>
              <div className="text-xs text-muted-foreground">Live Class</div>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="font-semibold text-lg">
                {performanceSummary.participation_metrics.questions_asked}
              </div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="font-semibold text-lg">
                {performanceSummary.participation_metrics.assignments_completed}
              </div>
              <div className="text-xs text-muted-foreground">Assignments</div>
            </div>
          </div>
        </div>

        {/* Recent Test Scores */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm flex items-center gap-1.5">
            <School className="h-4 w-4" /> Recent Test Scores
          </h4>
          <div className="space-y-3">
            {performanceSummary.recent_test_scores.map(test => (
              <div key={test.test_id} className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">{test.test_name}</span>
                  <span className="text-sm">
                    {test.score}/{test.max_score} ({Math.round((test.score / test.max_score) * 100)}%)
                  </span>
                </div>
                <Progress value={(test.score / test.max_score) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(test.date), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> Upcoming Events
          </h4>
          <div className="space-y-2">
            {performanceSummary.upcoming_events.map(event => (
              <div key={event.id} className="flex items-center gap-3 p-2 border rounded-md">
                <div className="bg-primary/10 p-2 rounded-full">
                  {event.type === 'live_class' ? (
                    <Users className="h-4 w-4 text-primary" />
                  ) : event.type === 'test' ? (
                    <School className="h-4 w-4 text-primary" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceSummary;
