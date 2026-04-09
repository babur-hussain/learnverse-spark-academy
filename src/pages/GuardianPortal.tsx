
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GuardianProvider, useGuardian } from '@/contexts/GuardianContext';
import MainLayout from '@/components/Layout/MainLayout';
import StudentSelect from '@/components/Guardian/StudentSelect';
import PerformanceSummary from '@/components/Guardian/PerformanceSummary';
import AlertsList from '@/components/Guardian/AlertsList';
import LinkStudentForm from '@/components/Guardian/LinkStudentForm';
import MeetingsList from '@/components/Guardian/MeetingsList';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/UI/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { 
  BellRing,
  Calendar,
  LineChart,
  Mail,
  MoveRight,
  School,
  UserPlus,
  Users,
} from 'lucide-react';

// Wrapper component to use context
const GuardianPortalContent: React.FC = () => {
  const { isLoading, linkedStudents, isGuardian } = useGuardian();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    return (
      <Card className="max-w-md mx-auto my-12">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to access the guardian portal
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no guardian profile exists yet
  if (!isGuardian) {
    return (
      <Card className="max-w-md mx-auto my-12">
        <CardHeader>
          <CardTitle>Welcome to Guardian Portal</CardTitle>
          <CardDescription>
            Register as a guardian to monitor your child's academic progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Get Started</h3>
            <p className="text-sm text-muted-foreground">
              As a guardian, you can monitor your child's academic performance, receive alerts,
              view reports, and communicate with teachers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-4 border rounded-md">
              <LineChart className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-medium">Track Progress</h4>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Monitor attendance, grades, and participation
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md">
              <BellRing className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-medium">Get Alerts</h4>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Receive notifications about important events
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-medium">Book Meetings</h4>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Schedule parent-teacher conferences
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md">
              <School className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-medium">Academic Reports</h4>
              <p className="text-xs text-center text-muted-foreground mt-1">
                View detailed performance reports
              </p>
            </div>
          </div>
          
          <Button className="w-full" onClick={() => navigate('/guardian-registration')}>
            Register as Guardian 
            <MoveRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // If guardian has no linked students yet
  if (linkedStudents.length === 0) {
    return (
      <Card className="max-w-md mx-auto my-12">
        <CardHeader>
          <CardTitle>Link Your First Student</CardTitle>
          <CardDescription>
            Connect your account with your child's student profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">How it Works</h3>
            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
              <li>Contact your child's school to get a student ID and verification code</li>
              <li>Link the student account using the student ID</li>
              <li>Verify the link using the verification code provided by the school</li>
              <li>Once verified, you can view your child's academic progress</li>
            </ol>
          </div>
          
          <div className="flex justify-center">
            <LinkStudentForm />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <StudentSelect />
        <LinkStudentForm />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="dashboard">
            <LineChart className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="meetings">
            <Calendar className="h-4 w-4 mr-2" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="messages">
            <Mail className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <PerformanceSummary />
          <AlertsList />
        </TabsContent>
        
        <TabsContent value="meetings">
          <MeetingsList />
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Messages
              </CardTitle>
              <CardDescription>Communicate with your child's teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>Messages feature coming soon</p>
                <p className="text-sm mt-2">You'll be able to communicate directly with teachers</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main component with context provider
const GuardianPortal: React.FC = () => {
  return (
    <MainLayout>
      <GuardianProvider>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Guardian Portal</h1>
          <GuardianPortalContent />
        </div>
      </GuardianProvider>
    </MainLayout>
  );
};

export default GuardianPortal;
