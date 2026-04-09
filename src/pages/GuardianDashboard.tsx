
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useGuardian } from '@/contexts/GuardianContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import StudentSelect from '@/components/Guardian/StudentSelect';
import PerformanceReport from '@/components/Guardian/PerformanceReport';
import TeacherCommunication from '@/components/Guardian/TeacherCommunication';
import WeeklyReport from '@/components/Guardian/WeeklyReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { BarChart4, MessageSquare, FileBarChart } from 'lucide-react';

const GuardianDashboard = () => {
  const { user } = useAuth();
  const { isLoading, linkedStudents, currentStudent, isGuardian } = useGuardian();
  const [activeTab, setActiveTab] = useState('performance');
  const navigate = useNavigate();
  
  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <Card className="max-w-md mx-auto my-12">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access the guardian dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // If no guardian profile exists yet
  if (!isGuardian) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <Card className="max-w-md mx-auto my-12">
            <CardHeader>
              <CardTitle>Parent Account Setup Required</CardTitle>
              <CardDescription>
                Create a guardian account to monitor your child's academic progress
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/guardian-registration')}>
                Register as Guardian
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  // If guardian has no linked students yet
  if (linkedStudents.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Parent Dashboard</h1>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Link Your First Student</CardTitle>
              <CardDescription>
                Connect your account with your child's student profile
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <p className="mb-4">You haven't linked any student accounts yet.</p>
              <Button onClick={() => navigate('/guardian-portal')}>
                Go to Guardian Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Parent Dashboard</h1>
        
        <div className="mb-6">
          <StudentSelect />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="performance">
              <BarChart4 className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="communication">
              <MessageSquare className="h-4 w-4 mr-2" />
              Teacher Communication
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileBarChart className="h-4 w-4 mr-2" />
              Weekly Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance">
            <PerformanceReport />
          </TabsContent>
          
          <TabsContent value="communication">
            <TeacherCommunication />
          </TabsContent>
          
          <TabsContent value="reports">
            <WeeklyReport />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default GuardianDashboard;
