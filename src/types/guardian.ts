
export interface Guardian {
  id: string;
  user_id: string;
  full_name: string;
  phone_number?: string;
  email: string;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  app: boolean;
  email: boolean;
  sms: boolean;
}

export interface StudentLink {
  id: string;
  guardian_id: string;
  student_id: string;
  relationship_type: string;
  is_primary: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_code?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
}

export interface GuardianAlert {
  id: string;
  guardian_id: string;
  student_id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  read_at?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface GuardianReport {
  id: string;
  guardian_id: string;
  student_id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  report_data: any;
  pdf_url?: string;
  created_at: string;
  shared_at?: string;
}

export interface ParentTeacherMessage {
  id: string;
  guardian_id: string;
  teacher_id: string;
  student_id: string;
  message: string;
  attachments: any[];
  read_at?: string;
  created_at: string;
  teacher?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ParentTeacherMeeting {
  id: string;
  guardian_id: string;
  teacher_id: string;
  student_id: string;
  meeting_date: string;
  duration_minutes: number;
  meeting_type: string;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface StudentPerformanceSummary {
  attendance_rate: number;
  recent_test_scores: {
    test_id: string;
    test_name: string;
    score: number;
    max_score: number;
    date: string;
  }[];
  participation_metrics: {
    live_class_participation: number;
    questions_asked: number;
    assignments_completed: number;
  };
  upcoming_events: {
    id: string;
    title: string;
    type: string;
    date: string;
  }[];
}

export interface VerificationRequest {
  guardian_id: string;
  student_id: string;
  relationship_type: string;
  verification_code: string;
}
