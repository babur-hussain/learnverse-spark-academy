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
  );
};

export default TestManagement;
