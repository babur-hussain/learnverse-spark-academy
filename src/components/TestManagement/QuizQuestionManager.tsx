import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Separator } from '@/components/UI/separator';
import { Badge } from '@/components/UI/badge';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  test_id: string;
  question_text: string;
  options?: { [key: string]: string };
  correct_answer: string;
  type: 'mcq' | 'short' | 'long';
  marks: number;
  negative_marks: number;
  created_at: string;
}

interface QuizQuestionManagerProps {
  testId: string;
}

export const QuizQuestionManager: React.FC<QuizQuestionManagerProps> = ({ testId }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    type: 'mcq' as 'mcq' | 'short' | 'long',
    options: { A: '', B: '', C: '', D: '' },
    correct_answer: '',
    marks: 1,
    negative_marks: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch questions for this test
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['test-questions', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Question[];
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (questionData: typeof newQuestion) => {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          test_id: testId,
          question_text: questionData.question_text,
          options: questionData.type === 'mcq' ? questionData.options : null,
          correct_answer: questionData.correct_answer,
          type: questionData.type,
          marks: questionData.marks,
          negative_marks: questionData.negative_marks
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Question Added",
        description: "Question has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['test-questions', testId] });
      setNewQuestion({
        question_text: '',
        type: 'mcq',
        options: { A: '', B: '', C: '', D: '' },
        correct_answer: '',
        marks: 1,
        negative_marks: 0
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding question:', error);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Question Deleted",
        description: "Question has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['test-questions', testId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting question:', error);
    },
  });

  const handleAddQuestion = () => {
    if (!newQuestion.question_text.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a question.",
        variant: "destructive",
      });
      return;
    }

    if (newQuestion.type === 'mcq' && !newQuestion.correct_answer) {
      toast({
        title: "Validation Error",
        description: "Please select the correct answer for MCQ.",
        variant: "destructive",
      });
      return;
    }

    addQuestionMutation.mutate(newQuestion);
  };

  const renderQuestionOptions = (question: Question) => {
    if (question.type === 'mcq' && question.options) {
      return (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.entries(question.options).map(([key, value]) => (
            <div key={key} className={`p-2 rounded border ${question.correct_answer === key ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <span className="font-medium">{key}:</span> {value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Question
          </CardTitle>
          <CardDescription>Create a new question for this test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text *</Label>
            <Textarea
              id="question-text"
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select 
                value={newQuestion.type} 
                onValueChange={(value: 'mcq' | 'short' | 'long') => 
                  setNewQuestion({ ...newQuestion, type: value, correct_answer: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="short">Short Answer</SelectItem>
                  <SelectItem value="long">Long Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks">Marks</Label>
              <Input
                id="marks"
                type="number"
                value={newQuestion.marks}
                onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 1 })}
                min={1}
                max={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negative-marks">Negative Marks</Label>
              <Input
                id="negative-marks"
                type="number"
                value={newQuestion.negative_marks}
                onChange={(e) => setNewQuestion({ ...newQuestion, negative_marks: parseFloat(e.target.value) || 0 })}
                min={0}
                max={5}
                step={0.1}
              />
            </div>
          </div>

          {newQuestion.type === 'mcq' && (
            <div className="space-y-4">
              <Label>Answer Options</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(newQuestion.options).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`option-${key}`}>Option {key}</Label>
                    <Input
                      id={`option-${key}`}
                      value={newQuestion.options[key]}
                      onChange={(e) => setNewQuestion({
                        ...newQuestion,
                        options: { ...newQuestion.options, [key]: e.target.value }
                      })}
                      placeholder={`Enter option ${key}`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="correct-answer">Correct Answer</Label>
                <Select 
                  value={newQuestion.correct_answer} 
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, correct_answer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(newQuestion.options).map((key) => (
                      <SelectItem key={key} value={key}>Option {key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleAddQuestion} disabled={addQuestionMutation.isPending}>
              {addQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Existing Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
        
        {questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No questions added yet. Create your first question above.</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Q{index + 1}.</span>
                      <Badge variant="outline">{question.type.toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                        {question.negative_marks > 0 && ` (-${question.negative_marks})`}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 mb-2">{question.question_text}</p>
                    {renderQuestionOptions(question)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(question.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestionMutation.mutate(question.id)}
                      disabled={deleteQuestionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
