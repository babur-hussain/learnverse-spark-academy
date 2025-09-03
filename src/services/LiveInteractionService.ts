
import { supabase } from '@/integrations/supabase/client';
import type { 
  LiveQuestion, 
  ChatMessage, 
  HandRaise, 
  LiveReaction,
  LivePoll,
  PollResponse,
  SessionEngagement 
} from '@/types/live-interaction';

export class LiveInteractionService {
  static async submitQuestion(sessionId: string, question: string, isPublic = true, isAnonymous = false): Promise<LiveQuestion | null> {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('live_questions')
        .insert({
          session_id: sessionId,
          question,
          is_public: isPublic,
          is_anonymous: isAnonymous,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapQuestion(data);
    } catch (error) {
      console.error('Error submitting question:', error);
      return null;
    }
  }

  static async sendChatMessage(sessionId: string, message: string, parentId?: string): Promise<ChatMessage | null> {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('live_chat_messages')
        .insert({
          session_id: sessionId,
          message,
          parent_id: parentId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapChatMessage(data);
    } catch (error) {
      console.error('Error sending chat message:', error);
      return null;
    }
  }

  static async raiseHand(sessionId: string, reason?: string): Promise<HandRaise | null> {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('hand_raises')
        .insert({
          session_id: sessionId,
          reason,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapHandRaise(data);
    } catch (error) {
      console.error('Error raising hand:', error);
      return null;
    }
  }

  static async sendReaction(sessionId: string, reactionType: string): Promise<LiveReaction | null> {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('live_reactions')
        .insert({
          session_id: sessionId,
          reaction_type: reactionType,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapReaction(data);
    } catch (error) {
      console.error('Error sending reaction:', error);
      return null;
    }
  }

  static async createPoll(sessionId: string, question: string, options: string[], isMultipleChoice = false): Promise<LivePoll | null> {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('live_polls')
        .insert({
          session_id: sessionId,
          question,
          options,
          is_multiple_choice: isMultipleChoice,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapPoll(data);
    } catch (error) {
      console.error('Error creating poll:', error);
      return null;
    }
  }

  // Helper functions to map database response to our types
  private static mapQuestion(data: any): LiveQuestion {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      question: data.question,
      isPublic: data.is_public,
      isAnonymous: data.is_anonymous,
      isResolved: data.is_resolved,
      resolvedBy: data.resolved_by,
      resolvedAt: data.resolved_at,
      upvoteCount: data.upvote_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static mapChatMessage(data: any): ChatMessage {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      message: data.message,
      parentId: data.parent_id,
      isHighlighted: data.is_highlighted,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static mapHandRaise(data: any): HandRaise {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      reason: data.reason,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static mapReaction(data: any): LiveReaction {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      reactionType: data.reaction_type,
      timestamp: data.timestamp
    };
  }

  private static mapPoll(data: any): LivePoll {
    return {
      id: data.id,
      sessionId: data.session_id,
      createdBy: data.created_by,
      question: data.question,
      options: data.options,
      isActive: data.is_active,
      isMultipleChoice: data.is_multiple_choice,
      createdAt: data.created_at,
      closedAt: data.closed_at
    };
  }
}
