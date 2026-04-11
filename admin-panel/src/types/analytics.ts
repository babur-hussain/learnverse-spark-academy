
export interface PerformanceMetrics {
  testScores: number[];
  averageScore: number;
  completionRate: number;
  participationRate: number;
  timeSpent: number;
  strengthAreas: string[];
  weakAreas: string[];
}

export interface PerformanceAnomaly {
  id: string;
  userId: string;
  anomalyType: 'score_drop' | 'inactivity' | 'rapid_improvement';
  severity: number;
  description: string;
  detectedAt: string;
  isAddressed: boolean;
}

export interface StudentGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  goalType: 'test_score' | 'topic_completion' | 'consistency';
  startDate: string;
  targetDate: string;
  isAchieved: boolean;
}

export interface TeacherSuggestion {
  id: string;
  batchId: string;
  teacherId: string;
  suggestionType: string;
  content: string;
  priority: number;
  isImplemented: boolean;
}
