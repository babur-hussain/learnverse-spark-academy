

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import { Button } from '@/components/UI/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/UI/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/UI/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/UI/form';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Label } from '@/components/UI/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import { useToast } from '@/hooks/use-toast';
import { TestService, Test, Question } from '@/services/TestService';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, PenLine, CheckCircle, ArrowLeft, Save, Eye } from 'lucide-react';

// Schema for question validation
const questionSchema = z.object({
  question_text: z.string().min(1, "Question text is required"),
  type: z.enum(["mcq", "short", "long"]),
  marks: z.coerce.number().min(1, "Marks must be at least 1"),
  negative_marks: z.coerce.number().min(0, "Negative marks cannot be negative"),
  correct_answer: z.string().min(1, "Correct answer is required"),
  options: z.optional(z.record(z.string().min(1, "Option text is required"))),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const TestEditor: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form for adding/editing questions
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: '',
      type: 'mcq',
      marks: 1,
      negative_marks: 0,
      correct_answer: '',
      options: { A: '', B: '', C: '', D: '' },
    },
  });

  const questionType = form.watch('type');

  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId || !user) return;

      try {
        setLoading(true);
        const testData = await TestService.getTest(testId);
        setTest(testData);

        const questionsData = await TestService.getQuestions(testId);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching test data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load test data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, user, toast]);

  const onSubmitQuestion = async (data: QuestionFormValues) => {
    if (!testId) return;

    try {
      // Format the data based on question type
      const questionData: Omit<Question, 'id' | 'created_at'> = {
        test_id: testId,
        question_text: data.question_text,
        type: data.type,
        marks: data.marks,
        negative_marks: data.negative_marks,
        correct_answer: data.correct_answer,
      };

      // Only include options for MCQ questions
      if (data.type === 'mcq' && data.options) {
        questionData.options = data.options;
      }

      if (editingQuestion) {
        // Update existing question
        await TestService.updateQuestion(editingQuestion.id, questionData);
        toast({
          title: 'Question updated',
          description: 'The question has been updated successfully.',
        });
      } else {
        // Add new question
        await TestService.addQuestion(questionData);
        toast({
          title: 'Question added',
          description: 'The question has been added to the test.',
        });
      }

      // Refresh questions list
      const updatedQuestions = await TestService.getQuestions(testId);
      setQuestions(updatedQuestions);

      // Reset form and close dialog
      form.reset();
      setEditingQuestion(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: 'Error',
        description: 'Failed to save question.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await TestService.deleteQuestion(questionId);
      toast({
        title: 'Question deleted',
        description: 'The question has been removed from the test.',
      });
      
      // Refresh questions list
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question.',
        variant: 'destructive',
      });
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    
    // Populate form with question data
    form.reset({
      question_text: question.question_text,
      type: question.type,
      marks: question.marks,
      negative_marks: question.negative_marks,
      correct_answer: question.correct_answer,
      options: question.options || { A: '', B: '', C: '', D: '' },
    });
    
    setDialogOpen(true);
  };

  const handlePublishTest = async () => {
    if (!test || !testId) return;

    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'Cannot publish a test with no questions.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await TestService.updateTest(testId, { is_published: true });
      toast({
        title: 'Test published',
        description: 'The test has been published and is now available to students.',
      });
      
      // Update local state
      setTest({ ...test, is_published: true });
    } catch (error) {
      console.error('Error publishing test:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish test.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTest = async (field: string, value: string | number | boolean) => {
    if (!test || !testId) return;

    try {
      await TestService.updateTest(testId, { [field]: value });
      toast({
        title: 'Test updated',
        description: 'The test has been updated successfully.',
      });
      
      // Update local state
      setTest({ ...test, [field]: value });
    } catch (error) {
      console.error('Error updating test:', error);
      toast({
        title: 'Error',
        description: 'Failed to update test.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading test data...</p>
        </main>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Test not found or you don't have permission to access it.</p>
        </main>
      </div>
    );
  }

  return (
    <AuthGuard>
      <AdminRoleGuard>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => navigate('/test-management')}>
                <ArrowLeft className="h-5 w-5 mr-1" /> Back
              </Button>
              <h1 className="text-3xl font-bold flex-1">{test.title}</h1>
              {test.is_published ? (
                <Button variant="outline" className="bg-green-50 text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" /> Published
                </Button>
              ) : (
                <Button onClick={handlePublishTest} className="gradient-primary">
                  Publish Test
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Test Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <div className="flex mt-1">
                      <Input 
                        value={test.title} 
                        onChange={(e) => handleUpdateTest('title', e.target.value)} 
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <div className="flex mt-1">
                      <Textarea 
                        value={test.description || ''} 
                        onChange={(e) => handleUpdateTest('description', e.target.value)} 
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <div className="flex mt-1">
                      <Input 
                        type="number"
                        min="1"
                        value={test.duration_minutes} 
                        onChange={(e) => handleUpdateTest('duration_minutes', parseInt(e.target.value))} 
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>AI Grading Strictness</Label>
                    <Select 
                      value={String(test.level_of_strictness)} 
                      onValueChange={(value) => handleUpdateTest('level_of_strictness', parseInt(value))}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select strictness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Lenient</SelectItem>
                        <SelectItem value="2">Normal</SelectItem>
                        <SelectItem value="3">Strict</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {test.type === 'live' && (
                    <div>
                      <Label>Scheduled Date</Label>
                      <div className="flex mt-1">
                        <Input 
                          type="datetime-local"
                          value={test.scheduled_at?.slice(0, 16) || ''} 
                          onChange={(e) => handleUpdateTest('scheduled_at', e.target.value)} 
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/test-preview/${test.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Preview
                  </Button>
                  <Button className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          form.reset({
                            question_text: '',
                            type: 'mcq',
                            marks: 1,
                            negative_marks: 0,
                            correct_answer: '',
                            options: { A: '', B: '', C: '', D: '' },
                          });
                          setEditingQuestion(null);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                      <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                        <DialogDescription>
                          {editingQuestion ? 'Modify the question details below.' : 'Create a new question for your test.'}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitQuestion)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select question type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                                    <SelectItem value="short">Short Answer</SelectItem>
                                    <SelectItem value="long">Long Answer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  {field.value === 'mcq' 
                                    ? 'Students will select one option from choices you provide.' 
                                    : field.value === 'short'
                                    ? 'Students will write a brief answer (1-2 sentences).'
                                    : 'Students will write an extended answer (paragraph).'}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="question_text"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question Text</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter your question here..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="marks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Marks</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="negative_marks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Negative Marks</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="0" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Points deducted for wrong answers.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {questionType === 'mcq' && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="options.A"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Option A</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter option A" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="options.B"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Option B</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter option B" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="options.C"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Option C</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter option C" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="options.D"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Option D</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter option D" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="correct_answer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Correct Option</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select correct option" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="A">Option A</SelectItem>
                                        <SelectItem value="B">Option B</SelectItem>
                                        <SelectItem value="C">Option C</SelectItem>
                                        <SelectItem value="D">Option D</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}

                          {(questionType === 'short' || questionType === 'long') && (
                            <FormField
                              control={form.control}
                              name="correct_answer"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Model Answer</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Enter the correct answer for grading reference..." 
                                      className="h-32"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This will be used as a reference for AI-assisted grading.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="gradient-primary">
                              {editingQuestion ? 'Update Question' : 'Add Question'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-10">
                      <PenLine className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">No questions yet</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Add some questions to your test.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <Card key={question.id} className="bg-gray-50">
                          <CardHeader className="py-4 px-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">Q{index + 1}: {question.question_text}</CardTitle>
                                <CardDescription>
                                  {question.type === 'mcq' ? 'Multiple Choice' : 
                                   question.type === 'short' ? 'Short Answer' : 'Long Answer'} · 
                                  {question.marks} mark{question.marks !== 1 ? 's' : ''}
                                  {question.negative_marks > 0 ? ` · ${question.negative_marks} negative` : ''}
                                </CardDescription>
                              </div>
                              <div className="flex">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditQuestion(question)}
                                >
                                  <PenLine className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {question.type === 'mcq' && question.options && (
                            <CardContent className="py-2 px-4">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(question.options).map(([key, value]) => (
                                  <div 
                                    key={key} 
                                    className={`p-2 rounded ${key === question.correct_answer ? 'bg-green-100 border border-green-200' : 'bg-gray-100'}`}
                                  >
                                    <span className="font-semibold">{key}:</span> {value}
                                    {key === question.correct_answer && (
                                      <span className="text-green-600 ml-2">✓</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between bg-gray-50 border-t">
                  <p className="text-sm text-gray-500">
                    Total marks: {questions.reduce((sum, q) => sum + q.marks, 0)}
                  </p>
                  <Button disabled={questions.length === 0} onClick={handlePublishTest} className={`${test.is_published ? 'bg-gray-100 text-gray-500' : 'gradient-primary'}`}>
                    {test.is_published ? 'Already Published' : 'Publish Test'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </main>
          {isMobile && <MobileFooter />}
        </div>
      </AdminRoleGuard>
    </AuthGuard>
  );
};

export default TestEditor;
