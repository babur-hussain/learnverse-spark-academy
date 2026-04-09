
import { toast } from 'sonner';
import apiClient from '@/integrations/api/client';
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
      const { data } = await apiClient.get('/api/learning/profile');
      return data;
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
      const { data } = await apiClient.get('/api/learning/current-path');
      return {
        path: data?.path || null,
        resources: data?.resources || [],
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
      await apiClient.post('/api/learning/diagnostic', results);
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
      await apiClient.put(`/api/learning/resources/${resourceId}/complete`, { completed });
      return true;
    } catch (error) {
      console.error('Error marking resource as completed:', error);
      return false;
    }
  }

  // Add missing methods that are referenced in other components
  static async getCurrentLearningPath(userId: string): Promise<any> {
    return this.getCurrentPath(userId);
  }

  static async generateLearningPath(userId: string): Promise<{
    needsDiagnostic: boolean;
    path?: any;
  }> {
    try {
      const { data } = await apiClient.post('/api/learning/generate-path');
      return data;
    } catch (error) {
      console.error('Error generating learning path:', error);
      const profile = await this.getUserProfile(userId);
      if (!profile || !profile.last_diagnostic_date) {
        return { needsDiagnostic: true };
      }
      const { path, resources } = await this.getCurrentPath(userId);
      return {
        needsDiagnostic: false,
        path: {
          ...path,
          learning_path_resources: resources,
        },
      };
    }
  }

  static async getLearningAnalytics(userId: string): Promise<any> {
    try {
      const { data } = await apiClient.get('/api/learning/analytics');
      return data;
    } catch (error) {
      console.error('Error fetching learning analytics:', error);
      return null;
    }
  }
}
