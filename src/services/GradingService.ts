
import apiClient from '@/integrations/api/client';

export interface GradingResult {
  score: number;
  feedback: string;
  keyPointsCovered: string[];
  missingPoints: string[];
}

export class GradingService {
  static async gradeAnswer(
    studentAnswer: string,
    correctAnswer: string,
    strictnessLevel: number,
    maxScore: number
  ): Promise<GradingResult> {
    try {
      const { data } = await apiClient.post('/api/grading/grade-answer', {
        studentAnswer,
        correctAnswer,
        strictnessLevel,
        maxScore,
      });
      return data as GradingResult;
    } catch (error) {
      console.error('Error grading answer:', error);
      throw error;
    }
  }

  static async evaluateTestSubmission(submissionId: string): Promise<void> {
    try {
      await apiClient.post(`/api/grading/evaluate/${submissionId}`);
    } catch (error) {
      console.error('Error evaluating test submission:', error);
      throw error;
    }
  }

  static async updateSubmissionStatus(submissionId: string): Promise<void> {
    try {
      await apiClient.put(`/api/grading/submission-status/${submissionId}`);
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  }

  static async manuallyGradeAnswer(
    answerId: string,
    score: number,
    feedback?: string
  ): Promise<void> {
    try {
      await apiClient.post(`/api/grading/manual-grade/${answerId}`, {
        score,
        feedback,
      });
    } catch (error) {
      console.error('Error manually grading answer:', error);
      throw error;
    }
  }
}
