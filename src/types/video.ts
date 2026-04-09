export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in seconds
  courseId: string;
  batchId: string;
  prerequisites?: string[];
  accessLevel: 'free' | 'paid' | 'subscription';
  createdAt: string;
  isLiveRecording?: boolean;
  isLocked?: boolean;
  liveSessionId?: string; // Reference to a live session if this is a recording
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorId: string;
  subscriptionRequired: boolean;
}

export interface Batch {
  id: string;
  name: string;
  isPaid: boolean;
  startDate: string;
  endDate: string;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  courseId: string;
  batchId: string;
  instructorId?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status?: 'scheduled' | 'live' | 'ended';
  streamUrl?: string;
  recordedUrl?: string;
  chatEnabled?: boolean;
  isActive: boolean;
  accessLevel: 'free' | 'paid' | 'subscription';
  isLocked?: boolean;
}

export interface UserCourseAccess {
  userId: string;
  courseId: string;
  batchId: string;
  hasPurchased: boolean;
  hasSubscription: boolean;
  enrollmentDate?: string;
  accessExpiryDate?: string;
  gracePeriodEndDate?: string;
}

export interface AccessControlService {
  canAccessVideo: (video: Video, user: UserCourseAccess) => boolean;
  canAccessLiveSession: (session: LiveSession, user: UserCourseAccess) => boolean;
  getLockedStatus: (content: Video | LiveSession, user: UserCourseAccess) => boolean;
}

// Extend LiveStreamProvider interface to include more OBS-specific methods
export interface LiveStreamProvider {
  createStream: (sessionTitle: string) => Promise<{ streamUrl: string, streamKey: string }>;
  endStream: (streamKey: string) => Promise<void>;
  getViewerUrl: (streamUrl: string) => string;
  getOBSInstructions: (streamUrl: string, streamKey: string) => {
    server: string;
    key: string;
    settings: {
      videoBitrate: string;
      audioBitrate: string;
      resolution: string;
      fps: string;
    };
  };
}

// Streaming software settings type
export interface StreamingSettings {
  server: string;
  streamKey: string;
  videoBitrate: string;
  audioBitrate: string;
  resolution: string;
  fps: string;
}
