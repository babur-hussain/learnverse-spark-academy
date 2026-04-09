
import apiClient from '@/integrations/api/client';

export class LiveInteractionService {
  static mapQuestion(raw: any) {
    return {
      id: raw.id,
      sessionId: raw.session_id || raw.sessionId,
      userId: raw.user_id || raw.userId,
      question: raw.question,
      isPublic: raw.is_public ?? raw.isPublic,
      isAnonymous: raw.is_anonymous ?? raw.isAnonymous,
      isAnswered: raw.is_answered ?? raw.isAnswered,
      upvotes: raw.upvotes || 0,
      createdAt: raw.created_at || raw.createdAt,
    };
  }

  static mapChatMessage(raw: any) {
    return {
      id: raw.id,
      sessionId: raw.session_id || raw.sessionId,
      userId: raw.user_id || raw.userId,
      message: raw.message,
      parentId: raw.parent_id || raw.parentId,
      createdAt: raw.created_at || raw.createdAt,
    };
  }

  static async submitQuestion(
    sessionId: string,
    question: string,
    isPublic: boolean = true,
    isAnonymous: boolean = false
  ) {
    try {
      const { data } = await apiClient.post(`/api/live-sessions/${sessionId}/questions`, {
        question,
        is_public: isPublic,
        is_anonymous: isAnonymous,
      });
      return data;
    } catch (error) {
      console.error('Error submitting question:', error);
      throw error;
    }
  }

  static async sendChatMessage(
    sessionId: string,
    message: string,
    parentId?: string
  ) {
    try {
      const { data } = await apiClient.post(`/api/live-sessions/${sessionId}/chat`, {
        message,
        parent_id: parentId,
      });
      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  static async raiseHand(sessionId: string, reason?: string) {
    try {
      const { data } = await apiClient.post(`/api/live-sessions/${sessionId}/hand-raise`, {
        reason,
      });
      return data;
    } catch (error) {
      console.error('Error raising hand:', error);
      throw error;
    }
  }

  static async sendReaction(sessionId: string, reactionType: string) {
    try {
      const { data } = await apiClient.post(`/api/live-sessions/${sessionId}/reactions`, {
        reaction_type: reactionType,
      });
      return data;
    } catch (error) {
      console.error('Error sending reaction:', error);
      throw error;
    }
  }

  static async createPoll(
    sessionId: string,
    question: string,
    options: string[],
    isMultipleChoice: boolean = false
  ) {
    try {
      const { data } = await apiClient.post(`/api/live-sessions/${sessionId}/polls`, {
        question,
        options,
        is_multiple_choice: isMultipleChoice,
      });
      return data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }
}
