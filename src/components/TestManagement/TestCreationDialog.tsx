
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/UI/dialog';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Switch } from '@/components/UI/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Separator } from '@/components/UI/separator';
import { Calendar } from '@/components/UI/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { CalendarIcon, Clock, TestTube, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TestCreationDialogProps {
  onClose: () => void;
}

export const TestCreationDialog: React.FC<TestCreationDialogProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'mock' as 'mock' | 'live',
    duration_minutes: 60,
    level_of_strictness: 2,
    is_published: false,
    scheduled_at: null as Date | null
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTestMutation = useMutation({
    mutationFn: async (testData: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tests')
        .insert({
          title: testData.title,
          description: testData.description,
          type: testData.type,
          duration_minutes: testData.duration_minutes,
          level_of_strictness: testData.level_of_strictness,
          is_published: testData.is_published,
          scheduled_at: testData.scheduled_at?.toISOString(),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Test Created",
        description: "Your test has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['tests-list'] });
      queryClient.invalidateQueries({ queryKey: ['test-management-stats'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create test. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating test:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a test title.",
        variant: "destructive",
      });
      return;
    }
    createTestMutation.mutate(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Create New Test
        </DialogTitle>
        <DialogDescription>
          Create a new test or quiz for your students. You can add questions after creating the test.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
            <CardDescription>Enter the basic details for your test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Test Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter test title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter test description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Test Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'mock' | 'live') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mock">
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Mock Test
                      </div>
                    </SelectItem>
                    <SelectItem value="live">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Live Test
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                  min={1}
                  max={300}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Settings</CardTitle>
            <CardDescription>Configure how strict the test should be</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strictness">Level of Strictness</Label>
              <Select 
                value={formData.level_of_strictness.toString()} 
                onValueChange={(value) => setFormData({ ...formData, level_of_strictness: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Low - Basic monitoring</SelectItem>
                  <SelectItem value="2">Medium - Standard monitoring</SelectItem>
                  <SelectItem value="3">High - Strict monitoring</SelectItem>
                  <SelectItem value="4">Very High - Maximum security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">Publish Test</Label>
                <div className="text-sm text-muted-foreground">
                  Make this test available to students immediately
                </div>
              </div>
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule (for live tests) */}
        {formData.type === 'live' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </CardTitle>
              <CardDescription>Schedule when this live test should be conducted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Scheduled Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduled_at && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_at ? format(formData.scheduled_at, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_at || undefined}
                      onSelect={(date) => setFormData({ ...formData, scheduled_at: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTestMutation.isPending}>
            {createTestMutation.isPending ? 'Creating...' : 'Create Test'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
