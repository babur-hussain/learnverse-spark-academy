
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase.functions.invoke('grade-answer', {
        body: {
          studentAnswer,
          correctAnswer,
          strictnessLevel,
          maxScore
        }
      });

      if (error) throw error;
      return data as GradingResult;
    } catch (error) {
      console.error('Error grading answer:', error);
      throw error;
    }
  }

  static async evaluateTestSubmission(submissionId: string): Promise<void> {
    try {
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select(`
          *,
          questions (
            type,
            correct_answer,
            marks
          )
        `)
        .eq('submission_id', submissionId)
        .is('score', null);

      if (answersError) throw answersError;

      for (const answer of answers || []) {
        if (answer.questions.type === 'mcq') {
          // Auto-grade MCQs
          const isCorrect = answer.answer_text === answer.questions.correct_answer;
          await supabase
            .from('answers')
            .update({
              is_correct: isCorrect,
              score: isCorrect ? answer.questions.marks : 0,
              evaluated_by: 'auto',
              evaluated_at: new Date().toISOString()
            })
            .eq('id', answer.id);
        } else {
          // AI-grade written answers
          // Get the test strictness level
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .select(`
              *,
              tests (level_of_strictness)
            `)
            .eq('id', answer.question_id)
            .single();
            
          if (questionError) throw questionError;
          
          // Use the test's strictness level or default to 2 (normal)
          const strictnessLevel = question.tests?.level_of_strictness || 2;
          
          const result = await this.gradeAnswer(
            answer.answer_text,
            answer.questions.correct_answer,
            strictnessLevel,
            answer.questions.marks
          );

          await supabase
            .from('answers')
            .update({
              score: result.score,
              feedback: result.feedback,
              key_points_covered: result.keyPointsCovered,
              missing_points: result.missingPoints,
              evaluated_by: 'ai',
              evaluated_at: new Date().toISOString()
            })
            .eq('id', answer.id);
        }
      }

      // Update the submission's total score and evaluated status
      await this.updateSubmissionStatus(submissionId);
    } catch (error) {
      console.error('Error evaluating test submission:', error);
      throw error;
    }
  }

  static async updateSubmissionStatus(submissionId: string): Promise<void> {
    try {
      // Get all answers for this submission
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('score')
        .eq('submission_id', submissionId);

      if (answersError) throw answersError;

      // Calculate total score
      const totalScore = answers?.reduce((sum, answer) => sum + (answer.score || 0), 0) || 0;

      // Check if all answers are evaluated
      const allEvaluated = answers?.every(answer => answer.score !== null) ?? false;

      // Update the submission
      await supabase
        .from('student_test_submissions')
        .update({
          total_score: totalScore,
          evaluated: allEvaluated
        })
        .eq('id', submissionId);
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
      const { data: answer, error: answerError } = await supabase
        .from('answers')
        .select('submission_id')
        .eq('id', answerId)
        .single();

      if (answerError) throw answerError;

      await supabase
        .from('answers')
        .update({
          score,
          feedback,
          evaluated_by: 'manual',
          evaluated_at: new Date().toISOString()
        })
        .eq('id', answerId);

      // Update the submission's total score and status
      if (answer) {
        await this.updateSubmissionStatus(answer.submission_id);
      }
    } catch (error) {
      console.error('Error manually grading answer:', error);
      throw error;
    }
  }
}
