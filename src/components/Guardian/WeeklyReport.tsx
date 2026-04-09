
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { CalendarCheck, FileBarChart, Check, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/UI/badge';
import { format, subDays } from 'date-fns';
import { Progress } from '@/components/UI/progress';
import { useGuardian } from '@/contexts/GuardianContext';

const WeeklyReport = () => {
  const { currentStudent } = useGuardian();
  
  // Mock report data - in a real app, this would come from an API
  const reportDate = format(new Date(), 'MMMM d, yyyy');
  const weekStart = format(subDays(new Date(), 7), 'MMM d');
  const weekEnd = format(new Date(), 'MMM d');
  
  if (!currentStudent) {
    return <div>No student selected</div>;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileBarChart className="mr-2 h-5 w-5 text-primary" />
            Weekly Progress Report
          </CardTitle>
          <Badge variant="outline">{weekStart} - {weekEnd}</Badge>
        </div>
        <CardDescription>
          AI-generated summary of {currentStudent.student?.full_name}'s activity this week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Weekly Summary</h3>
          <p className="text-sm">
            This week, {currentStudent.student?.full_name} showed strong engagement in Mathematics and Physics,
            completing 12 practice exercises and attending 5 of 6 scheduled live sessions.
            Time spent on the platform increased by 15% compared to last week,
            with most activity occurring during evening hours (6-9 PM).
          </p>
        </div>
        
        {/* Improvements Section */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <ArrowUp className="text-green-500 mr-2 h-4 w-4" />
            Improvements This Week
          </h3>
          <div className="space-y-3">
            <div className="border-l-4 border-green-500 pl-3 py-1">
              <p className="text-sm font-medium">Test Scores</p>
              <p className="text-xs text-muted-foreground">Quiz scores improved from 72% to 85% average</p>
            </div>
            <div className="border-l-4 border-green-500 pl-3 py-1">
              <p className="text-sm font-medium">Participation Rate</p>
              <p className="text-xs text-muted-foreground">Increased forum participation with 8 new posts</p>
            </div>
            <div className="border-l-4 border-green-500 pl-3 py-1">
              <p className="text-sm font-medium">Module Completion</p>
              <p className="text-xs text-muted-foreground">Completed Advanced Algebra module ahead of schedule</p>
            </div>
          </div>
        </div>
        
        {/* Areas for Growth Section */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <ArrowDown className="text-amber-500 mr-2 h-4 w-4" />
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            <div className="border-l-4 border-amber-500 pl-3 py-1">
              <p className="text-sm font-medium">Session Attendance</p>
              <p className="text-xs text-muted-foreground">Missed 1 Physics live session this week</p>
            </div>
            <div className="border-l-4 border-amber-500 pl-3 py-1">
              <p className="text-sm font-medium">Assignment Submission</p>
              <p className="text-xs text-muted-foreground">Chemistry homework submitted late twice</p>
            </div>
          </div>
        </div>
        
        {/* Completion Progress */}
        <div>
          <h3 className="font-medium mb-3">Subject Progress</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Mathematics</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Physics</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Chemistry</span>
                <span>42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>
          </div>
        </div>
        
        {/* Action Items */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <AlertTriangle className="text-primary mr-2 h-4 w-4" />
            Suggested Actions for Parents
          </h3>
          <div className="space-y-2">
            <div className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              <p className="text-sm">Encourage completion of the Chemistry assignment due this Friday</p>
            </div>
            <div className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              <p className="text-sm">Review Physics module 4 materials together before next week's exam</p>
            </div>
            <div className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              <p className="text-sm">Consider scheduling a meeting with Dr. Johnson about math enrichment opportunities</p>
            </div>
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <CalendarCheck className="text-primary mr-2 h-4 w-4" />
            Upcoming Events
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 border rounded-md">
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded mr-3">Apr 22</div>
                <span className="text-sm">Physics End-of-Chapter Exam</span>
              </div>
              <Badge>High Priority</Badge>
            </div>
            <div className="flex justify-between items-center p-2 border rounded-md">
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded mr-3">Apr 25</div>
                <span className="text-sm">Chemistry Lab Submission Deadline</span>
              </div>
              <Badge variant="outline">Medium</Badge>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-center text-muted-foreground pt-2">
          This report was automatically generated on {reportDate}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyReport;
