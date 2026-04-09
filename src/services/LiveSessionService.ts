import apiClient from '@/integrations/api/client';
import { LiveSession, UserCourseAccess } from '@/types/video';
import { uploadFileToS3 } from '@/integrations/s3/upload';

export class LiveSessionService {
  /**
   * Get all upcoming live sessions
   */
  static async getUpcomingSessions() {
    const { data } = await apiClient.get('/api/live-sessions/upcoming');
    return data;
  }

  /**
   * Get recordings of past live sessions
   */
  static async getRecordings() {
    const { data } = await apiClient.get('/api/live-sessions/recordings');
    return data;
  }

  /**
   * Get active live sessions (currently streaming)
   */
  static async getActiveSessions() {
    const { data } = await apiClient.get('/api/live-sessions/active');
    return data;
  }

  /**
   * Create a new live session
   */
  static async createLiveSession(sessionData: Partial<LiveSession>) {
    const dbSessionData = {
      title: sessionData.title || '',
      description: sessionData.description,
      course_id: sessionData.courseId,
      batch_id: sessionData.batchId,
      instructor_id: sessionData.instructorId,
      scheduled_start_time: sessionData.scheduledStartTime,
      scheduled_end_time: sessionData.scheduledEndTime,
      status: sessionData.status,
      access_level: sessionData.accessLevel,
      chat_enabled: sessionData.chatEnabled,
      is_active: sessionData.isActive,
    };

    const { data } = await apiClient.post('/api/live-sessions', dbSessionData);
    return data;
  }

  /**
   * Update a live session
   */
  static async updateLiveSession(id: string, sessionData: Partial<LiveSession>) {
    const dbSessionData: Record<string, any> = {};

    if (sessionData.title !== undefined) dbSessionData.title = sessionData.title;
    if (sessionData.description !== undefined) dbSessionData.description = sessionData.description;
    if (sessionData.courseId !== undefined) dbSessionData.course_id = sessionData.courseId;
    if (sessionData.batchId !== undefined) dbSessionData.batch_id = sessionData.batchId;
    if (sessionData.instructorId !== undefined) dbSessionData.instructor_id = sessionData.instructorId;
    if (sessionData.scheduledStartTime !== undefined) dbSessionData.scheduled_start_time = sessionData.scheduledStartTime;
    if (sessionData.scheduledEndTime !== undefined) dbSessionData.scheduled_end_time = sessionData.scheduledEndTime;
    if (sessionData.actualStartTime !== undefined) dbSessionData.actual_start_time = sessionData.actualStartTime;
    if (sessionData.actualEndTime !== undefined) dbSessionData.actual_end_time = sessionData.actualEndTime;
    if (sessionData.status !== undefined) dbSessionData.status = sessionData.status;
    if (sessionData.streamUrl !== undefined) dbSessionData.stream_url = sessionData.streamUrl;
    if (sessionData.recordedUrl !== undefined) dbSessionData.recorded_url = sessionData.recordedUrl;
    if (sessionData.chatEnabled !== undefined) dbSessionData.chat_enabled = sessionData.chatEnabled;
    if (sessionData.isActive !== undefined) dbSessionData.is_active = sessionData.isActive;
    if (sessionData.accessLevel !== undefined) dbSessionData.access_level = sessionData.accessLevel;

    const { data } = await apiClient.put(`/api/live-sessions/${id}`, dbSessionData);
    return data;
  }

  /**
   * Start a live session
   */
  static async startLiveSession(id: string, streamUrl: string) {
    const { data } = await apiClient.post(`/api/live-sessions/${id}/start`, {
      stream_url: streamUrl,
    });
    return data;
  }

  /**
   * End a live session
   */
  static async endLiveSession(id: string, recordedUrl?: string) {
    const { data } = await apiClient.post(`/api/live-sessions/${id}/end`, {
      recorded_url: recordedUrl,
    });
    return data;
  }

  /**
   * Upload recording to S3
   */
  static async uploadRecording(file: File, courseId: string, sessionId: string) {
    const result = await uploadFileToS3(file, `recordings/${courseId}`);
    return result.url;
  }

  /**
   * Get user access for a batch
   */
  static async getUserBatchAccess(userId: string, batchId: string): Promise<UserCourseAccess | null> {
    try {
      const { data } = await apiClient.get(`/api/live-sessions/batch-access/${batchId}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
