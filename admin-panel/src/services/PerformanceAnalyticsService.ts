import apiClient from '@/integrations/api/client';
import type { PerformanceMetrics, PerformanceAnomaly, StudentGoal, TeacherSuggestion } from '@/types/analytics';

export class PerformanceAnalyticsService {
  static async getStudentPerformanceMetrics(userId: string): Promise<PerformanceMetrics | null> {
    try {
      const { data } = await apiClient.get(`/api/analytics/performance/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return null;
    }
  }

  static async getPerformanceAnomalies(userId: string): Promise<PerformanceAnomaly[]> {
    try {
      const { data } = await apiClient.get(`/api/analytics/anomalies/${userId}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  }

  static async createStudentGoal(goal: Omit<StudentGoal, 'id'>): Promise<StudentGoal | null> {
    try {
      const { data } = await apiClient.post('/api/analytics/goals', goal);
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  }

  static async getTeacherSuggestions(batchId: string): Promise<TeacherSuggestion[]> {
    try {
      const { data } = await apiClient.get(`/api/analytics/suggestions/${batchId}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching teacher suggestions:', error);
      return [];
    }
  }
}
