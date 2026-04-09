
export type ForumCategoryType = 'course' | 'subject' | 'topic' | 'batch' | 'general';
export type ThreadType = 'discussion' | 'question' | 'poll';
export type ThreadStatus = 'open' | 'resolved' | 'closed';
export type VoteType = 'upvote' | 'downvote' | 'helpful';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';
export type RestrictionType = 'mute' | 'warn' | 'ban';

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  type: ForumCategoryType;
  referenceId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ForumThread {
  id: string;
  title: string;
  categoryId: string;
  userId: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  threadType: ThreadType;
  status: ThreadStatus;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  
  // Used for display, not stored in DB
  category?: ForumCategory;
  user?: {
    id: string;
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  voteCount?: number;
  replyCount?: number;
  poll?: ForumPoll;
}

export interface ForumPost {
  id: string;
  threadId: string;
  userId: string;
  content: string;
  isAccepted: boolean;
  parentId?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Used for display, not stored in DB
  user?: {
    id: string;
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  votes?: {
    upvotes: number;
    downvotes: number;
    helpfulCount: number;
    userVote?: VoteType;
  };
  replies?: ForumPost[];
  attachments?: ForumAttachment[];
}

export interface ForumVote {
  id: string;
  userId: string;
  threadId?: string;
  postId?: string;
  voteType: VoteType;
  createdAt: string;
}

export interface ForumPoll {
  id: string;
  threadId: string;
  question: string;
  options: Array<{ text: string; votes?: number }>;
  allowMultiple: boolean;
  closesAt?: string;
  createdAt: string;
  userVotes?: number[];
}

export interface ForumPollVote {
  id: string;
  pollId: string;
  userId: string;
  optionIndex: number;
  createdAt: string;
}

export interface ForumBookmark {
  id: string;
  userId: string;
  threadId: string;
  createdAt: string;
}

export interface ForumSubscription {
  id: string;
  userId: string;
  threadId?: string;
  categoryId?: string;
  tag?: string;
  createdAt: string;
}

export interface ForumAttachment {
  id: string;
  threadId?: string;
  postId?: string;
  userId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
  
  // Helper fields
  url?: string;
}

export interface ForumReport {
  id: string;
  reporterId: string;
  threadId?: string;
  postId?: string;
  reason: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ForumUserMetrics {
  id: string;
  userId: string;
  threadsCreated: number;
  postsCreated: number;
  helpfulCount: number;
  acceptedCount: number;
  upvotesReceived: number;
  downvotesReceived: number;
  reputationScore: number;
  lastActive?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ForumTag {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface ForumUserRestriction {
  id: string;
  userId: string;
  restrictionType: RestrictionType;
  reason?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface ForumFilter {
  categoryId?: string;
  threadType?: ThreadType;
  status?: ThreadStatus;
  tag?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'active';
}
