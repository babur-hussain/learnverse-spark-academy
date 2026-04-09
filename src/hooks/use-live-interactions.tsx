
import { useState, useEffect } from 'react';
import apiClient from '@/integrations/api/client';
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
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/api/live-sessions/${sessionId}/interactions`);

        if (data.questions) {
          setQuestions(data.questions);
        }
        if (data.chatMessages) {
          setChatMessages(data.chatMessages);
        }
        if (data.handRaises) {
          setHandRaises(data.handRaises);
        }
        if (data.reactions) {
          setReactions(data.reactions);
        }
        if (data.polls) {
          setPolls(data.polls);
        }
      } catch (error) {
        console.error('Error loading live session data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Poll for updates every 5 seconds (replaces Supabase realtime subscriptions)
    const interval = setInterval(loadInitialData, 5000);

    return () => {
      clearInterval(interval);
    };
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
