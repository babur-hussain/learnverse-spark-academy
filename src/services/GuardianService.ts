
import { supabase } from '@/lib/supabase';
import type { 
  Guardian, 
  StudentLink,
  GuardianAlert,
  GuardianReport,
  ParentTeacherMessage,
  ParentTeacherMeeting,
  StudentPerformanceSummary,
  VerificationRequest,
  NotificationPreferences 
} from '@/types/guardian';

// Type helper for converting database Json to NotificationPreferences
const asNotificationPreferences = (json: any): NotificationPreferences => {
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch (e) {
      // If parsing fails, return default
      return { app: true, email: true, sms: false };
    }
  }
  
  return {
    app: json?.app ?? true,
    email: json?.email ?? true,
    sms: json?.sms ?? false
  };
};

// Helper to convert NotificationPreferences to a JSON object for database storage
const toJsonObject = (preferences: NotificationPreferences): Record<string, boolean> => {
  return {
    app: preferences.app,
    email: preferences.email,
    sms: preferences.sms
  };
};

export class GuardianService {
  static async getGuardianProfile(): Promise<Guardian | null> {
    try {
      const userResponse = await supabase.auth.getUser();
      const userId = userResponse.data?.user?.id;
      
      if (!userId) return null;

      // Changed from .single() to .maybeSingle() to handle cases where no guardian exists
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching guardian profile:', error);
        return null;
      }
      
      // If no data is found, return null
      if (!data) {
        return null;
      }
      
      // Ensure data conforms to Guardian type
      const guardian: Guardian = {
        id: data.id,
        user_id: data.user_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
        notification_preferences: asNotificationPreferences(data.notification_preferences),
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return guardian;
    } catch (error) {
      console.error('Error in getGuardianProfile:', error);
      return null;
    }
  }

  static async getLinkedStudents(): Promise<StudentLink[]> {
    try {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('guardian_student_links')
        .select(`
          *,
          student:student_id (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('guardian_id', userResponse.data.user.id);

      if (error) {
        console.error('Error fetching linked students:', error);
        return [];
      }

      // Transform data to match StudentLink type
      const studentLinks: StudentLink[] = data.map(link => ({
        id: link.id,
        guardian_id: link.guardian_id,
        student_id: link.student_id,
        relationship_type: link.relationship_type,
        is_primary: link.is_primary,
        verification_status: link.verification_status as "pending" | "verified" | "rejected",
        verification_code: link.verification_code,
        verified_by: link.verified_by,
        verified_at: link.verified_at,
        created_at: link.created_at,
        updated_at: link.updated_at,
        student: link.student
      }));

      return studentLinks;
    } catch (error) {
      console.error('Error in getLinkedStudents:', error);
      return [];
    }
  }

  static async getAlerts(studentId: string): Promise<GuardianAlert[]> {
    try {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('guardian_alerts')
        .select('*')
        .eq('student_id', studentId)
        .eq('guardian_id', userResponse.data.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }

      // Transform data to match GuardianAlert type
      const alerts: GuardianAlert[] = data.map(alert => ({
        id: alert.id,
        guardian_id: alert.guardian_id,
        student_id: alert.student_id,
        alert_type: alert.alert_type,
        severity: alert.severity as "info" | "warning" | "critical",
        title: alert.title,
        message: alert.message,
        read_at: alert.read_at,
        created_at: alert.created_at,
        metadata: typeof alert.metadata === 'object' ? alert.metadata : {}
      }));

      return alerts;
    } catch (error) {
      console.error('Error in getAlerts:', error);
      return [];
    }
  }

  static async markAlertAsRead(alertId: string): Promise<boolean> {
    try {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data?.user?.id) return false;

      const { error } = await supabase
        .from('guardian_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', alertId)
        .eq('guardian_id', userResponse.data.user.id);

      if (error) {
        console.error('Error marking alert as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAlertAsRead:', error);
      return false;
    }
  }

  static async getReports(studentId: string): Promise<GuardianReport[]> {
    try {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('guardian_reports')
        .select('*')
        .eq('student_id', studentId)
        .eq('guardian_id', userResponse.data.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return [];
      }

      return data as GuardianReport[];
    } catch (error) {
      console.error('Error in getReports:', error);
      return [];
    }
  }

  static async getMessages(studentId: string, teacherId?: string): Promise<ParentTeacherMessage[]> {
    try {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data?.user?.id) return [];
      
      let query = supabase
        .from('parent_teacher_messages')
        .select(`
          *,
          teacher:teacher_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('student_id', studentId)
        .eq('guardian_id', userResponse.data.user.id)
        .order('created_at', { ascending: false });

      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Transform data to match ParentTeacherMessage type
      const messages: ParentTeacherMessage[] = data.map(msg => {
        // Handle attachments separately to ensure it's an array
        let attachments: any[] = [];
        if (msg.attachments) {
          attachments = Array.isArray(msg.attachments) ? msg.attachments : 
                      typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : [];
        }
        
        // Safely handle teacher data with proper type checking
        let teacher: ParentTeacherMessage['teacher'] = undefined;
        
        if (msg.teacher && typeof msg.teacher === 'object' && msg.teacher !== null) {
          // Check if the expected properties exist on the teacher object
          const teacherObj = msg.teacher as { id?: string; full_name?: string; avatar_url?: string };
          teacher = {
            id: teacherObj.id || '',
            full_name: teacherObj.full_name || '',
            avatar_url: teacherObj.avatar_url
          };
        }

        return {
          id: msg.id,
          guardian_id: msg.guardian_id,
          teacher_id: msg.teacher_id,
          student_id: msg.student_id,
          message: msg.message,
          attachments: attachments,
          read_at: msg.read_at,
          created_at: msg.created_at,
          teacher: teacher
        };
      });

      return messages;
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }

  static async sendMessage(message: Omit<ParentTeacherMessage, 'id' | 'created_at'>): Promise<ParentTeacherMessage | null> {
    try {
      // Convert message attachments to JSON compatible format
      const dbMessage = {
        ...message,
        attachments: JSON.stringify(message.attachments || [])
      };
      
      const { data, error } = await supabase
        .from('parent_teacher_messages')
        .insert([dbMessage])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      // Transform the response to match ParentTeacherMessage type
      const attachments = data.attachments ? 
                       (Array.isArray(data.attachments) ? data.attachments : 
                       typeof data.attachments === 'string' ? JSON.parse(data.attachments) : []) : 
                       [];
                       
      const sentMessage: ParentTeacherMessage = {
        id: data.id,
        guardian_id: data.guardian_id,
        teacher_id: data.teacher_id,
        student_id: data.student_id,
        message: data.message,
        attachments: attachments,
        read_at: data.read_at,
        created_at: data.created_at
      };

      return sentMessage;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  }

  static async getMeetings(studentId?: string): Promise<ParentTeacherMeeting[]> {
    try {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data?.user?.id) return [];
      
      let query = supabase
        .from('parent_teacher_meetings')
        .select(`
          *,
          teacher:teacher_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('guardian_id', userResponse.data.user.id)
        .order('meeting_date', { ascending: true });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching meetings:', error);
        return [];
      }

      // Transform data to match ParentTeacherMeeting type
      const meetings: ParentTeacherMeeting[] = data.map(meeting => {
        // Safely handle teacher data with proper type checking
        let teacher: ParentTeacherMeeting['teacher'] = undefined;
        
        if (meeting.teacher && typeof meeting.teacher === 'object' && meeting.teacher !== null) {
          // Check if the expected properties exist on the teacher object
          const teacherObj = meeting.teacher as { id?: string; full_name?: string; avatar_url?: string };
          teacher = {
            id: teacherObj.id || '',
            full_name: teacherObj.full_name || '',
            avatar_url: teacherObj.avatar_url
          };
        }
        
        return {
          id: meeting.id,
          guardian_id: meeting.guardian_id,
          teacher_id: meeting.teacher_id,
          student_id: meeting.student_id,
          meeting_date: meeting.meeting_date,
          duration_minutes: meeting.duration_minutes,
          meeting_type: meeting.meeting_type,
          meeting_link: meeting.meeting_link,
          status: meeting.status as "scheduled" | "completed" | "cancelled",
          notes: meeting.notes,
          created_at: meeting.created_at,
          updated_at: meeting.updated_at,
          teacher: teacher
        };
      });

      return meetings;
    } catch (error) {
      console.error('Error in getMeetings:', error);
      return [];
    }
  }

  static async bookMeeting(meeting: Omit<ParentTeacherMeeting, 'id' | 'created_at' | 'updated_at'>): Promise<ParentTeacherMeeting | null> {
    try {
      const { data, error } = await supabase
        .from('parent_teacher_meetings')
        .insert([meeting])
        .select()
        .single();

      if (error) {
        console.error('Error booking meeting:', error);
        return null;
      }

      // Transform the response to match ParentTeacherMeeting type
      const bookedMeeting: ParentTeacherMeeting = {
        id: data.id,
        guardian_id: data.guardian_id,
        teacher_id: data.teacher_id,
        student_id: data.student_id,
        meeting_date: data.meeting_date,
        duration_minutes: data.duration_minutes,
        meeting_type: data.meeting_type,
        meeting_link: data.meeting_link,
        status: data.status as "scheduled" | "completed" | "cancelled",
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return bookedMeeting;
    } catch (error) {
      console.error('Error in bookMeeting:', error);
      return null;
    }
  }

  static async cancelMeeting(meetingId: string): Promise<boolean> {
    try {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data?.user?.id) return false;

      const { error } = await supabase
        .from('parent_teacher_meetings')
        .update({ status: 'cancelled' })
        .eq('id', meetingId)
        .eq('guardian_id', userResponse.data.user.id);

      if (error) {
        console.error('Error cancelling meeting:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelMeeting:', error);
      return false;
    }
  }

  static async getStudentPerformanceSummary(studentId: string): Promise<StudentPerformanceSummary | null> {
    try {
      // In a real app, this would fetch from the API
      // Mock data for now
      const mockSummary: StudentPerformanceSummary = {
        attendance_rate: 0.92,
        recent_test_scores: [
          {
            test_id: '1',
            test_name: 'Calculus Mid-Term',
            score: 85,
            max_score: 100,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            test_id: '2',
            test_name: 'Physics Lab Assessment',
            score: 78,
            max_score: 100,
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            test_id: '3',
            test_name: 'Chemistry Quiz',
            score: 92,
            max_score: 100,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        participation_metrics: {
          live_class_participation: 80,
          questions_asked: 12,
          assignments_completed: 24,
        },
        upcoming_events: [
          {
            id: '1',
            title: 'Mathematics Quiz',
            type: 'test',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            title: 'Physics Lab Session',
            type: 'live_class',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };

      return mockSummary;
    } catch (error) {
      console.error('Error in getStudentPerformanceSummary:', error);
      return null;
    }
  }

  static async verifyStudentLink(request: VerificationRequest): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('verify_guardian_student_link', {
        p_verification_code: request.verification_code,
        p_guardian_id: request.guardian_id,
      });

      if (error) {
        console.error('Error verifying student link:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in verifyStudentLink:', error);
      return false;
    }
  }

  static async registerGuardian(guardianData: Omit<Guardian, 'id' | 'created_at' | 'updated_at'>): Promise<Guardian | null> {
    try {
      // Convert NotificationPreferences to a format compatible with Supabase
      const dbGuardianData = {
        user_id: guardianData.user_id,
        full_name: guardianData.full_name,
        phone_number: guardianData.phone_number,
        email: guardianData.email,
        notification_preferences: toJsonObject(guardianData.notification_preferences)
      };
      
      const { data, error } = await supabase
        .from('guardians')
        .insert(dbGuardianData)
        .select()
        .single();

      if (error) {
        console.error('Error registering guardian:', error);
        return null;
      }

      // Transform the response to match Guardian type
      const guardian: Guardian = {
        id: data.id,
        user_id: data.user_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
        notification_preferences: asNotificationPreferences(data.notification_preferences),
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return guardian;
    } catch (error) {
      console.error('Error in registerGuardian:', error);
      return null;
    }
  }

  static async linkStudent(linkData: Omit<StudentLink, 'id' | 'created_at' | 'updated_at' | 'verified_at' | 'verified_by'>): Promise<StudentLink | null> {
    try {
      // Ensure we have all required properties
      const completeData = {
        guardian_id: linkData.guardian_id,
        student_id: linkData.student_id,
        relationship_type: linkData.relationship_type,
        is_primary: linkData.is_primary || false,
        verification_status: linkData.verification_status || 'pending' as const,
        verification_code: linkData.verification_code
      };

      const { data, error } = await supabase
        .from('guardian_student_links')
        .insert([completeData])
        .select()
        .single();

      if (error) {
        console.error('Error linking student:', error);
        return null;
      }

      // Transform the response to match StudentLink type
      const studentLink: StudentLink = {
        id: data.id,
        guardian_id: data.guardian_id,
        student_id: data.student_id,
        relationship_type: data.relationship_type,
        is_primary: data.is_primary,
        verification_status: data.verification_status as "pending" | "verified" | "rejected",
        verification_code: data.verification_code,
        verified_by: data.verified_by,
        verified_at: data.verified_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return studentLink;
    } catch (error) {
      console.error('Error in linkStudent:', error);
      return null;
    }
  }
  
  // Method alias for backward compatibility
  static async createGuardianProfile(guardianData: Omit<Guardian, 'id' | 'created_at' | 'updated_at'>): Promise<Guardian | null> {
    return this.registerGuardian(guardianData);
  }
}
