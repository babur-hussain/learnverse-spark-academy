
import { supabase } from '@/integrations/supabase/client';
import type { 
  CareerProfile, 
  CareerMatch, 
  CareerRoadmap,
  CourseRecommendation,
  ProgressUpdate,
  ChatMessage
} from '@/types/career';

// Mock data to use until database tables are created
const mockData = {
  profiles: new Map<string, CareerProfile>(),
  matches: new Map<string, CareerMatch[]>(),
  roadmaps: new Map<string, CareerRoadmap>(),
  recommendations: new Map<string, CourseRecommendation>(),
  progressUpdates: new Map<string, ProgressUpdate>(),
  chatHistory: new Map<string, ChatMessage[]>()
};

export class CareerGuidanceService {
  // Career Profile Management
  static async getCareerProfile(userId: string): Promise<CareerProfile | null> {
    try {
      // Use mock data instead of querying the database
      if (mockData.profiles.has(userId)) {
        return mockData.profiles.get(userId) || null;
      }
      
      console.log('Mock: No career profile found for user', userId);
      return null;
    } catch (error) {
      console.error('Error in getCareerProfile:', error);
      return null;
    }
  }
  
  static async createCareerProfile(profileData: Partial<CareerProfile>): Promise<CareerProfile | null> {
    try {
      if (!profileData.user_id) {
        console.error('User ID is required for career profile');
        return null;
      }
      
      // Create a new profile with mock data
      const newProfile = {
        ...profileData,
        id: `mock_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as CareerProfile;
      
      // Store in mock data
      mockData.profiles.set(profileData.user_id, newProfile);
      
      return newProfile;
    } catch (error) {
      console.error('Error in createCareerProfile:', error);
      return null;
    }
  }
  
  static async updateCareerProfile(id: string, profileData: Partial<CareerProfile>): Promise<CareerProfile | null> {
    try {
      // Find profile in mock data
      let found = false;
      mockData.profiles.forEach((profile, userId) => {
        if (profile.id === id) {
          const updatedProfile = {
            ...profile,
            ...profileData,
            updated_at: new Date().toISOString()
          } as CareerProfile;
          
          mockData.profiles.set(userId, updatedProfile);
          found = true;
        }
      });
      
      if (!found) {
        console.error('Profile not found with ID:', id);
        return null;
      }
      
      // Return the updated profile
      let result: CareerProfile | null = null;
      mockData.profiles.forEach((profile) => {
        if (profile.id === id) {
          result = profile;
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error in updateCareerProfile:', error);
      return null;
    }
  }
  
  static async getCareerMatches(userId: string): Promise<CareerMatch[]> {
    try {
      // Return mock data
      return mockData.matches.get(userId) || [];
    } catch (error) {
      console.error('Error in getCareerMatches:', error);
      return [];
    }
  }
  
  static async createCareerMatch(matchData: Partial<CareerMatch>): Promise<CareerMatch | null> {
    try {
      if (!matchData.user_id) {
        console.error('User ID is required for career match');
        return null;
      }
      
      // Create a new match
      const newMatch = {
        ...matchData,
        id: `match_${Date.now()}`,
        created_at: new Date().toISOString()
      } as CareerMatch;
      
      // Store in mock data
      const currentMatches = mockData.matches.get(matchData.user_id) || [];
      currentMatches.push(newMatch);
      mockData.matches.set(matchData.user_id, currentMatches);
      
      return newMatch;
    } catch (error) {
      console.error('Error in createCareerMatch:', error);
      return null;
    }
  }
  
  // Career Roadmap Management
  static async getCareerRoadmap(matchId: string): Promise<CareerRoadmap | null> {
    try {
      // Return mock data
      let result: CareerRoadmap | null = null;
      mockData.roadmaps.forEach((roadmap) => {
        if (roadmap.career_match_id === matchId) {
          result = roadmap;
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error in getCareerRoadmap:', error);
      return null;
    }
  }
  
  static async createCareerRoadmap(roadmapData: Partial<CareerRoadmap>): Promise<CareerRoadmap | null> {
    try {
      if (!roadmapData.user_id || !roadmapData.career_match_id) {
        console.error('User ID and career match ID are required for career roadmap');
        return null;
      }
      
      // Create a new roadmap
      const newRoadmap = {
        ...roadmapData,
        id: `roadmap_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as CareerRoadmap;
      
      // Store in mock data
      mockData.roadmaps.set(roadmapData.career_match_id, newRoadmap);
      
      return newRoadmap;
    } catch (error) {
      console.error('Error in createCareerRoadmap:', error);
      return null;
    }
  }
  
  static async updateMilestoneStatus(milestoneId: string, completed: boolean): Promise<boolean> {
    try {
      // In a mock implementation, just return success
      console.log(`Mock: Updated milestone ${milestoneId} to ${completed ? 'completed' : 'not completed'}`);
      return true;
    } catch (error) {
      console.error('Error in updateMilestoneStatus:', error);
      return false;
    }
  }
  
  // Course Recommendations
  static async getCourseRecommendations(roadmapId: string): Promise<CourseRecommendation | null> {
    try {
      // Return mock data
      return mockData.recommendations.get(roadmapId) || null;
    } catch (error) {
      console.error('Error in getCourseRecommendations:', error);
      return null;
    }
  }
  
  static async createCourseRecommendations(recommendationData: Partial<CourseRecommendation>): Promise<CourseRecommendation | null> {
    try {
      if (!recommendationData.roadmap_id) {
        console.error('Roadmap ID is required for course recommendations');
        return null;
      }
      
      // Create new recommendations
      const newRecommendation = {
        ...recommendationData,
        id: `rec_${Date.now()}`,
        created_at: new Date().toISOString()
      } as CourseRecommendation;
      
      // Store in mock data
      mockData.recommendations.set(recommendationData.roadmap_id, newRecommendation);
      
      return newRecommendation;
    } catch (error) {
      console.error('Error in createCourseRecommendations:', error);
      return null;
    }
  }
  
  // Progress Updates
  static async getLatestProgressUpdate(roadmapId: string): Promise<ProgressUpdate | null> {
    try {
      // Return mock data
      return mockData.progressUpdates.get(roadmapId) || null;
    } catch (error) {
      console.error('Error in getLatestProgressUpdate:', error);
      return null;
    }
  }
  
  static async createProgressUpdate(updateData: Partial<ProgressUpdate>): Promise<ProgressUpdate | null> {
    try {
      if (!updateData.roadmap_id) {
        console.error('Roadmap ID is required for progress update');
        return null;
      }
      
      // Create new progress update
      const newUpdate = {
        ...updateData,
        id: `progress_${Date.now()}`,
        created_at: new Date().toISOString()
      } as ProgressUpdate;
      
      // Store in mock data
      mockData.progressUpdates.set(updateData.roadmap_id, newUpdate);
      
      return newUpdate;
    } catch (error) {
      console.error('Error in createProgressUpdate:', error);
      return null;
    }
  }
  
  // Chat History
  static async getChatHistory(userId: string): Promise<ChatMessage[]> {
    try {
      // Return mock data
      return mockData.chatHistory.get(userId) || [];
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return [];
    }
  }
  
  static async saveChatMessage(messageData: Partial<ChatMessage>): Promise<ChatMessage | null> {
    try {
      if (!messageData.user_id) {
        console.error('User ID is required for chat message');
        return null;
      }
      
      const messageWithTimestamp = {
        ...messageData,
        id: `msg_${Date.now()}`,
        timestamp: new Date().toISOString()
      } as ChatMessage;
      
      // Store in mock data
      const currentHistory = mockData.chatHistory.get(messageData.user_id) || [];
      currentHistory.push(messageWithTimestamp);
      mockData.chatHistory.set(messageData.user_id, currentHistory);
      
      return messageWithTimestamp;
    } catch (error) {
      console.error('Error in saveChatMessage:', error);
      return null;
    }
  }
  
  // AI Integration - These functions can continue to use Supabase Edge Functions
  static async analyzeAptitude(quizResults: any, userInfo: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('career-guidance', {
        body: {
          action: 'analyze_aptitude',
          data: { quizResults, userInfo }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing aptitude:', error);
      return null;
    }
  }
  
  static async generateCareerMatches(profileSummary: any, userInfo: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('career-guidance', {
        body: {
          action: 'generate_career_matches',
          data: { profileSummary, userInfo }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating career matches:', error);
      return null;
    }
  }
  
  static async generateRoadmap(career: string, profileSummary: any, userInfo: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('career-guidance', {
        body: {
          action: 'generate_roadmap',
          data: { career, profileSummary, userInfo }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      return null;
    }
  }
  
  static async recommendCourses(career: string, roadmap: any, profileSummary: any, platformCourses: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('career-guidance', {
        body: {
          action: 'recommend_courses',
          data: { career, roadmap, profileSummary, platformCourses }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recommending courses:', error);
      return null;
    }
  }
  
  static async adaptProgress(roadmap: any, completedMilestones: any, testScores: any, participation: any, profileSummary: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('career-guidance', {
        body: {
          action: 'adapt_progress',
          data: { roadmap, completedMilestones, testScores, participation, profileSummary }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adapting progress:', error);
      return null;
    }
  }
  
  static async chatWithAI(message: string, chatHistory: ChatMessage[], profileSummary: any, roadmap: any): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('career-guidance', {
        body: {
          action: 'chat',
          data: { message, chatHistory, profileSummary, roadmap }
        }
      });
      
      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Error chatting with AI:', error);
      return null;
    }
  }
}
