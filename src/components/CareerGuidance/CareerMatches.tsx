
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { CirclePlus, Compass, ArrowRight, Award, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CareerGuidanceService } from '@/services/CareerGuidanceService';
import type { CareerMatch } from '@/types/career';

interface CareerMatchesProps {
  onSelectCareer: () => void;
}

const CareerMatches: React.FC<CareerMatchesProps> = ({ onSelectCareer }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<CareerMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  
  useEffect(() => {
    const fetchCareerMatches = async () => {
      if (!user?.id) return;
      
      try {
        const careerMatches = await CareerGuidanceService.getCareerMatches(user.id);
        setMatches(careerMatches);
        
        if (careerMatches.length > 0) {
          setSelectedMatch(careerMatches[0]);
        }
      } catch (error) {
        console.error('Error fetching career matches:', error);
        toast({
          title: "Error",
          description: "Failed to fetch career matches. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCareerMatches();
  }, [user?.id, toast]);
  
  const handleGenerateRoadmap = async () => {
    if (!selectedMatch || !user?.id) {
      toast({
        title: "Error",
        description: "Please select a career match first.",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratingRoadmap(true);
    
    try {
      // Get the user's career profile
      const profile = await CareerGuidanceService.getCareerProfile(user.id);
      
      if (!profile) {
        throw new Error("Career profile not found. Please complete the aptitude test first.");
      }
      
      // User info for the AI
      const userInfo = {
        interests: profile.career_interests,
        strengths: profile.primary_strengths,
        learning_style: profile.learning_style
      };
      
      // Generate roadmap using DeepSeek AI
      const roadmapData = await CareerGuidanceService.generateRoadmap(
        selectedMatch.career,
        profile,
        userInfo
      );
      
      if (!roadmapData) {
        throw new Error("Failed to generate career roadmap.");
      }
      
      // Save the roadmap to the database
      await CareerGuidanceService.createCareerRoadmap({
        user_id: user.id,
        career_match_id: selectedMatch.id,
        career: selectedMatch.career,
        overview: roadmapData.overview,
        timeframe: roadmapData.timeframe,
        milestones: roadmapData.milestones,
        skills_to_acquire: roadmapData.skillsToAcquire,
        exams_certifications: roadmapData.examsCertifications,
        project_ideas: roadmapData.projectIdeas,
        weekly_plan: roadmapData.weeklyPlan
      });
      
      toast({
        title: "Success!",
        description: `Career roadmap for ${selectedMatch.career} has been generated.`,
      });
      
      // Navigate to roadmap view
      onSelectCareer();
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to generate career roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingRoadmap(false);
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
            You haven't completed the career aptitude test yet. Complete the test to get personalized career recommendations.
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
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Your Career Matches</h2>
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedMatch?.id === match.id
                    ? 'border-learn-purple bg-learn-purple/5'
                    : 'border-gray-200 hover:border-learn-purple/50'
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{match.career}</h3>
                  <Badge variant={
                    match.compatibility_score >= 80 ? 'default' : 
                    match.compatibility_score >= 60 ? 'secondary' : 'outline'
                  }>
                    {match.compatibility_score}% Match
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2">
          {selectedMatch && (
            <Card className="border-learn-purple/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-learn-purple">
                      {selectedMatch.career}
                    </CardTitle>
                    <div className="mt-2">
                      <Badge className="bg-learn-purple">
                        {selectedMatch.compatibility_score}% Match
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateRoadmap}
                    disabled={generatingRoadmap}
                    className="bg-learn-purple hover:bg-learn-purple/90"
                  >
                    {generatingRoadmap ? (
                      <>Generating...</>
                    ) : (
                      <>
                        Generate Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Compass className="h-5 w-5 mr-2 text-learn-purple" /> Why This Career Suits You
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedMatch.reasoning}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-learn-purple" /> Key Skills Aligned
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedMatch.key_skills_aligned.map((skill, index) => (
                        <li key={index} className="text-sm">{skill}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-learn-purple" /> Potential Challenges
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedMatch.potential_challenges.map((challenge, index) => (
                        <li key={index} className="text-sm">{challenge}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Education Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMatch.education_requirements.map((req, index) => (
                      <li key={index} className="text-sm">{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Growth Opportunities</h3>
                  <p className="text-muted-foreground">
                    {selectedMatch.growth_opportunities}
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Generate a detailed step-by-step roadmap for this career to get started on your journey.
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerMatches;
