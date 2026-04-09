import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { PersonalizedLearningService } from '@/services/PersonalizedLearningService';
import { Progress } from '@/components/UI/progress';
import type { LearningStyle, SkillLevel } from '@/types/learning';
import { toast } from 'sonner';
import { Slider } from '@/components/UI/slider';
import { Label } from '@/components/UI/label';
import { Input } from '@/components/UI/input';
import { Checkbox } from '@/components/UI/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group"

interface DiagnosticTestProps {
  onComplete: () => void;
}

const DiagnosticTest: React.FC<DiagnosticTestProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>({
    visual: 25,
    auditory: 25,
    reading: 25,
    kinesthetic: 25,
  });
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [pacePreference, setPacePreference] = useState<'slow' | 'moderate' | 'fast'>('moderate');

  const handleLearningStyleChange = (style: keyof LearningStyle, value: number) => {
    setLearningStyle(prev => ({ ...prev, [style]: value }));
  };

  const handleGoalSelect = (goal: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goal)) {
        return prev.filter(g => g !== goal);
      } else {
        return [...prev, goal];
      }
    });
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Mock skill levels for now - in a real app these would come from actual test results
      const mockSkillLevels: SkillLevel[] = [
        {
          id: crypto.randomUUID(),
          user_id: user.id,
          subject_id: '123',
          chapter_id: '456',
          level: 65,
          confidence: 70,
        },
      ];

      const success = await PersonalizedLearningService.saveDiagnosticResults(user.id, {
        learningStyle,
        skillLevels: mockSkillLevels,
        selectedGoals,
        pacePreference,
      });

      if (success) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving diagnostic results:', error);
      toast.error('Failed to save your diagnostic results');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Learning Style Assessment</CardTitle>
        <CardDescription>
          Help us understand how you learn best
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How do you prefer to learn?</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="visual">Visual</Label>
                <Slider
                  id="visual"
                  defaultValue={[learningStyle.visual]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleLearningStyleChange('visual', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auditory">Auditory</Label>
                <Slider
                  id="auditory"
                  defaultValue={[learningStyle.auditory]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleLearningStyleChange('auditory', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reading">Reading/Writing</Label>
                <Slider
                  id="reading"
                  defaultValue={[learningStyle.reading]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleLearningStyleChange('reading', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kinesthetic">Hands-on</Label>
                <Slider
                  id="kinesthetic"
                  defaultValue={[learningStyle.kinesthetic]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleLearningStyleChange('kinesthetic', value[0])}
                />
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select your learning goals</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goal1"
                  checked={selectedGoals.includes('goal1')}
                  onCheckedChange={() => handleGoalSelect('goal1')}
                />
                <Label htmlFor="goal1">Pass the next math exam</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goal2"
                  checked={selectedGoals.includes('goal2')}
                  onCheckedChange={() => handleGoalSelect('goal2')}
                />
                <Label htmlFor="goal2">Improve my science grade</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goal3"
                  checked={selectedGoals.includes('goal3')}
                  onCheckedChange={() => handleGoalSelect('goal3')}
                />
                <Label htmlFor="goal3">Get better at writing essays</Label>
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose your preferred learning pace</h3>
            <RadioGroup defaultValue={pacePreference} onValueChange={(value) => setPacePreference(value as 'slow' | 'moderate' | 'fast')} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="slow" id="r1" />
                <Label htmlFor="r1">Slow</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="r2" />
                <Label htmlFor="r2">Moderate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fast" id="r3" />
                <Label htmlFor="r3">Fast</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 1 || loading}
          >
            Previous
          </Button>
          
          <Button
            onClick={() => {
              if (step < totalSteps) {
                setStep(prev => prev + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={loading}
          >
            {step === totalSteps ? 'Complete Assessment' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticTest;
