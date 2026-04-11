import apiClient from '@/integrations/api/client';

export class AiChatService {
  static async getChatSessions(userId: string) {
    try {
      const { data } = await apiClient.get('/api/ai-chat/sessions');
      return data || [];
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
  }

  static async getChatMessages(sessionId: string) {
    try {
      const { data } = await apiClient.get(`/api/ai-chat/sessions/${sessionId}/messages`);
      return data || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  static async createChatSession(title: string) {
    try {
      const { data } = await apiClient.post('/api/ai-chat/sessions', { title });
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  static async sendMessage(sessionId: string, message: string, role: string = 'user') {
    try {
      const { data } = await apiClient.post(`/api/ai-chat/sessions/${sessionId}/messages`, {
        message,
        role,
      });
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getAiResponse(sessionId: string, userMessage: string) {
    try {
      const { data } = await apiClient.post(`/api/ai-chat/sessions/${sessionId}/ai-response`, {
        message: userMessage,
      });
      return data;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }

  static async updateSessionTitle(sessionId: string, title: string) {
    try {
      await apiClient.put(`/api/ai-chat/sessions/${sessionId}`, { title });
    } catch (error) {
      console.error('Error updating session title:', error);
      throw error;
    }
  }
}
