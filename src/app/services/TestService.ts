
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('tests')
        .insert(test)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating test:', error);
      throw error;
    }
  }

  static async updateTest(id: string, test: Partial<Test>): Promise<void> {
    try {
      const { error } = await supabase
        .from('tests')
        .update(test)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating test:', error);
      throw error;
    }
  }

  static async getTest(id: string): Promise<Test> {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Test;
    } catch (error) {
      console.error('Error getting test:', error);
      throw error;
    }
  }

  static async getTests(type?: 'mock' | 'live', createdBy?: string, isPublished?: boolean): Promise<Test[]> {
    try {
      let query = supabase
        .from('tests')
        .select('*');

      if (type) {
        query = query.eq('type', type);
      }

      if (createdBy) {
        query = query.eq('created_by', createdBy);
      }

      if (isPublished !== undefined) {
        query = query.eq('is_published', isPublished);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Test[];
    } catch (error) {
      console.error('Error getting tests:', error);
      throw error;
    }
  }

  static async deleteTest(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  }

  // Question management functions
  static async addQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert(question)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  static async updateQuestion(id: string, question: Partial<Question>): Promise<void> {
    try {
      const { error } = await supabase
        .from('questions')
        .update(question)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  static async getQuestions(testId: string): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId);

      if (error) throw error;
      return data as Question[];
    } catch (error) {
      console.error('Error getting questions:', error);
      throw error;
    }
  }

  static async deleteQuestion(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Test submission functions
  static async createSubmission(testId: string, studentId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('student_test_submissions')
        .insert({
          test_id: testId,
          student_id: studentId,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  static async submitAnswers(submissionId: string, answers: Array<{ question_id: string, answer_text: string }>): Promise<void> {
    try {
      // Format the answers for bulk insert
      const formattedAnswers = answers.map(answer => ({
        submission_id: submissionId,
        question_id: answer.question_id,
        answer_text: answer.answer_text
      }));

      // Insert all answers
      const { error } = await supabase
        .from('answers')
        .insert(formattedAnswers);

      if (error) throw error;

      // Trigger evaluation
      await GradingService.evaluateTestSubmission(submissionId);
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    }
  }

  static async getSubmission(id: string): Promise<TestSubmission> {
    try {
      const { data, error } = await supabase
        .from('student_test_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as TestSubmission;
    } catch (error) {
      console.error('Error getting submission:', error);
      throw error;
    }
  }

  static async getSubmissions(testId: string, studentId?: string): Promise<TestSubmission[]> {
    try {
      let query = supabase
        .from('student_test_submissions')
        .select('*')
        .eq('test_id', testId);

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TestSubmission[];
    } catch (error) {
      console.error('Error getting submissions:', error);
      throw error;
    }
  }

  static async getSubmissionAnswers(submissionId: string): Promise<Answer[]> {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          questions (id, question_text, type, marks, negative_marks, options, correct_answer)
        `)
        .eq('submission_id', submissionId);

      if (error) throw error;
      return data as unknown as Answer[];
    } catch (error) {
      console.error('Error getting submission answers:', error);
      throw error;
    }
  }

  static async getStudentPerformanceSummary(studentId: string): Promise<any> {
    try {
      // Get all submissions for the student
      const { data: submissions, error: submissionsError } = await supabase
        .from('student_test_submissions')
        .select(`
          id,
          total_score,
          evaluated,
          tests (id, title, type)
        `)
        .eq('student_id', studentId);

      if (submissionsError) throw submissionsError;

      // Calculate overall performance
      const totalTests = submissions?.length || 0;
      const completedTests = submissions?.filter(sub => sub.evaluated)?.length || 0;
      let totalScore = 0;
      let highestScore = 0;
      let lowestScore = Infinity;

      submissions?.forEach(sub => {
        if (sub.total_score !== null) {
          totalScore += sub.total_score;
          highestScore = Math.max(highestScore, sub.total_score);
          lowestScore = Math.min(lowestScore, sub.total_score);
        }
      });

      return {
        totalTests,
        completedTests,
        averageScore: completedTests > 0 ? totalScore / completedTests : 0,
        highestScore: highestScore || 0,
        lowestScore: lowestScore === Infinity ? 0 : lowestScore,
        submissions
      };
    } catch (error) {
      console.error('Error getting student performance summary:', error);
      throw error;
    }
  }
}
