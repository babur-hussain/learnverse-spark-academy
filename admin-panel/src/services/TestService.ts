
import apiClient from '@/integrations/api/client';
import { GradingService } from './GradingService';

export interface Test {
  id: string;
  title: string;
  description: string;
  type: 'mock' | 'live';
  duration_minutes: number;
  scheduled_at: string | null;
  created_by: string;
  level_of_strictness: number;
  is_published: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  options?: { [key: string]: string }; // For MCQs: {A: "Option text", B: "Option text"}
  correct_answer: string;
  type: 'mcq' | 'short' | 'long';
  marks: number;
  negative_marks: number;
  created_at: string;
}

export interface TestSubmission {
  id: string;
  test_id: string;
  student_id: string;
  submitted_at: string;
  total_score: number | null;
  evaluated: boolean;
}

export interface Answer {
  id: string;
  submission_id: string;
  question_id: string;
  answer_text: string | null;
  is_correct: boolean | null;
  score: number | null;
  feedback?: string;
  evaluated_by: 'auto' | 'ai' | 'manual' | null;
  evaluated_at: string | null;
  key_points_covered?: string[];
  missing_points?: string[];
}

export class TestService {
  // Test management functions
  static async createTest(test: Omit<Test, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data } = await apiClient.post('/api/tests', test);
      return data.id;
    } catch (error) {
      console.error('Error creating test:', error);
      throw error;
    }
  }

  static async updateTest(id: string, test: Partial<Test>): Promise<void> {
    try {
      await apiClient.put(`/api/tests/${id}`, test);
    } catch (error) {
      console.error('Error updating test:', error);
      throw error;
    }
  }

  static async getTest(id: string): Promise<Test> {
    try {
      const { data } = await apiClient.get(`/api/tests/${id}`);
      return data as Test;
    } catch (error) {
      console.error('Error getting test:', error);
      throw error;
    }
  }

  static async getTests(type?: 'mock' | 'live', createdBy?: string, isPublished?: boolean): Promise<Test[]> {
    try {
      const params: Record<string, string> = {};
      if (type) params.type = type;
      if (createdBy) params.created_by = createdBy;
      if (isPublished !== undefined) params.is_published = String(isPublished);

      const { data } = await apiClient.get('/api/tests', { params });
      return data as Test[];
    } catch (error) {
      console.error('Error getting tests:', error);
      throw error;
    }
  }

  static async deleteTest(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/tests/${id}`);
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  }

  // Question management functions
  static async addQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data } = await apiClient.post('/api/tests/questions', question);
      return data.id;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  static async updateQuestion(id: string, question: Partial<Question>): Promise<void> {
    try {
      await apiClient.put(`/api/tests/questions/${id}`, question);
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  static async getQuestions(testId: string): Promise<Question[]> {
    try {
      const { data } = await apiClient.get(`/api/tests/${testId}/questions`);
      return data as Question[];
    } catch (error) {
      console.error('Error getting questions:', error);
      throw error;
    }
  }

  static async deleteQuestion(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/tests/questions/${id}`);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Test submission functions
  static async createSubmission(testId: string, studentId: string): Promise<string> {
    try {
      const { data } = await apiClient.post('/api/tests/submissions', {
        test_id: testId,
        student_id: studentId,
      });
      return data.id;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  static async submitAnswers(submissionId: string, answers: Array<{ question_id: string, answer_text: string }>): Promise<void> {
    try {
      await apiClient.post(`/api/tests/submissions/${submissionId}/answers`, { answers });

      // Trigger evaluation
      await GradingService.evaluateTestSubmission(submissionId);
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    }
  }

  static async getSubmission(id: string): Promise<TestSubmission> {
    try {
      const { data } = await apiClient.get(`/api/tests/submissions/${id}`);
      return data as TestSubmission;
    } catch (error) {
      console.error('Error getting submission:', error);
      throw error;
    }
  }

  static async getSubmissions(testId: string, studentId?: string): Promise<TestSubmission[]> {
    try {
      const params: Record<string, string> = {};
      if (studentId) params.student_id = studentId;

      const { data } = await apiClient.get(`/api/tests/${testId}/submissions`, { params });
      return data as TestSubmission[];
    } catch (error) {
      console.error('Error getting submissions:', error);
      throw error;
    }
  }

  static async getSubmissionAnswers(submissionId: string): Promise<Answer[]> {
    try {
      const { data } = await apiClient.get(`/api/tests/submissions/${submissionId}/answers`);
      return data as Answer[];
    } catch (error) {
      console.error('Error getting submission answers:', error);
      throw error;
    }
  }

  static async getStudentPerformanceSummary(studentId: string): Promise<any> {
    try {
      const { data } = await apiClient.get(`/api/tests/performance/${studentId}`);
      return data;
    } catch (error) {
      console.error('Error getting student performance summary:', error);
      throw error;
    }
  }
}
