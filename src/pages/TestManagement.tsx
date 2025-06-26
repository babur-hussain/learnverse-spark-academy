<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import Navbar from '@/components/Layout/Navbar';
import { Button } from '@/components/UI/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/UI/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/UI/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/UI/dialog';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import { Textarea } from '@/components/UI/textarea';
import { TestService, Test } from '@/services/TestService';
import { useToast } from '@/hooks/use-toast';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import { Clock, Calendar, PenLine, ListChecks, Archive, Plus } from 'lucide-react';

const TestManagement: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isTeacher } = useUserRole();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mock' | 'live'>('mock');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [newTest, setNewTest] = useState<Partial<Test>>({
    title: '',
    description: '',
    type: 'mock',
    duration_minutes: 60,
    level_of_strictness: 2,
    is_published: false
  });

  useEffect(() => {
    const loadTests = async () => {
      if (user) {
        try {
          setLoading(true);
          const tests = await TestService.getTests(undefined, undefined);
          setTests(tests);
        } catch (error) {
          console.error('Error loading tests:', error);
          toast({
            title: 'Error',
            description: 'Failed to load tests. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadTests();
  }, [user, toast]);

  const handleCreateTest = async () => {
    if (!user) return;

    if (!newTest.title) {
      toast({
        title: 'Missing fields',
        description: 'Please enter a title for the test.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const testToCreate = {
        ...newTest,
        type: newTest.type as 'mock' | 'live',
        duration_minutes: Number(newTest.duration_minutes),
        level_of_strictness: Number(newTest.level_of_strictness),
        created_by: user.id,
        is_published: false,
      };
      
      const testId = await TestService.createTest(testToCreate as Omit<Test, 'id' | 'created_at'>);
      toast({
        title: 'Test created',
        description: 'Your test has been created successfully.',
      });
      
      // Navigate to test editor
      navigate(`/test-editor/${testId}`);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = async (type: 'mock' | 'live') => {
    setActiveTab(type);
    try {
      setLoading(true);
      const filteredTests = await TestService.getTests(type);
      setTests(filteredTests);
    } catch (error) {
      console.error('Error filtering tests:', error);
      toast({
        title: 'Error',
        description: 'Failed to filter tests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <AdminRoleGuard>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Test Management</h1>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="mr-2 h-4 w-4" /> Create Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Test</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new test. You can add questions after creating the test.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="test-title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="test-title"
                        value={newTest.title}
                        onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="test-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="test-description"
                        value={newTest.description}
                        onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="test-type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={newTest.type}
                        onValueChange={(value) => setNewTest({ ...newTest, type: value as 'mock' | 'live' })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mock">Mock Test</SelectItem>
                          <SelectItem value="live">Live Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="test-duration" className="text-right">
                        Duration (min)
                      </Label>
                      <Input
                        id="test-duration"
                        type="number"
                        min="1"
                        value={newTest.duration_minutes}
                        onChange={(e) => setNewTest({ ...newTest, duration_minutes: parseInt(e.target.value) })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="test-strictness" className="text-right">
                        Strictness
                      </Label>
                      <Select
                        value={String(newTest.level_of_strictness)}
                        onValueChange={(value) => setNewTest({ ...newTest, level_of_strictness: parseInt(value) })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select strictness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Lenient</SelectItem>
                          <SelectItem value="2">Normal</SelectItem>
                          <SelectItem value="3">Strict</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newTest.type === 'live' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="test-scheduled-at" className="text-right">
                          Schedule
                        </Label>
                        <Input
                          id="test-scheduled-at"
                          type="datetime-local"
                          value={newTest.scheduled_at}
                          onChange={(e) => setNewTest({ ...newTest, scheduled_at: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTest} className="gradient-primary">
                      Create Test
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => handleFilterChange(value as 'mock' | 'live')}>
              <TabsList className="mb-6">
                <TabsTrigger value="mock">Mock Tests</TabsTrigger>
                <TabsTrigger value="live">Live Tests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mock" className="space-y-4">
                {loading ? (
                  <div className="text-center py-6">Loading mock tests...</div>
                ) : tests.filter(test => test.type === 'mock').length === 0 ? (
                  <div className="text-center py-10">
                    <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No mock tests found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create your first mock test to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tests
                      .filter(test => test.type === 'mock')
                      .map(test => (
                        <Card key={test.id} className="overflow-hidden">
                          <CardHeader>
                            <CardTitle>{test.title}</CardTitle>
                            <CardDescription>
                              Created on {new Date(test.created_at).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                              {test.description || 'No description provided.'}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{test.duration_minutes} minutes</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <PenLine className="h-4 w-4 mr-1" />
                              <span>Strictness: {test.level_of_strictness === 1 ? 'Lenient' : 
                                test.level_of_strictness === 2 ? 'Normal' : 'Strict'}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-gray-50 flex justify-between">
                            <Button variant="ghost" size="sm" 
                              onClick={() => navigate(`/test-editor/${test.id}`)}>
                              Edit
                            </Button>
                            <Button 
                              variant={test.is_published ? "outline" : "default"} 
                              size="sm" 
                              onClick={() => navigate(`/test-results/${test.id}`)}>
                              {test.is_published ? 'View Results' : 'Publish'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="live" className="space-y-4">
                {loading ? (
                  <div className="text-center py-6">Loading live tests...</div>
                ) : tests.filter(test => test.type === 'live').length === 0 ? (
                  <div className="text-center py-10">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No live tests found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create your first live test to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tests
                      .filter(test => test.type === 'live')
                      .map(test => (
                        <Card key={test.id} className="overflow-hidden">
                          <CardHeader>
                            <CardTitle>{test.title}</CardTitle>
                            <CardDescription>
                              Created on {new Date(test.created_at).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                              {test.description || 'No description provided.'}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{test.duration_minutes} minutes</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {test.scheduled_at 
                                  ? new Date(test.scheduled_at).toLocaleString() 
                                  : 'Not scheduled'}
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-gray-50 flex justify-between">
                            <Button variant="ghost" size="sm" 
                              onClick={() => navigate(`/test-editor/${test.id}`)}>
                              Edit
                            </Button>
                            <Button 
                              variant={test.is_published ? "outline" : "default"} 
                              size="sm" 
                              onClick={() => navigate(`/test-results/${test.id}`)}>
                              {test.is_published ? 'View Results' : 'Publish'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
          {isMobile && <MobileFooter />}
        </div>
      </AdminRoleGuard>
    </AuthGuard>
=======

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/UI/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/UI/dialog';
import { TestTube, Plus, Clock, Users, CheckCircle, Search, MoreHorizontal, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TestCreationDialog } from '@/components/TestManagement/TestCreationDialog';

interface Test {
  id: string;
  title: string;
  description: string | null;
  type: 'mock' | 'live';
  duration_minutes: number;
  scheduled_at: string | null;
  created_by: string;
  level_of_strictness: number;
  is_published: boolean;
  created_at: string;
  questions_count?: number;
  submissions_count?: number;
}

const TestManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch real test statistics
  const { data: testStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['test-management-stats'],
    queryFn: async () => {
      // Get total tests count
      const { count: totalTests } = await supabase
        .from('tests')
        .select('*', { count: 'exact', head: true });

      // Get published tests count
      const { count: activeTests } = await supabase
        .from('tests')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Get total submissions count
      const { count: totalSubmissions } = await supabase
        .from('student_test_submissions')
        .select('*', { count: 'exact', head: true });

      // Get completed submissions count
      const { count: completedSubmissions } = await supabase
        .from('student_test_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('evaluated', true);

      return {
        totalTests: totalTests || 0,
        activeTests: activeTests || 0,
        totalSubmissions: totalSubmissions || 0,
        completedSubmissions: completedSubmissions || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch real tests data
  const { data: tests = [], isLoading: isLoadingTests } = useQuery({
    queryKey: ['tests-list'],
    queryFn: async () => {
      const { data: testsData, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get questions count for each test
      const testIds = testsData?.map(t => t.id) || [];
      const { data: questionsData } = await supabase
        .from('questions')
        .select('test_id')
        .in('test_id', testIds);

      const questionCounts = questionsData?.reduce((acc, q) => {
        acc[q.test_id] = (acc[q.test_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get submissions count for each test
      const { data: submissionsData } = await supabase
        .from('student_test_submissions')
        .select('test_id')
        .in('test_id', testIds);

      const submissionCounts = submissionsData?.reduce((acc, s) => {
        acc[s.test_id] = (acc[s.test_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return testsData?.map(test => ({
        ...test,
        questions_count: questionCounts[test.id] || 0,
        submissions_count: submissionCounts[test.id] || 0
      })) as Test[];
    },
    refetchInterval: 30000,
  });

  const testStatsDisplay = [
    { 
      title: "Total Tests", 
      value: isLoadingStats ? "..." : testStats?.totalTests?.toString() || "0", 
      icon: TestTube, 
      color: "text-blue-600" 
    },
    { 
      title: "Active Tests", 
      value: isLoadingStats ? "..." : testStats?.activeTests?.toString() || "0", 
      icon: Clock, 
      color: "text-green-600" 
    },
    { 
      title: "Test Submissions", 
      value: isLoadingStats ? "..." : testStats?.totalSubmissions?.toString() || "0", 
      icon: Users, 
      color: "text-purple-600" 
    },
    { 
      title: "Completed", 
      value: isLoadingStats ? "..." : testStats?.completedSubmissions?.toString() || "0", 
      icon: CheckCircle, 
      color: "text-orange-600" 
    }
  ];

  const getTestStatusColor = (isPublished: boolean) => {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getTestTypeColor = (type: string) => {
    return type === 'live' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminRoleGuard>
      <MainLayout>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Test Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage tests, quizzes, and assessments.
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Test
                </Button>
              </DialogTrigger>
              <TestCreationDialog onClose={() => setIsCreateDialogOpen(false)} />
            </Dialog>
          </div>
        </div>

        {/* Test Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {testStatsDisplay.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tests">All Tests</TabsTrigger>
            <TabsTrigger value="mock">Mock Tests</TabsTrigger>
            <TabsTrigger value="live">Live Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle>Tests & Quizzes</CardTitle>
                <CardDescription>Manage all your tests and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {isLoadingTests ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading tests...</p>
                    </div>
                  </div>
                ) : filteredTests.length === 0 ? (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tests created yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by creating your first test or quiz for your students.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Test
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>
                            <div className="font-medium">{test.title}</div>
                            {test.description && (
                              <div className="text-sm text-muted-foreground max-w-xs truncate">
                                {test.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getTestTypeColor(test.type)} variant="secondary">
                              {test.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{test.questions_count}</TableCell>
                          <TableCell>{test.duration_minutes} min</TableCell>
                          <TableCell>{test.submissions_count}</TableCell>
                          <TableCell>
                            <Badge className={getTestStatusColor(test.is_published)} variant="secondary">
                              {test.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(test.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Test
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit Test
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Manage Questions
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                  Delete Test
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mock">
            <Card>
              <CardHeader>
                <CardTitle>Mock Tests</CardTitle>
                <CardDescription>Practice tests for students</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.filter(test => test.type === 'mock').map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div className="font-medium">{test.title}</div>
                          {test.description && (
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {test.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{test.questions_count}</TableCell>
                        <TableCell>{test.duration_minutes} min</TableCell>
                        <TableCell>{test.submissions_count}</TableCell>
                        <TableCell>
                          <Badge className={getTestStatusColor(test.is_published)} variant="secondary">
                            {test.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Test</DropdownMenuItem>
                              <DropdownMenuItem>Manage Questions</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live">
            <Card>
              <CardHeader>
                <CardTitle>Live Tests</CardTitle>
                <CardDescription>Scheduled assessments with real-time monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.filter(test => test.type === 'live').map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div className="font-medium">{test.title}</div>
                          {test.description && (
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {test.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {test.scheduled_at ? formatDate(test.scheduled_at) : 'Not scheduled'}
                        </TableCell>
                        <TableCell>{test.duration_minutes} min</TableCell>
                        <TableCell>{test.submissions_count}</TableCell>
                        <TableCell>
                          <Badge className={getTestStatusColor(test.is_published)} variant="secondary">
                            {test.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Monitor Live</DropdownMenuItem>
                              <DropdownMenuItem>Edit Test</DropdownMenuItem>
                              <DropdownMenuItem>Manage Questions</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </MainLayout>
    </AdminRoleGuard>
>>>>>>> main
  );
};

export default TestManagement;
