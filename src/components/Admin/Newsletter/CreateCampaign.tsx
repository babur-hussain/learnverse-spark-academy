
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Label } from '@/components/UI/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Save, Eye } from 'lucide-react';

export const CreateCampaign: React.FC = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: { title: string; subject: string; content: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .insert({
          ...campaignData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      toast({
        title: "Campaign Created",
        description: "Your email campaign has been created successfully.",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    }
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignData: { title: string; subject: string; content: string }) => {
      // Get active subscribers
      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('id, email')
        .eq('status', 'active');

      if (subscribersError) throw subscribersError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('newsletter_campaigns')
        .insert({
          ...campaignData,
          status: 'sent',
          created_by: user.id,
          sent_at: new Date().toISOString(),
          recipient_count: subscribers.length
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Create campaign logs for each subscriber
      const logs = subscribers.map(subscriber => ({
        campaign_id: campaign.id,
        subscriber_id: subscriber.id,
        status: 'sent'
      }));

      const { error: logsError } = await supabase
        .from('newsletter_campaign_logs')
        .insert(logs);

      if (logsError) throw logsError;

      return { campaign, recipientCount: subscribers.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      toast({
        title: "Campaign Sent!",
        description: `Your campaign has been sent to ${result.recipientCount} subscribers.`,
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setContent('');
    setIsPreview(false);
  };

  const handleSaveDraft = () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    createCampaignMutation.mutate({
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim(),
      status: 'draft'
    });
  };

  const handleSendCampaign = () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    sendCampaignMutation.mutate({
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim()
    });
  };

  const isLoading = createCampaignMutation.isPending || sendCampaignMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Create Email Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign-title">Campaign Title *</Label>
              <Input
                id="campaign-title"
                placeholder="Enter campaign title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email-subject">Email Subject *</Label>
              <Input
                id="email-subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email-content">Email Content *</Label>
              <Textarea
                id="email-content"
                placeholder="Write your email content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-64"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={() => setIsPreview(!isPreview)}
              variant="outline"
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleSendCampaign}
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendCampaignMutation.isPending ? 'Sending...' : 'Send Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="mb-4">
                <div className="text-sm text-gray-600">Subject:</div>
                <div className="font-semibold">{subject || 'No subject'}</div>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{content || 'No content'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
