
import apiClient from '@/integrations/api/client';
import type {
  CareerProfile,
  CareerMatch,
  CareerRoadmap,
  CourseRecommendation,
  ProgressUpdate,
  ChatMessage
} from '@/types/career';

export class CareerGuidanceService {
  // Career Profile Management
  static async getCareerProfile(userId: string): Promise<CareerProfile | null> {
    try {
      const { data } = await apiClient.get('/api/career/profile');
      return data;
    } catch (error) {
      console.error('Error in getCareerProfile:', error);
      return null;
    }
  }

  static async createCareerProfile(profileData: Partial<CareerProfile>): Promise<CareerProfile | null> {
    try {
      const { data } = await apiClient.post('/api/career/profile', profileData);
      return data;
    } catch (error) {
      console.error('Error in createCareerProfile:', error);
      return null;
    }
  }

  static async updateCareerProfile(id: string, profileData: Partial<CareerProfile>): Promise<CareerProfile | null> {
    try {
      const { data } = await apiClient.put(`/api/career/profile/${id}`, profileData);
      return data;
    } catch (error) {
      console.error('Error in updateCareerProfile:', error);
      return null;
    }
  }

  static async getCareerMatches(userId: string): Promise<CareerMatch[]> {
    try {
      const { data } = await apiClient.get('/api/career/matches');
      return data || [];
    } catch (error) {
      console.error('Error in getCareerMatches:', error);
      return [];
    }
  }

  static async createCareerMatch(matchData: Partial<CareerMatch>): Promise<CareerMatch | null> {
    try {
      const { data } = await apiClient.post('/api/career/matches', matchData);
      return data;
    } catch (error) {
      console.error('Error in createCareerMatch:', error);
      return null;
    }
  }

  // Career Roadmap Management
  static async getCareerRoadmap(matchId: string): Promise<CareerRoadmap | null> {
    try {
      const { data } = await apiClient.get(`/api/career/roadmap/${matchId}`);
      return data;
    } catch (error) {
      console.error('Error in getCareerRoadmap:', error);
      return null;
    }
  }

  static async createCareerRoadmap(roadmapData: Partial<CareerRoadmap>): Promise<CareerRoadmap | null> {
    try {
      const { data } = await apiClient.post('/api/career/roadmap', roadmapData);
      return data;
    } catch (error) {
      console.error('Error in createCareerRoadmap:', error);
      return null;
    }
  }

  static async updateMilestoneStatus(milestoneId: string, completed: boolean): Promise<boolean> {
    try {
      await apiClient.put(`/api/career/milestone/${milestoneId}`, { completed });
      return true;
    } catch (error) {
      console.error('Error in updateMilestoneStatus:', error);
      return false;
    }
  }

  // Course Recommendations
  static async getCourseRecommendations(roadmapId: string): Promise<CourseRecommendation | null> {
    try {
      const { data } = await apiClient.get(`/api/career/recommendations/${roadmapId}`);
      return data;
    } catch (error) {
      console.error('Error in getCourseRecommendations:', error);
      return null;
    }
  }

  static async createCourseRecommendations(recommendationData: Partial<CourseRecommendation>): Promise<CourseRecommendation | null> {
    try {
      const { data } = await apiClient.post('/api/career/recommendations', recommendationData);
      return data;
    } catch (error) {
      console.error('Error in createCourseRecommendations:', error);
      return null;
    }
  }

  // Progress Updates
  static async getLatestProgressUpdate(roadmapId: string): Promise<ProgressUpdate | null> {
    try {
      const { data } = await apiClient.get(`/api/career/progress/${roadmapId}`);
      return data;
    } catch (error) {
      console.error('Error in getLatestProgressUpdate:', error);
      return null;
    }
  }

  static async createProgressUpdate(updateData: Partial<ProgressUpdate>): Promise<ProgressUpdate | null> {
    try {
      const { data } = await apiClient.post('/api/career/progress', updateData);
      return data;
    } catch (error) {
      console.error('Error in createProgressUpdate:', error);
      return null;
    }
  }

  // Chat History
  static async getChatHistory(userId: string): Promise<ChatMessage[]> {
    try {
      const { data } = await apiClient.get('/api/career/chat-history');
      return data || [];
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return [];
    }
  }

  static async saveChatMessage(messageData: Partial<ChatMessage>): Promise<ChatMessage | null> {
    try {
      const { data } = await apiClient.post('/api/career/chat', messageData);
      return data;
    } catch (error) {
      console.error('Error in saveChatMessage:', error);
      return null;
    }
  }

  // AI Integration - These functions call the EC2 backend API
  static async analyzeAptitude(quizResults: any, userInfo: any): Promise<any> {
    try {
      const { data } = await apiClient.post('/api/career/ai/analyze-aptitude', {
        quizResults,
        userInfo,
      });
      return data;
    } catch (error) {
      console.error('Error analyzing aptitude:', error);
      return null;
    }
  }

  static async generateCareerMatches(profileSummary: any, userInfo: any): Promise<any> {
    try {
      const { data } = await apiClient.post('/api/career/ai/generate-matches', {
        profileSummary,
        userInfo,
      });
      return data;
    } catch (error) {
      console.error('Error generating career matches:', error);
      return null;
    }
  }

  static async generateRoadmap(career: string, profileSummary: any, userInfo: any): Promise<any> {
    try {
      const { data } = await apiClient.post('/api/career/ai/generate-roadmap', {
        career,
        profileSummary,
        userInfo,
      });
      return data;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      return null;
    }
  }

  static async recommendCourses(career: string, roadmap: any, profileSummary: any, platformCourses: any): Promise<any> {
    try {
      const { data } = await apiClient.post('/api/career/ai/recommend-courses', {
        career,
        roadmap,
        profileSummary,
        platformCourses,
      });
      return data;
    } catch (error) {
      console.error('Error recommending courses:', error);
      return null;
    }
  }

  static async adaptProgress(roadmap: any, completedMilestones: any, testScores: any, participation: any, profileSummary: any): Promise<any> {
    try {
      const { data } = await apiClient.post('/api/career/ai/adapt-progress', {
        roadmap,
        completedMilestones,
        testScores,
        participation,
        profileSummary,
      });
      return data;
    } catch (error) {
      console.error('Error adapting progress:', error);
      return null;
    }
  }

  static async chatWithAI(message: string, chatHistory: ChatMessage[], profileSummary: any, roadmap: any): Promise<string | null> {
    try {
      const { data } = await apiClient.post('/api/career/ai/chat', {
        message,
        chatHistory,
        profileSummary,
        roadmap,
      });
      return data.response;
    } catch (error) {
      console.error('Error chatting with AI:', error);
      return null;
    }
  }
}
