
export type QuestionStatus = 'pending' | 'resolved';
export type HandRaiseStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type ReactionType = 'like' | 'confused' | 'idea' | 'heart';

export interface LiveQuestion {
  id: string;
  sessionId: string;
  userId: string;
  question: string;
  isPublic: boolean;
  isAnonymous: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  parentId?: string;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HandRaise {
  id: string;
  sessionId: string;
  userId: string;
  reason?: string;
  status: HandRaiseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LiveReaction {
  id: string;
  sessionId: string;
  userId: string;
  reactionType: ReactionType;
  timestamp: string;
}

export interface LivePoll {
  id: string;
  sessionId: string;
  createdBy: string;
  question: string;
  options: string[];
  isActive: boolean;
  isMultipleChoice: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface PollResponse {
  id: string;
  pollId: string;
  userId: string;
  selectedOptions: number[];
  createdAt: string;
}

export interface SessionEngagement {
  id: string;
  sessionId: string;
  userId: string;
  joinTime: string;
  leaveTime?: string;
  attentionData?: Record<string, any>;
  engagementScore?: number;
  questionsAsked: number;
  reactionsGiven: number;
  pollParticipations: number;
  quizParticipations: number;
}
