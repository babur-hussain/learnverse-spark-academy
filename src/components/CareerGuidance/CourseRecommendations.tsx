
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Separator } from '@/components/UI/separator';
import { BookOpen, PlayCircle, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CareerGuidanceService } from '@/services/CareerGuidanceService';
import type { CourseRecommendation, CareerRoadmap, CareerMatch } from '@/types/career';

const CourseRecommendations: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [recommendations, setRecommendations] = useState<CourseRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch all career matches
        const careerMatches = await CareerGuidanceService.getCareerMatches(user.id);
        setMatches(careerMatches);
        
        if (careerMatches.length > 0 && careerMatches[0].id) {
          // Auto-select the first match
          setSelectedMatchId(careerMatches[0].id);
          
          // Fetch roadmap for the first match
          const roadmapData = await CareerGuidanceService.getCareerRoadmap(careerMatches[0].id);
          setRoadmap(roadmapData);
          
          // Fetch recommendations if roadmap exists
          if (roadmapData && roadmapData.id) {
            const recommendationData = await CareerGuidanceService.getCourseRecommendations(roadmapData.id);
            setRecommendations(recommendationData);
          }
        }
      } catch (error) {
        console.error('Error fetching recommendations data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id, toast]);
  
  const handleMatchChange = async (matchId: string) => {
    setSelectedMatchId(matchId);
    setLoading(true);
    
    try {
      // Fetch roadmap for selected match
      const roadmapData = await CareerGuidanceService.getCareerRoadmap(matchId);
      setRoadmap(roadmapData);
      
      // Fetch recommendations if roadmap exists
      if (roadmapData && roadmapData.id) {
        const recommendationData = await CareerGuidanceService.getCourseRecommendations(roadmapData.id);
        setRecommendations(recommendationData);
      } else {
        setRecommendations(null);
      }
    } catch (error) {
      console.error('Error fetching data for selected match:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateRecommendations = async () => {
    if (!user?.id || !roadmap || !selectedMatchId) {
      toast({
        title: "Error",
        description: "Missing data to generate recommendations.",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratingRecommendations(true);
    
    try {
      // Fetch the user's career profile
      const profile = await CareerGuidanceService.getCareerProfile(user.id);
      
      if (!profile) {
        throw new Error("Career profile not found.");
      }
      
      // Mock platform courses data - in a real app, fetch from your database
      const platformCourses = [
        { id: "course1", name: "Introduction to Data Science", category: "Data Science" },
        { id: "course2", name: "Web Development Fundamentals", category: "Programming" },
        { id: "course3", name: "Business Analytics", category: "Business" },
        { id: "course4", name: "Machine Learning Basics", category: "Data Science" },
        { id: "course5", name: "UI/UX Design Principles", category: "Design" }
      ];
      
      // Generate recommendations using DeepSeek AI
      const recommendationData = await CareerGuidanceService.recommendCourses(
        roadmap.career,
        roadmap,
        profile,
        platformCourses
      );
      
      if (!recommendationData) {
        throw new Error("Failed to generate course recommendations.");
      }
      
      // Save the recommendations to the database
      const savedRecommendations = await CareerGuidanceService.createCourseRecommendations({
        user_id: user.id,
        roadmap_id: roadmap.id,
        recommended_courses: recommendationData.recommendedCourses.map(course => ({
          name: course.courseName,
          relevance: course.relevance,
          aligned_milestone: course.alignedMilestone,
          priority: course.priority
        })),
        recommended_tests: recommendationData.recommendedTests.map(test => ({
          name: test.testName,
          relevance: test.relevance
        })),
        recommended_sessions: recommendationData.recommendedSessions.map(session => ({
          name: session.sessionName,
          relevance: session.relevance
        })),
        suggested_learning_path: recommendationData.suggestedLearningPath
      });
      
      setRecommendations(savedRecommendations);
      
      toast({
        title: "Success!",
        description: `Course recommendations for ${roadmap.career} have been generated.`,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingRecommendations(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
      </div>
    );
  }
  
  if (matches.length === 0) {
    return (
      <Card className="border-learn-purple/20">
        <CardHeader>
          <CardTitle className="text-2xl text-learn-purple">No Career Matches Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You need to complete the career aptitude test first to get career recommendations.
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-learn-purple hover:bg-learn-purple/90"
          >
            Take Aptitude Test
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!roadmap) {
    return (
      <Card className="border-learn-purple/20">
        <CardHeader>
          <CardTitle className="text-2xl text-learn-purple">No Roadmap Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You need to generate a career roadmap before getting course recommendations.
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-learn-purple hover:bg-learn-purple/90"
          >
            View Career Matches
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-learn-purple">Course Recommendations</h2>
          <p className="text-muted-foreground">
            Personalized learning resources for your {roadmap.career} career path
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <select 
            value={selectedMatchId || ''} 
            onChange={(e) => handleMatchChange(e.target.value)}
            className="p-2 border rounded-md w-full sm:w-auto"
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id || ''}>
                {match.career}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {!recommendations ? (
        <Card className="border-learn-purple/20">
          <CardHeader>
            <CardTitle>No Recommendations Yet</CardTitle>
            <CardDescription>
              Generate personalized course recommendations based on your career roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateRecommendations}
              disabled={generatingRecommendations}
              className="bg-learn-purple hover:bg-learn-purple/90"
            >
              {generatingRecommendations ? 'Generating...' : 'Generate Recommendations'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-learn-purple/20">
            <CardHeader>
              <CardTitle>Suggested Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{recommendations.suggested_learning_path}</p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <div className="space-y-4">
                {recommendations.recommended_courses && recommendations.recommended_courses.length > 0 ? (
                  recommendations.recommended_courses.map((course, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-learn-purple/10 p-4 flex items-center justify-center md:w-16">
                          <BookOpen className="h-8 w-8 text-learn-purple" />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                            <h3 className="font-semibold text-lg">{course.name}</h3>
                            {course.priority && (
                              <Badge variant={
                                course.priority === 'High' ? 'default' : 
                                course.priority === 'Medium' ? 'secondary' : 
                                'outline'
                              }>
                                {course.priority} Priority
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground mt-1 mb-3">{course.relevance}</p>
                          
                          {course.aligned_milestone && (
                            <div className="text-sm">
                              <span className="font-medium">Aligns with milestone:</span> {course.aligned_milestone}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No course recommendations available.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tests">
              <div className="space-y-4">
                {recommendations.recommended_tests && recommendations.recommended_tests.length > 0 ? (
                  recommendations.recommended_tests.map((test, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-blue-50 p-4 flex items-center justify-center md:w-16">
                          <PlayCircle className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex-1 p-4">
                          <h3 className="font-semibold text-lg">{test.name}</h3>
                          <p className="text-muted-foreground mt-1">{test.relevance}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No test recommendations available.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="sessions">
              <div className="space-y-4">
                {recommendations.recommended_sessions && recommendations.recommended_sessions.length > 0 ? (
                  recommendations.recommended_sessions.map((session, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-green-50 p-4 flex items-center justify-center md:w-16">
                          <Users className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="flex-1 p-4">
                          <h3 className="font-semibold text-lg">{session.name}</h3>
                          <p className="text-muted-foreground mt-1">{session.relevance}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No session recommendations available.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CourseRecommendations;
