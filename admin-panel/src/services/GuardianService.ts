
import apiClient from '@/integrations/api/client';
import type {
  GuardianProfile,
  StudentLink,
  ActivityReport,
  NotificationPreferences,
} from '@/types/guardian';

export class GuardianService {
  // Guardian Profile
  static async getGuardianProfile(userId: string): Promise<GuardianProfile | null> {
    try {
      const { data } = await apiClient.get('/api/guardian/profile');
      return data;
    } catch (error) {
      console.error('Error fetching guardian profile:', error);
      return null;
    }
  }

  static async createGuardianProfile(profileData: Partial<GuardianProfile>): Promise<GuardianProfile | null> {
    try {
      const { data } = await apiClient.post('/api/guardian/profile', profileData);
      return data;
    } catch (error) {
      console.error('Error creating guardian profile:', error);
      return null;
    }
  }

  static async updateGuardianProfile(id: string, profileData: Partial<GuardianProfile>): Promise<GuardianProfile | null> {
    try {
      const { data } = await apiClient.put(`/api/guardian/profile/${id}`, profileData);
      return data;
    } catch (error) {
      console.error('Error updating guardian profile:', error);
      return null;
    }
  }

  // Student Links
  static async linkStudent(studentEmail: string, relationship: string): Promise<StudentLink | null> {
    try {
      const { data } = await apiClient.post('/api/guardian/link-student', {
        student_email: studentEmail,
        relationship,
      });
      return data;
    } catch (error) {
      console.error('Error linking student:', error);
      return null;
    }
  }

  static async getLinkedStudents(): Promise<StudentLink[]> {
    try {
      const { data } = await apiClient.get('/api/guardian/linked-students');
      return data || [];
    } catch (error) {
      console.error('Error fetching linked students:', error);
      return [];
    }
  }

  static async unlinkStudent(linkId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/guardian/link-student/${linkId}`);
      return true;
    } catch (error) {
      console.error('Error unlinking student:', error);
      return false;
    }
  }

  // Activity Reports
  static async getStudentActivity(studentId: string, dateRange?: { from: string; to: string }): Promise<ActivityReport[]> {
    try {
      const { data } = await apiClient.get(`/api/guardian/student-activity/${studentId}`, {
        params: dateRange,
      });
      return data || [];
    } catch (error) {
      console.error('Error fetching student activity:', error);
      return [];
    }
  }

  static async getStudentPerformance(studentId: string): Promise<any> {
    try {
      const { data } = await apiClient.get(`/api/guardian/student-performance/${studentId}`);
      return data;
    } catch (error) {
      console.error('Error fetching student performance:', error);
      return null;
    }
  }

  // Notifications
  static async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const { data } = await apiClient.get('/api/guardian/notification-preferences');
      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  static async updateNotificationPreferences(prefs: NotificationPreferences): Promise<boolean> {
    try {
      await apiClient.put('/api/guardian/notification-preferences', prefs);
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // Verification
  static async verifyGuardianStudentLink(verificationCode: string): Promise<boolean> {
    try {
      await apiClient.post('/api/guardian/verify-link', {
        verification_code: verificationCode,
      });
      return true;
    } catch (error) {
      console.error('Error verifying guardian-student link:', error);
      return false;
    }
  }
}
