import { supabase } from '@/integrations/supabase/client';
import { LiveSession, UserCourseAccess } from '@/types/video';

export class LiveSessionService {
  /**
   * Get all upcoming live sessions
   */
  static async getUpcomingSessions() {
    const { data, error } = await supabase
      .from('live_sessions')
      .select(`
        *,
        courses:course_id (title, description),
        batches:batch_id (name, is_paid)
      `)
      .gte('scheduled_start_time', new Date().toISOString())
      .order('scheduled_start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  /**
   * Get recordings of past live sessions
   */
  static async getRecordings() {
    const { data, error } = await supabase
      .from('live_sessions')
      .select(`
        *,
        courses:course_id (title, description),
        batches:batch_id (name, is_paid)
      `)
      .not('recorded_url', 'is', null)
      .order('scheduled_start_time', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Get active live sessions (currently streaming)
   */
  static async getActiveSessions() {
    const { data, error } = await supabase
      .from('live_sessions')
      .select(`
        *,
        courses:course_id (title, description),
        batches:batch_id (name, is_paid)
      `)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  }

  /**
   * Create a new live session
   */
  static async createLiveSession(sessionData: Partial<LiveSession>) {
    // Ensure sessionData has all required fields for DB insert
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
      is_active: sessionData.isActive
    };
    
    const { data, error } = await supabase
      .from('live_sessions')
      .insert(dbSessionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Update a live session
   */
  static async updateLiveSession(id: string, sessionData: Partial<LiveSession>) {
    // Convert LiveSession object to DB column format
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
    
    const { data, error } = await supabase
      .from('live_sessions')
      .update(dbSessionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Start a live session
   */
  static async startLiveSession(id: string, streamUrl: string) {
    const { data, error } = await supabase
      .from('live_sessions')
      .update({
        is_active: true,
        status: 'live',
        actual_start_time: new Date().toISOString(),
        stream_url: streamUrl
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * End a live session
   */
  static async endLiveSession(id: string, recordedUrl?: string) {
    const { data, error } = await supabase
      .from('live_sessions')
      .update({
        is_active: false,
        status: 'ended',
        actual_end_time: new Date().toISOString(),
        recorded_url: recordedUrl
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Upload recording to storage
   */
  static async uploadRecording(file: File, courseId: string, sessionId: string) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${courseId}/${sessionId}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: publicUrl } = supabase.storage
      .from('recordings')
      .getPublicUrl(filePath);
    
    return publicUrl.publicUrl;
  }

  /**
   * Get user access for a batch
   */
  static async getUserBatchAccess(userId: string, batchId: string): Promise<UserCourseAccess | null> {
    const { data, error } = await supabase
      .from('user_batches')
      .select('*')
      .eq('user_id', userId)
      .eq('batch_id', batchId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null;
      }
      throw error;
    }
    
    return {
      userId: data.user_id,
      batchId: data.batch_id,
      courseId: '', // Will be filled from the session data
      hasPurchased: data.has_purchased,
      hasSubscription: data.has_subscription,
      enrollmentDate: data.enrollment_date,
      accessExpiryDate: data.access_expiry_date,
      gracePeriodEndDate: data.grace_period_end_date
    };
  }
}
