
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Separator } from '@/components/UI/separator';
import { CheckCircle, Clock, BookOpen, Award, Pencil, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CareerGuidanceService } from '@/services/CareerGuidanceService';
import type { CareerRoadmap, CareerMatch } from '@/types/career';

const CareerRoadmap: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch all career matches
        const careerMatches = await CareerGuidanceService.getCareerMatches(user.id);
        setMatches(careerMatches);
        
        if (careerMatches.length > 0) {
          // Auto-select the first match
          setSelectedMatchId(careerMatches[0].id);
          
          // Fetch roadmap for the first match
          if (careerMatches[0].id) {
            const roadmapData = await CareerGuidanceService.getCareerRoadmap(careerMatches[0].id);
            setRoadmap(roadmapData);
          }
        }
      } catch (error) {
        console.error('Error fetching career roadmap data:', error);
        toast({
          title: "Error",
          description: "Failed to load career roadmap. Please try again.",
          variant: "destructive"
        });
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
      const roadmapData = await CareerGuidanceService.getCareerRoadmap(matchId);
      setRoadmap(roadmapData);
    } catch (error) {
      console.error('Error fetching career roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to load the selected roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleMilestoneToggle = async (milestoneId: string, completed: boolean) => {
    try {
      const success = await CareerGuidanceService.updateMilestoneStatus(milestoneId, completed);
      
      if (success) {
        // Update the local state
        setRoadmap(prevRoadmap => {
          if (!prevRoadmap) return null;
          
          return {
            ...prevRoadmap,
            milestones: prevRoadmap.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return {
                  ...milestone,
                  is_completed: completed,
                  completed_at: completed ? new Date().toISOString() : undefined
                };
              }
              return milestone;
            })
          };
        });
        
        toast({
          title: "Success",
          description: completed
            ? "Milestone marked as completed!"
            : "Milestone marked as incomplete.",
        });
      } else {
        throw new Error("Failed to update milestone status");
      }
    } catch (error) {
      console.error('Error updating milestone status:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone status. Please try again.",
        variant: "destructive"
      });
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
          <CardTitle className="text-2xl text-learn-purple">No Roadmap Generated Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You need to generate a roadmap for one of your career matches first.
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
          <h2 className="text-2xl font-bold text-learn-purple">Career Roadmap</h2>
          <p className="text-muted-foreground">Your personalized path to success as a {roadmap.career}</p>
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
      
      <Card className="border-learn-purple/20">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>{roadmap.overview}</CardDescription>
          <div className="mt-2">
            <Badge variant="outline" className="text-learn-purple border-learn-purple">
              Timeline: {roadmap.timeframe}
            </Badge>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="skills">Required Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="projects">Project Ideas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="milestones">
          <div className="space-y-4">
            {roadmap.milestones.map((milestone, index) => (
              <Card key={index} className={`border-l-4 ${
                milestone.is_completed ? 'border-l-green-500' : 'border-l-learn-purple'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {milestone.title}
                        </CardTitle>
                        <Badge variant="outline" className="ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {milestone.timeline}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant={milestone.is_completed ? "outline" : "default"}
                      size="sm"
                      className={milestone.is_completed ? 
                        "border-green-500 text-green-500 hover:text-green-500 hover:bg-green-50" : 
                        "bg-learn-purple hover:bg-learn-purple/90"
                      }
                      onClick={() => handleMilestoneToggle(milestone.id!, !milestone.is_completed)}
                    >
                      {milestone.is_completed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" /> Completed
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </Button>
                  </div>
                  <CardDescription>{milestone.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {milestone.required_skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="bg-learn-purple/10">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Activities</h4>
                      <ul className="text-sm space-y-1">
                        {milestone.activities.map((activity, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-learn-purple mr-2">•</span> {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Resources</h4>
                      <ul className="text-sm space-y-1">
                        {milestone.resources.map((resource, i) => (
                          <li key={i} className="flex items-start">
                            <BookOpen className="h-4 w-4 mr-1 text-learn-purple flex-shrink-0 mt-0.5" />
                            <span>{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills to Acquire</CardTitle>
              <CardDescription>
                Master these skills to excel in your career as a {roadmap.career}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.skills_to_acquire.map((skill, index) => (
                  <div 
                    key={index} 
                    className="p-4 border rounded-lg flex items-start gap-3"
                  >
                    <div className={`p-2 rounded-full ${
                      skill.importance === 'High' ? 'bg-red-100 text-red-600' :
                      skill.importance === 'Medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <Award className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{skill.skill}</h3>
                        <Badge variant={
                          skill.importance === 'High' ? 'destructive' :
                          skill.importance === 'Medium' ? 'secondary' :
                          'outline'
                        }>
                          {skill.importance} Priority
                        </Badge>
                      </div>
                      
                      <h4 className="text-sm font-medium mt-3 mb-1">Suggested Resources:</h4>
                      <ul className="text-sm space-y-1">
                        {skill.suggested_resources.map((resource, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-learn-purple mr-2">•</span> {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Exams & Certifications</CardTitle>
              <CardDescription>
                Key credentials that will boost your career prospects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roadmap.exams_certifications.map((exam, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{exam.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {exam.timeline}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mt-2">{exam.description}</p>
                    
                    <Separator className="my-3" />
                    
                    <h4 className="font-medium text-sm mb-2">Preparation Tips:</h4>
                    <ul className="space-y-1">
                      {exam.preparation_tips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <span className="text-learn-purple mr-2">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project Ideas</CardTitle>
              <CardDescription>
                Build these projects to demonstrate your skills and enhance your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.project_ideas.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Pencil className="h-5 w-5 text-learn-purple" />
                      <h3 className="font-semibold">{project.title}</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="bg-learn-purple/10">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-learn-purple/5 border-learn-purple/20">
        <CardHeader>
          <CardTitle className="text-learn-purple">Weekly Plan</CardTitle>
          <CardDescription>Focus on: {roadmap.weekly_plan.focus}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {roadmap.weekly_plan.activities.map((activity, index) => (
              <li key={index} className="flex items-start">
                <span className="text-learn-purple mr-2">•</span> {activity}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerRoadmap;
