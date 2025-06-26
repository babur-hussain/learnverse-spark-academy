
export interface LearningStyle {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

export interface SkillLevel {
  id: string;
  user_id: string;
  subject_id: string;
  chapter_id: string;
  topic_id?: string;
  level: number;
  confidence: number;
}

export interface LearningPath {
  id: string;
  user_id: string;
  is_active: boolean;
  current_phase: number;
  total_phases: number;
  goals: string[];
  created_at: string;
  updated_at: string;
}

export interface LearningPathResource {
  id: string;
  learning_path_id: string;
  resource_type: 'video' | 'note' | 'test';
  resource_id: string;
  title: string;
  description?: string;
  priority: number;
  order_index: number;
  completed: boolean;
}

export interface LearningProfile {
  id: string;
  user_id: string;
  learning_style: LearningStyle;
  pace_preference: 'slow' | 'moderate' | 'fast';
  last_diagnostic_date: string | null;
  selected_goals: string[];
}
