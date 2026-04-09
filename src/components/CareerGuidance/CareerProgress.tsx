
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Progress } from '@/components/UI/progress';
import { Separator } from '@/components/UI/separator';
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle, ArrowUpRight, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CareerGuidanceService } from '@/services/CareerGuidanceService';
import type { ProgressUpdate, CareerRoadmap, CareerMatch, Milestone } from '@/types/career';

const CareerProgress: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  
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
          
          // Fetch latest progress update if roadmap exists
          if (roadmapData && roadmapData.id) {
            const updateData = await CareerGuidanceService.getLatestProgressUpdate(roadmapData.id);
            setProgressUpdate(updateData);
          }
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
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
      
      // Fetch latest progress update if roadmap exists
      if (roadmapData && roadmapData.id) {
        const updateData = await CareerGuidanceService.getLatestProgressUpdate(roadmapData.id);
        setProgressUpdate(updateData);
      } else {
        setProgressUpdate(null);
      }
    } catch (error) {
      console.error('Error fetching data for selected match:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateProgressAnalysis = async () => {
    if (!user?.id || !roadmap) {
      toast({
        title: "Error",
        description: "Missing data to generate progress analysis.",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratingAnalysis(true);
    
    try {
      // Fetch the user's career profile
      const profile = await CareerGuidanceService.getCareerProfile(user.id);
      
      if (!profile) {
        throw new Error("Career profile not found.");
      }
      
      // Get completed milestones
      const completedMilestones = roadmap.milestones.filter(m => m.is_completed);
      
      // Mock test scores data - in a real app, fetch from your database
      const testScores = [
        { test_id: "test1", score: 85, max_score: 100, date: new Date().toISOString() },
        { test_id: "test2", score: 92, max_score: 100, date: new Date().toISOString() }
      ];
      
      // Mock participation data - in a real app, fetch from your database
      const participation = {
        live_class_participation: 75,
        questions_asked: 12,
        assignments_completed: 8
      };
      
      // Generate progress update using DeepSeek AI
      const progressData = await CareerGuidanceService.adaptProgress(
        roadmap,
        completedMilestones,
        testScores,
        participation,
        profile
      );
      
      if (!progressData) {
        throw new Error("Failed to generate progress analysis.");
      }
      
      // Save the progress update to the database
      const savedUpdate = await CareerGuidanceService.createProgressUpdate({
        user_id: user.id,
        roadmap_id: roadmap.id,
        progress_summary: progressData.progressSummary,
        achievement_level: progressData.achievementLevel,
        strengths: progressData.strengths,
        areas_for_improvement: progressData.areasForImprovement,
        adjusted_milestones: progressData.adjustedMilestones,
        feedback: progressData.feedback,
        motivation: progressData.motivation,
        next_steps: progressData.nextSteps
      });
      
      setProgressUpdate(savedUpdate);
      
      toast({
        title: "Success!",
        description: "Progress analysis has been updated.",
      });
    } catch (error) {
      console.error('Error generating progress analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate progress analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAnalysis(false);
    }
  };
  
  // Calculate completion percentage
  const calculateCompletionPercentage = (): number => {
    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
      return 0;
    }
    
    const completed = roadmap.milestones.filter(m => m.is_completed).length;
    return Math.round((completed / roadmap.milestones.length) * 100);
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
            You need to generate a career roadmap before tracking progress.
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
  
  const completionPercentage = calculateCompletionPercentage();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-learn-purple">Career Progress</h2>
          <p className="text-muted-foreground">
            Track your progress on the {roadmap.career} career path
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{completionPercentage}%</div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {roadmap.milestones.filter(m => m.is_completed).length} of {roadmap.milestones.length} milestones completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Phase</CardTitle>
          </CardHeader>
          <CardContent>
            {roadmap.milestones.some(m => !m.is_completed) ? (
              <div>
                <div className="text-xl font-semibold mb-2">
                  {roadmap.milestones.find(m => !m.is_completed)?.title || "Getting Started"}
                </div>
                <Badge variant="outline" className="flex items-center w-fit">
                  <Clock className="mr-1 h-3 w-3" />
                  Next milestone
                </Badge>
              </div>
            ) : (
              <div>
                <div className="text-xl font-semibold mb-2">All Milestones Completed!</div>
                <Badge variant="default" className="bg-green-600">Completed</Badge>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Last Update</CardTitle>
          </CardHeader>
          <CardContent>
            {progressUpdate ? (
              <div>
                <div className="text-xl font-semibold mb-2">{progressUpdate.achievement_level}</div>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(progressUpdate.created_at || '').toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="text-muted-foreground">No progress analysis yet</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {!progressUpdate ? (
        <Card className="border-learn-purple/20">
          <CardHeader>
            <CardTitle>Generate Progress Analysis</CardTitle>
            <CardDescription>
              Get personalized feedback on your career progress and recommendations for improvement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateProgressAnalysis}
              disabled={generatingAnalysis}
              className="bg-learn-purple hover:bg-learn-purple/90"
            >
              {generatingAnalysis ? 'Analyzing...' : 'Analyze My Progress'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-learn-purple/20">
            <CardHeader>
              <CardTitle>Progress Summary</CardTitle>
              <CardDescription>{progressUpdate.progress_summary}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <ArrowUp className="text-green-500 h-5 w-5 mr-1" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {progressUpdate.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <ArrowDown className="text-amber-500 h-5 w-5 mr-1" /> Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {progressUpdate.areas_for_improvement.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {progressUpdate.adjusted_milestones && progressUpdate.adjusted_milestones.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Adjusted Timeline</h3>
                  <div className="space-y-3">
                    {progressUpdate.adjusted_milestones.map((adjustment, index) => {
                      const milestone = roadmap.milestones.find(m => m.id === adjustment.milestone_id);
                      return (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium">{milestone?.title || "Milestone"}</div>
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <Clock className="h-3 w-3 mr-1" /> 
                            New timeline: {adjustment.adjusted_timeline}
                          </div>
                          <div className="text-sm">{adjustment.adjustment_reason}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Feedback</h3>
                <div className="p-4 bg-learn-purple/5 rounded-lg">
                  {progressUpdate.feedback}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Next Steps</h3>
                <ul className="space-y-2">
                  {progressUpdate.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 text-learn-purple mr-2 flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-learn-purple/20 bg-learn-purple/5">
            <CardHeader>
              <CardTitle>Motivation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic">{progressUpdate.motivation}</p>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button
              onClick={generateProgressAnalysis}
              disabled={generatingAnalysis}
              className="bg-learn-purple hover:bg-learn-purple/90"
            >
              {generatingAnalysis ? 'Updating...' : 'Update Analysis'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CareerProgress;
