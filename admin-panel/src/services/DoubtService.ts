
import apiClient from '@/integrations/api/client';
import { uploadFileToS3 } from '@/integrations/s3/upload';
import type { Doubt, DoubtReply } from '@/types/doubt';

export class DoubtService {
  static async createDoubt(doubt: {
    title: string;
    description: string;
    subject?: string;
    attachments?: File[];
  }): Promise<Doubt> {
    try {
      // Upload attachments to S3 first if any
      let attachmentUrls: string[] = [];
      if (doubt.attachments && doubt.attachments.length > 0) {
        for (const file of doubt.attachments) {
          const result = await uploadFileToS3(file, 'doubts');
          attachmentUrls.push(result.url);
        }
      }

      const { data } = await apiClient.post('/api/doubts', {
        title: doubt.title,
        description: doubt.description,
        subject: doubt.subject,
        attachment_urls: attachmentUrls,
      });

      return data;
    } catch (error) {
      console.error('Error creating doubt:', error);
      throw error;
    }
  }

  static async getDoubts(filters?: {
    subject?: string;
    status?: string;
    userId?: string;
  }): Promise<Doubt[]> {
    try {
      const { data } = await apiClient.get('/api/doubts', { params: filters });
      return data || [];
    } catch (error) {
      console.error('Error fetching doubts:', error);
      return [];
    }
  }

  static async getDoubt(id: string): Promise<Doubt | null> {
    try {
      const { data } = await apiClient.get(`/api/doubts/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching doubt:', error);
      return null;
    }
  }

  static async replyToDoubt(doubtId: string, reply: {
    content: string;
    attachments?: File[];
  }): Promise<DoubtReply> {
    try {
      let attachmentUrls: string[] = [];
      if (reply.attachments && reply.attachments.length > 0) {
        for (const file of reply.attachments) {
          const result = await uploadFileToS3(file, 'doubt-replies');
          attachmentUrls.push(result.url);
        }
      }

      const { data } = await apiClient.post(`/api/doubts/${doubtId}/replies`, {
        content: reply.content,
        attachment_urls: attachmentUrls,
      });

      return data;
    } catch (error) {
      console.error('Error replying to doubt:', error);
      throw error;
    }
  }

  static async resolveDoubt(doubtId: string): Promise<void> {
    try {
      await apiClient.put(`/api/doubts/${doubtId}/resolve`);
    } catch (error) {
      console.error('Error resolving doubt:', error);
      throw error;
    }
  }
}
