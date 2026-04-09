
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Button } from '@/components/UI/button';
import { Separator } from '@/components/UI/separator';
import { Badge } from '@/components/UI/badge';
import { CheckCircle, Clock, ArrowRight, Video, FileText, GraduationCap } from 'lucide-react';
import { PersonalizedLearningService, RecommendedResource } from '@/services/PersonalizedLearningService';
import { toast } from 'sonner';
import { Progress } from '@/components/UI/progress';
import DiagnosticTest from './DiagnosticTest';

const LearningPath = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [needsDiagnostic, setNeedsDiagnostic] = useState<boolean>(false);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [resources, setResources] = useState<RecommendedResource[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchLearningPath();
    }
  }, [user?.id]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      const path = await PersonalizedLearningService.getCurrentLearningPath(user?.id || '');
      
      if (!path) {
        // Try generating a path if one doesn't exist
        const result = await PersonalizedLearningService.generateLearningPath(user?.id || '');
        
        if (result.needsDiagnostic) {
          setNeedsDiagnostic(true);
        } else if (result.path) {
          setLearningPath(result.path);
        }
      } else {
        setLearningPath(path);
        
        // Transform the resources from the database structure
        if (path.learning_path_resources) {
          const transformedResources = path.learning_path_resources.map((item: any) => ({
            id: item.id,
            type: item.resource_type,
            resourceId: item.resource_id, 
            title: item.title,
            description: item.description,
            priority: item.priority,
            completed: item.completed,
          }));
          
          setResources(transformedResources);
        }
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
      toast.error('Failed to load your personalized learning path');
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosticComplete = async () => {
    setNeedsDiagnostic(false);
    await fetchLearningPath();
  };

  const handleMarkComplete = async (resourceId: string) => {
    try {
      await PersonalizedLearningService.markResourceCompleted(resourceId);
      
      // Update the local state
      setResources(prevResources => 
        prevResources.map(resource => 
          resource.id === resourceId 
            ? { ...resource, completed: true }
            : resource
        )
      );
      
      toast.success('Progress saved!');
    } catch (error) {
      console.error('Error marking resource as completed:', error);
      toast.error('Failed to update your progress');
    }
  };

  const completedCount = resources.filter(r => r.completed).length;
  const completionPercentage = resources.length > 0 ? (completedCount / resources.length) * 100 : 0;

  // Group resources by type
  const videoResources = resources.filter(r => r.type === 'video');
  const noteResources = resources.filter(r => r.type === 'note');
  const testResources = resources.filter(r => r.type === 'test');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4">Loading your personalized learning path...</div>
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (needsDiagnostic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Learning Style Assessment</h2>
        <p className="mb-8 text-muted-foreground">
          To create your personalized learning path, we need to understand how you learn best and what your current knowledge level is.
        </p>
        <DiagnosticTest onComplete={handleDiagnosticComplete} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Learning Journey</h2>
          <p className="text-muted-foreground">A personalized path to help you achieve your goals</p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-sm text-muted-foreground mb-1">Your progress</div>
          <div className="flex items-center gap-2 mb-2">
            <Progress value={completionPercentage} className="w-40 h-2" />
            <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {completedCount} of {resources.length} activities completed
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main learning path */}
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Learning Path</CardTitle>
              <CardDescription>
                Based on your learning style and current knowledge level
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Resources</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="tests">Tests</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {resources.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No resources found. Complete the diagnostic test to get recommendations.
                    </div>
                  ) : (
                    resources.map((resource) => (
                      <ResourceCard 
                        key={resource.id}
                        resource={resource}
                        onMarkComplete={handleMarkComplete}
                      />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="videos" className="space-y-4">
                  {videoResources.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No video resources found in your learning path.
                    </div>
                  ) : (
                    videoResources.map((resource) => (
                      <ResourceCard 
                        key={resource.id}
                        resource={resource}
                        onMarkComplete={handleMarkComplete}
                      />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4">
                  {noteResources.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No note resources found in your learning path.
                    </div>
                  ) : (
                    noteResources.map((resource) => (
                      <ResourceCard 
                        key={resource.id}
                        resource={resource}
                        onMarkComplete={handleMarkComplete}
                      />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="tests" className="space-y-4">
                  {testResources.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No test resources found in your learning path.
                    </div>
                  ) : (
                    testResources.map((resource) => (
                      <ResourceCard 
                        key={resource.id}
                        resource={resource}
                        onMarkComplete={handleMarkComplete}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fetchLearningPath()}
              >
                Refresh Recommendations
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Learning Insights</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Learning style summary */}
              <div>
                <h4 className="font-medium mb-2">Your Learning Style</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Visual</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Auditory</span>
                      <span>30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reading/Writing</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hands-on</span>
                      <span>20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Weak areas */}
              <div>
                <h4 className="font-medium mb-3">Areas to Focus On</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span>Algebra - Equations</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span>Chemistry - Periodic Table</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Biology - Cell Structure</span>
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              {/* Upcoming tests */}
              <div>
                <h4 className="font-medium mb-3">Upcoming Tests</h4>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Mock Test: Algebra</p>
                        <p className="text-xs text-muted-foreground">Scheduled for tomorrow</p>
                      </div>
                      <Badge>Math</Badge>
                    </div>
                    <div className="mt-2">
                      <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                        <Link to="/test-management">View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" asChild>
                <Link to="/">View Learning Analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Resource Card Component
const ResourceCard = ({ 
  resource, 
  onMarkComplete 
}: { 
  resource: RecommendedResource,
  onMarkComplete: (id: string) => void
}) => {
  const getIcon = () => {
    switch (resource.type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'note':
        return <FileText className="h-5 w-5" />;
      case 'test':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  const getResourceLink = () => {
    switch (resource.type) {
      case 'video':
        return `/video-library?id=${resource.resourceId}`;
      case 'note':
        return `/notes?id=${resource.resourceId}`;
      case 'test':
        return `/test-editor/${resource.resourceId}`;
      default:
        return '/';
    }
  };

  return (
    <Card className={`border ${resource.completed ? 'bg-muted/40' : ''}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            resource.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {resource.completed ? <CheckCircle className="h-5 w-5" /> : getIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{resource.title}</h4>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </div>
              
              <Badge variant={resource.completed ? 'outline' : 'default'}>
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Estimated time: 20 min</span>
              </div>
              
              <div className="flex gap-2">
                {!resource.completed && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onMarkComplete(resource.id)}
                  >
                    Mark Complete
                  </Button>
                )}
                
                <Button size="sm" asChild>
                  <Link to={getResourceLink()}>
                    {resource.completed ? 'Review' : 'Start'} <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningPath;
