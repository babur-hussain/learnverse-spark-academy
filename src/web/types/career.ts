
export interface CareerProfile {
  id: string;
  user_id: string;
  personality_type: string;
  primary_strengths: string[];
  secondary_strengths: string[];
  areas_for_improvement: string[];
  learning_style: string;
  work_environment_preference: string;
  career_interests: string[];
  skill_summary: {
    technical: SkillLevel[];
    soft: SkillLevel[];
  };
  created_at: string;
  updated_at: string;
}

export interface SkillLevel {
  skill: string;
  level: number; // 1-10
}

export interface CareerMatch {
  id?: string;
  career: string;
  compatibility_score: number;
  reasoning: string;
  key_skills_aligned: string[];
  potential_challenges: string[];
  education_requirements: string[];
  growth_opportunities: string;
  user_id?: string;
  profile_id?: string;
  created_at?: string;
}

export interface CareerRoadmap {
  id?: string;
  user_id?: string;
  career_match_id?: string;
  career: string;
  overview: string;
  timeframe: string;
  milestones: Milestone[];
  skills_to_acquire: SkillToAcquire[];
  exams_certifications: ExamCertification[];
  project_ideas: ProjectIdea[];
  weekly_plan: WeeklyPlan;
  created_at?: string;
  updated_at?: string;
}

export interface Milestone {
  id?: string;
  roadmap_id?: string;
  title: string;
  description: string;
  timeline: string;
  required_skills: string[];
  activities: string[];
  resources: string[];
  is_completed?: boolean;
  completed_at?: string;
}

export interface SkillToAcquire {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  suggested_resources: string[];
  is_acquired?: boolean;
}

export interface ExamCertification {
  name: string;
  description: string;
  timeline: string;
  preparation_tips: string[];
  is_completed?: boolean;
}

export interface ProjectIdea {
  title: string;
  description: string;
  skills: string[];
  is_completed?: boolean;
}

export interface WeeklyPlan {
  focus: string;
  activities: string[];
}

export interface CourseRecommendation {
  id?: string;
  user_id?: string;
  roadmap_id?: string;
  recommended_courses: RecommendedResource[];
  recommended_tests: RecommendedResource[];
  recommended_sessions: RecommendedResource[];
  suggested_learning_path: string;
  created_at?: string;
}

export interface RecommendedResource {
  id?: string;
  name: string;
  relevance: string;
  aligned_milestone?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface ProgressUpdate {
  id?: string;
  user_id?: string;
  roadmap_id?: string;
  progress_summary: string;
  achievement_level: string;
  strengths: string[];
  areas_for_improvement: string[];
  adjusted_milestones: AdjustedMilestone[];
  feedback: string;
  motivation: string;
  next_steps: string[];
  created_at?: string;
}

export interface AdjustedMilestone {
  milestone_id: string;
  adjusted_timeline: string;
  adjustment_reason: string;
}

export interface ChatMessage {
  id?: string;
  user_id?: string;
  is_user: boolean;
  message: string;
  timestamp?: string;
}
