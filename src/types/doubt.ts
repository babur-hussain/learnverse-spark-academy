
export type DoubtUrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';
export type DoubtStatus = 'pending' | 'ai_answered' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type DoubtSessionType = 'one_on_one' | 'group';
export type DoubtSessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type DoubtFileType = 'image' | 'audio' | 'document' | 'video';

export interface Doubt {
  id: string;
  userId: string;
  title: string;
  content: string;
  categoryId?: string;
  subject?: string;
  topic?: string;
  urgencyLevel: DoubtUrgencyLevel;
  status: DoubtStatus;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  viewedAt?: string;
  aiProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoubtAttachment {
  id: string;
  doubtId: string;
  fileType: DoubtFileType;
  filePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

export interface DoubtReply {
  id: string;
  doubtId: string;
  userId?: string;
  isAiResponse: boolean;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoubtRating {
  id: string;
  replyId: string;
  userId: string;
  rating: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoubtSession {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  sessionType: DoubtSessionType;
  maxStudents?: number;
  status: DoubtSessionStatus;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoubtCategory {
  id: string;
  name: string;
  parentId?: string;
  level: 'subject' | 'topic' | 'subtopic';
  createdAt: string;
  updatedAt: string;
}
