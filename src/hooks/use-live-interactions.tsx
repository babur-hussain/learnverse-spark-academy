
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { 
  LiveQuestion, 
  ChatMessage, 
  HandRaise, 
  LiveReaction,
  LivePoll 
} from '@/types/live-interaction';
import { LiveInteractionService } from '@/services/LiveInteractionService';

export function useLiveInteractions(sessionId: string) {
  const [questions, setQuestions] = useState<LiveQuestion[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [handRaises, setHandRaises] = useState<HandRaise[]>([]);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [polls, setPolls] = useState<LivePoll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const channels = [
      supabase
        .channel('live_questions')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'live_questions',
          filter: `session_id=eq.${sessionId}`
        }, (payload) => {
          // Update questions list based on the change
          if (payload.eventType === 'INSERT') {
            setQuestions(prev => [...prev, LiveInteractionService['mapQuestion'](payload.new)]);
          }
          // Handle other event types...
        })
        .subscribe(),

      supabase
        .channel('live_chat')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${sessionId}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setChatMessages(prev => [...prev, LiveInteractionService['mapChatMessage'](payload.new)]);
          }
        })
        .subscribe(),

      // Add similar channels for other features...
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [sessionId]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load questions
        const { data: questionsData } = await supabase
          .from('live_questions')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false });

        if (questionsData) {
          setQuestions(questionsData.map(q => LiveInteractionService['mapQuestion'](q)));
        }

        // Load chat messages
        const { data: chatData } = await supabase
          .from('live_chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (chatData) {
          setChatMessages(chatData.map(m => LiveInteractionService['mapChatMessage'](m)));
        }

        // Load other data similarly...

      } catch (error) {
        console.error('Error loading live session data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [sessionId]);

  return {
    questions,
    chatMessages,
    handRaises,
    reactions,
    polls,
    loading,
    services: {
      submitQuestion: (question: string, isPublic = true, isAnonymous = false) => 
        LiveInteractionService.submitQuestion(sessionId, question, isPublic, isAnonymous),
      sendChatMessage: (message: string, parentId?: string) => 
        LiveInteractionService.sendChatMessage(sessionId, message, parentId),
      raiseHand: (reason?: string) => 
        LiveInteractionService.raiseHand(sessionId, reason),
      sendReaction: (reactionType: string) => 
        LiveInteractionService.sendReaction(sessionId, reactionType),
      createPoll: (question: string, options: string[], isMultipleChoice = false) =>
        LiveInteractionService.createPoll(sessionId, question, options, isMultipleChoice)
    }
  };
}
