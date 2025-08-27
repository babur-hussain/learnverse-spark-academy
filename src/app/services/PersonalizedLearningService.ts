
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { LearningProfile, LearningPath, LearningPathResource, SkillLevel } from '@/types/learning';

export interface RecommendedResource {
  id: string;
  type: 'video' | 'note' | 'test';
  resourceId: string;
  title: string;
  description?: string;
  priority: number;
  completed: boolean;
}

export class PersonalizedLearningService {
  static async getUserProfile(userId: string): Promise<LearningProfile | null> {
    try {
      // For now, we'll return mock data since the tables don't exist yet
      const mockProfile: LearningProfile = {
        id: crypto.randomUUID(),
        user_id: userId,
        learning_style: {
          visual: 25,
          auditory: 30,
          reading: 25,
          kinesthetic: 20,
        },
        pace_preference: 'moderate',
        last_diagnostic_date: new Date().toISOString(),
        selected_goals: ['goal1', 'goal2']
      };
      
      return mockProfile;
    } catch (error) {
      console.error('Error fetching learning profile:', error);
      return null;
    }
  }

  static async getCurrentPath(userId: string): Promise<{
    path: LearningPath | null;
    resources: LearningPathResource[];
  }> {
    try {
      // Mock data for now
      const mockPath: LearningPath = {
        id: crypto.randomUUID(),
        user_id: userId,
        is_active: true,
        current_phase: 1,
        total_phases: 5,
        goals: ['Pass math exam', 'Improve science grade'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockResources: LearningPathResource[] = [
        {
          id: crypto.randomUUID(),
          learning_path_id: mockPath.id,
          resource_type: 'video',
          resource_id: 'video1',
          title: 'Introduction to Algebra',
          description: 'Learn the basics of algebraic equations',
          priority: 1,
          order_index: 1,
          completed: false
        },
        {
          id: crypto.randomUUID(),
          learning_path_id: mockPath.id,
          resource_type: 'note',
          resource_id: 'note1',
          title: 'Algebra Formulas',
          description: 'Key formulas to remember',
          priority: 2,
          order_index: 2,
          completed: false
        },
        {
          id: crypto.randomUUID(),
          learning_path_id: mockPath.id,
          resource_type: 'test',
          resource_id: 'test1',
          title: 'Algebra Quiz',
          description: 'Test your knowledge',
          priority: 3,
          order_index: 3,
          completed: false
        }
      ];

      return {
        path: mockPath,
        resources: mockResources
      };
    } catch (error) {
      console.error('Error fetching learning path:', error);
      return { path: null, resources: [] };
    }
  }

  static async saveDiagnosticResults(userId: string, results: {
    learningStyle: {
      visual: number;
      auditory: number;
      reading: number;
      kinesthetic: number;
    };
    skillLevels: SkillLevel[];
    selectedGoals: string[];
    pacePreference: 'slow' | 'moderate' | 'fast';
  }): Promise<boolean> {
    try {
      // For now, we'll just mock a successful response
      console.log('Saving diagnostic results for user:', userId, results);
      toast.success('Diagnostic results saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving diagnostic results:', error);
      toast.error('Failed to save your diagnostic results');
      return false;
    }
  }

  static async markResourceCompleted(resourceId: string, completed: boolean = true): Promise<boolean> {
    try {
      console.log('Marking resource as completed:', resourceId, completed);
      // Mock successful response
      return true;
    } catch (error) {
      console.error('Error marking resource as completed:', error);
      return false;
    }
  }

  // Add missing methods that are referenced in other components
  static async getCurrentLearningPath(userId: string): Promise<any> {
    // Forward to existing method with slightly different name
    return this.getCurrentPath(userId);
  }

  static async generateLearningPath(userId: string): Promise<{
    needsDiagnostic: boolean;
    path?: any;
  }> {
    // Mock implementation
    const profile = await this.getUserProfile(userId);
    
    if (!profile || !profile.last_diagnostic_date) {
      return { needsDiagnostic: true };
    }
    
    const { path, resources } = await this.getCurrentPath(userId);
    return { 
      needsDiagnostic: false,
      path: {
        ...path,
        learning_path_resources: resources
      }
    };
  }

  static async getLearningAnalytics(userId: string): Promise<any> {
    // Mock analytics data
    return {
      learningStyle: {
        visual: 25,
        auditory: 30,
        reading: 25,
        kinesthetic: 20,
      },
      pacePreference: 'moderate',
      testPerformance: {
        averageScore: 78.5,
        highestScore: 92,
        completedTests: 5,
        totalTests: 8,
      },
      resourceCompletion: {
        completionRate: 65,
        totalResources: 20,
        completedResources: 13,
      }
    };
  }
}
