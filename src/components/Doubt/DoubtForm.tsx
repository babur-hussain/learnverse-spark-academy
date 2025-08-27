
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Label } from '@/components/UI/label';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Button } from '@/components/UI/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import { useToast } from '@/hooks/use-toast';
import { DoubtService } from '@/services/DoubtService';
import type { DoubtUrgencyLevel } from '@/types/doubt';

export const DoubtForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<DoubtUrgencyLevel>('normal');
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const doubt = await DoubtService.createDoubt(
        title,
        content,
        urgencyLevel,
        undefined,
        subject
      );

      if (doubt) {
        toast({
          title: 'Doubt submitted successfully',
          description: 'Our teachers will respond to your doubt soon.',
        });
        setTitle('');
        setContent('');
        setUrgencyLevel('normal');
        setSubject('');
      } else {
        throw new Error('Failed to create doubt');
      }
    } catch (error) {
      toast({
        title: 'Error submitting doubt',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask a Doubt</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief title for your doubt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Describe your doubt</Label>
            <Textarea
              id="content"
              placeholder="Explain your doubt in detail..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={urgencyLevel}
                onValueChange={(value) => setUrgencyLevel(value as DoubtUrgencyLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Doubt'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
