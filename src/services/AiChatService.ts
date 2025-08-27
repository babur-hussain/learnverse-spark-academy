import { supabase } from '@/integrations/supabase/client';

export interface AiChatSessionRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface AiChatMessageRow {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const AiChatService = {
  async createSession(userId: string, title: string): Promise<AiChatSessionRow | null> {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert({ user_id: userId, title })
      .select('*')
      .single();

    if (error) {
      console.error('createSession error:', error);
      return null;
    }
    return data as unknown as AiChatSessionRow;
  },

  async listSessions(userId: string, limit = 50): Promise<AiChatSessionRow[]> {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('listSessions error:', error);
      return [];
    }
    return (data || []) as unknown as AiChatSessionRow[];
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('ai_chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('deleteSession error:', error);
      return false;
    }
    return true;
  },

  async listMessages(sessionId: string): Promise<AiChatMessageRow[]> {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('listMessages error:', error);
      return [];
    }
    return (data || []) as unknown as AiChatMessageRow[];
  },

  async saveMessage(params: { sessionId: string; userId: string; role: 'user' | 'assistant' | 'system'; content: string; }): Promise<AiChatMessageRow | null> {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: params.sessionId,
        user_id: params.userId,
        role: params.role,
        content: params.content,
      })
      .select('*')
      .single();

    if (error) {
      console.error('saveMessage error:', error);
      return null;
    }

    // Touch session updated_at
    await supabase
      .from('ai_chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.sessionId);

    return data as unknown as AiChatMessageRow;
  },
};


