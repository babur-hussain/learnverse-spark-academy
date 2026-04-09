
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Separator } from '@/components/UI/separator';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Input } from '@/components/UI/input';
import { Progress } from '@/components/UI/progress';
import { Checkbox } from '@/components/UI/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CareerGuidanceService } from '@/services/CareerGuidanceService';

interface CareerAptitudeTestProps {
  onComplete: () => void;
}

const CareerAptitudeTest: React.FC<CareerAptitudeTestProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const steps = [
    {
      title: 'Personal Information',
      description: 'Tell us a bit about yourself to help tailor your career recommendations.',
      fields: [
        { id: 'age', label: 'Age', type: 'number' },
        { id: 'education_level', label: 'Education Level', type: 'select', options: [
          'High School', 'Undergraduate', 'Graduate', 'Post-Graduate'
        ]},
        { id: 'current_field', label: 'Current Field of Study/Work', type: 'text' },
        { id: 'goals', label: 'Career Goals (Short description)', type: 'textarea' }
      ]
    },
    {
      title: 'Interests Assessment',
      description: 'Rate your interest level in the following areas from 1 (Not at all interested) to 5 (Very interested).',
      fields: [
        { id: 'interest_science', label: 'Science & Research', type: 'rating' },
        { id: 'interest_tech', label: 'Technology & Computing', type: 'rating' },
        { id: 'interest_arts', label: 'Arts & Design', type: 'rating' },
        { id: 'interest_business', label: 'Business & Management', type: 'rating' },
        { id: 'interest_health', label: 'Healthcare & Medicine', type: 'rating' },
        { id: 'interest_education', label: 'Education & Training', type: 'rating' },
        { id: 'interest_engineering', label: 'Engineering', type: 'rating' },
        { id: 'interest_social', label: 'Social Services & Community', type: 'rating' }
      ]
    },
    {
      title: 'Skills Assessment',
      description: 'Rate your skill level in the following areas from 1 (Beginner) to 5 (Expert).',
      fields: [
        { id: 'skill_analytical', label: 'Analytical Thinking', type: 'rating' },
        { id: 'skill_communication', label: 'Communication', type: 'rating' },
        { id: 'skill_creativity', label: 'Creativity', type: 'rating' },
        { id: 'skill_technical', label: 'Technical Skills', type: 'rating' },
        { id: 'skill_leadership', label: 'Leadership', type: 'rating' },
        { id: 'skill_teamwork', label: 'Teamwork', type: 'rating' },
        { id: 'skill_problem_solving', label: 'Problem Solving', type: 'rating' },
        { id: 'skill_adaptability', label: 'Adaptability', type: 'rating' }
      ]
    },
    {
      title: 'Work Style Preferences',
      description: 'Select your preferences for work environments and styles.',
      fields: [
        { id: 'work_environment', label: 'Preferred Work Environment', type: 'select', options: [
          'Remote Work', 'Office Environment', 'Field Work', 'Mixed Environment'
        ]},
        { id: 'work_schedule', label: 'Preferred Work Schedule', type: 'select', options: [
          'Regular 9-5', 'Flexible Hours', 'Project-Based', 'Shift Work'
        ]},
        { id: 'work_culture', label: 'Preferred Work Culture', type: 'multiselect', options: [
          'Collaborative', 'Independent', 'Fast-Paced', 'Structured', 'Creative', 'Innovative'
        ]}
      ]
    },
    {
      title: 'Values & Motivations',
      description: 'What drives you in your career? Select all that apply.',
      fields: [
        { id: 'values', label: 'Career Values', type: 'multiselect', options: [
          'Financial Security', 'Work-Life Balance', 'Making a Difference', 'Recognition',
          'Continuous Learning', 'Career Advancement', 'Job Security', 'Creative Freedom'
        ]},
        { id: 'motivation', label: 'Primary Motivation', type: 'select', options: [
          'Helping Others', 'Financial Success', 'Creative Expression', 'Solving Problems',
          'Building Things', 'Leading Teams', 'Continuous Learning'
        ]}
      ]
    }
  ];
  
  const handleInputChange = (field: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNext = () => {
    // Simple validation - check if all required fields are filled
    const currentStepFields = steps[currentStep].fields;
    const isStepValid = currentStepFields.every(field => {
      if (field.type === 'multiselect') {
        return answers[field.id] && answers[field.id].length > 0;
      }
      return answers[field.id] !== undefined && answers[field.id] !== '';
    });
    
    if (!isStepValid) {
      toast({
        title: "Incomplete Information",
        description: "Please answer all questions before proceeding.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit the assessment.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Extract user info from the answers
      const userInfo = {
        age: answers.age,
        education_level: answers.education_level,
        current_field: answers.current_field,
        goals: answers.goals
      };
      
      // Analyze aptitude using the DeepSeek AI
      const analysis = await CareerGuidanceService.analyzeAptitude(answers, userInfo);
      
      if (!analysis) {
        throw new Error("Failed to analyze aptitude test results.");
      }
      
      // Create a career profile in the database
      const profileData = {
        user_id: user.id,
        personality_type: analysis.personalityType,
        primary_strengths: analysis.primaryStrengths,
        secondary_strengths: analysis.secondaryStrengths,
        areas_for_improvement: analysis.areasForImprovement,
        learning_style: analysis.learningStyle,
        work_environment_preference: analysis.workEnvironmentPreference,
        career_interests: analysis.careerInterests,
        skill_summary: analysis.skillSummary
      };
      
      await CareerGuidanceService.createCareerProfile(profileData);
      
      // Generate career matches
      const matches = await CareerGuidanceService.generateCareerMatches(analysis, userInfo);
      
      if (!matches || !matches.careerMatches) {
        throw new Error("Failed to generate career matches.");
      }
      
      // Save career matches to the database
      for (const match of matches.careerMatches) {
        await CareerGuidanceService.createCareerMatch({
          user_id: user.id,
          career: match.career,
          compatibility_score: match.compatibilityScore,
          reasoning: match.reasoning,
          key_skills_aligned: match.keySkillsAligned,
          potential_challenges: match.potentialChallenges,
          education_requirements: match.educationRequirements,
          growth_opportunities: match.growthOpportunities
        });
      }
      
      toast({
        title: "Assessment Complete!",
        description: "Your career aptitude analysis is ready. Viewing your career matches now!",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error submitting aptitude test:', error);
      toast({
        title: "Submission Error",
        description: "There was a problem analyzing your results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Input 
            type={field.type} 
            id={field.id} 
            value={answers[field.id] || ''} 
            onChange={e => handleInputChange(field.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input 
            type="number" 
            id={field.id} 
            value={answers[field.id] || ''} 
            onChange={e => handleInputChange(field.id, parseInt(e.target.value) || '')}
          />
        );
      case 'textarea':
        return (
          <Textarea 
            id={field.id} 
            value={answers[field.id] || ''} 
            onChange={e => handleInputChange(field.id, e.target.value)}
          />
        );
      case 'select':
        return (
          <select 
            id={field.id} 
            value={answers[field.id] || ''} 
            onChange={e => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select an option</option>
            {field.options.map((option: string, i: number) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options.map((option: string, i: number) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${field.id}-${i}`} 
                  checked={(answers[field.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleInputChange(field.id, [...(answers[field.id] || []), option]);
                    } else {
                      handleInputChange(field.id, (answers[field.id] || []).filter((item: string) => item !== option));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${i}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'rating':
        return (
          <RadioGroup 
            value={answers[field.id]?.toString() || ''} 
            onValueChange={(value) => handleInputChange(field.id, parseInt(value))}
            className="flex space-x-3 pt-2"
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="flex flex-col items-center space-y-1">
                <RadioGroupItem 
                  value={rating.toString()} 
                  id={`${field.id}-${rating}`} 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor={`${field.id}-${rating}`}
                  className="h-8 w-8 rounded-full flex items-center justify-center border border-gray-300 peer-data-[state=checked]:bg-learn-purple peer-data-[state=checked]:text-white cursor-pointer hover:bg-gray-100"
                >
                  {rating}
                </Label>
                {rating === 1 && <span className="text-xs">Low</span>}
                {rating === 5 && <span className="text-xs">High</span>}
              </div>
            ))}
          </RadioGroup>
        );
      default:
        return null;
    }
  };
  
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <Card className="border-learn-purple/20">
      <CardHeader>
        <CardTitle className="text-2xl text-learn-purple">
          {currentStepData.title}
        </CardTitle>
        <CardDescription>
          {currentStepData.description}
        </CardDescription>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentStepData.fields.map((field, index) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            {renderField(field)}
            {index < currentStepData.fields.length - 1 && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0 || loading}
        >
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={loading}
        >
          {loading 
            ? 'Processing...' 
            : currentStep < steps.length - 1 
              ? 'Next' 
              : 'Submit'
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CareerAptitudeTest;
