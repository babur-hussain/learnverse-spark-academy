
import apiClient from '@/integrations/api/client';
import { auth } from '@/integrations/firebase/config';
import type { ForumCategory, ForumPost, ForumThread, ThreadType, VoteType, ForumFilter, ForumPoll, ForumCategoryType, ThreadStatus } from '@/types/forum';

export class ForumService {
  // Helper method to get current user ID
  private static getCurrentUserId(): string | undefined {
    return auth.currentUser?.uid;
  }

  static async getCategories(): Promise<ForumCategory[]> {
    try {
      const { data } = await apiClient.get('/api/forum/categories');
      return (data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || undefined,
        slug: cat.slug,
        parentId: cat.parent_id || cat.parentId || undefined,
        type: cat.type as ForumCategoryType,
        referenceId: cat.reference_id || cat.referenceId || undefined,
        isActive: cat.is_active ?? cat.isActive,
        createdAt: cat.created_at || cat.createdAt,
        updatedAt: cat.updated_at || cat.updatedAt || undefined
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getCategoryBySlug(slug: string): Promise<ForumCategory | null> {
    try {
      const { data: category } = await apiClient.get(`/api/forum/categories/${slug}`);
      if (!category) return null;

      return {
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        slug: category.slug,
        parentId: category.parent_id || category.parentId || undefined,
        type: category.type as ForumCategoryType,
        referenceId: category.reference_id || category.referenceId || undefined,
        isActive: category.is_active ?? category.isActive,
        createdAt: category.created_at || category.createdAt,
        updatedAt: category.updated_at || category.updatedAt || undefined
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  static async getThreads(filter?: ForumFilter): Promise<ForumThread[]> {
    try {
      const params: Record<string, string> = {};
      if (filter?.categoryId) params.category_id = filter.categoryId;
      if (filter?.sortBy) params.sort_by = filter.sortBy;
      if (filter?.search) params.search = filter.search;

      const { data: threads } = await apiClient.get('/api/forum/threads', { params });
      return threads || [];
    } catch (error) {
      console.error('Error fetching threads:', error);
      return [];
    }
  }

  static async getThread(threadId: string): Promise<ForumThread | null> {
    try {
      const { data } = await apiClient.get(`/api/forum/threads/${threadId}`);
      return data;
    } catch (error) {
      console.error('Error fetching thread:', error);
      return null;
    }
  }

  // Alias for getThread to match usage in components
  static getThreadById(threadId: string): Promise<ForumThread | null> {
    return this.getThread(threadId);
  }

  static async getPostsByThreadId(threadId: string): Promise<ForumPost[]> {
    try {
      const { data } = await apiClient.get(`/api/forum/threads/${threadId}/posts`);
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  static async createPost(postData: {
    threadId: string;
    content: string;
    userId: string;
    parentId?: string;
  }): Promise<ForumPost | null> {
    try {
      const { data } = await apiClient.post(`/api/forum/threads/${postData.threadId}/posts`, {
        content: postData.content,
        user_id: postData.userId,
        parent_id: postData.parentId,
      });
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  static async createThread(threadData: {
    title: string;
    content: string;
    categoryId: string;
    userId: string;
    threadType: ThreadType;
    tags?: string[];
    poll?: {
      question: string;
      options: { text: string }[];
      allowMultiple: boolean;
      closesAt?: string;
    };
  }): Promise<ForumThread | null> {
    try {
      const { data } = await apiClient.post('/api/forum/threads', {
        title: threadData.title,
        content: threadData.content,
        category_id: threadData.categoryId,
        user_id: threadData.userId,
        thread_type: threadData.threadType,
        tags: threadData.tags,
        poll: threadData.poll,
      });
      return data;
    } catch (error) {
      console.error('Error creating thread:', error);
      return null;
    }
  }

  static async markPostAsAccepted(postId: string): Promise<boolean> {
    try {
      await apiClient.put(`/api/forum/posts/${postId}/accept`);
      return true;
    } catch (error) {
      console.error('Error accepting answer:', error);
      return false;
    }
  }

  static async voteOnPost(postId: string, voteType: VoteType): Promise<boolean> {
    try {
      await apiClient.post(`/api/forum/posts/${postId}/vote`, { vote_type: voteType });
      return true;
    } catch (error) {
      console.error('Error voting on post:', error);
      return false;
    }
  }

  static async voteOnPoll(pollId: string, optionIndex: number): Promise<boolean> {
    try {
      await apiClient.post(`/api/forum/polls/${pollId}/vote`, { option_index: optionIndex });
      return true;
    } catch (error) {
      console.error('Error voting on poll:', error);
      return false;
    }
  }

  // Alias for voteOnPoll to match usage in components
  static voteInPoll(pollId: string, optionIndex: number): Promise<boolean> {
    return this.voteOnPoll(pollId, optionIndex);
  }

  static async bookmarkThread(threadId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/forum/threads/${threadId}/bookmark`);
      return true;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return false;
    }
  }

  static async isThreadBookmarkedByUser(threadId: string): Promise<boolean> {
    try {
      const { data } = await apiClient.get(`/api/forum/threads/${threadId}/bookmark`);
      return !!data?.bookmarked;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  static async subscribeToThread(threadId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/forum/threads/${threadId}/subscribe`);
      return true;
    } catch (error) {
      console.error('Error toggling subscription:', error);
      return false;
    }
  }

  static async isUserSubscribedToThread(threadId: string): Promise<boolean> {
    try {
      const { data } = await apiClient.get(`/api/forum/threads/${threadId}/subscription`);
      return !!data?.subscribed;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  static async reportThread(threadId: string, reason: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/forum/threads/${threadId}/report`, { reason });
      return true;
    } catch (error) {
      console.error('Error reporting thread:', error);
      return false;
    }
  }

  static async getBookmarkedThreads(): Promise<ForumThread[]> {
    try {
      const { data } = await apiClient.get('/api/forum/bookmarks');
      return data || [];
    } catch (error) {
      console.error('Error fetching bookmarked threads:', error);
      return [];
    }
  }
}
