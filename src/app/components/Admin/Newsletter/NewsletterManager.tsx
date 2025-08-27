
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { SubscribersList } from './SubscribersList';
import { CampaignsList } from './CampaignsList';
import { CreateCampaign } from './CreateCampaign';
import { NewsletterStats } from './NewsletterStats';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users, Send, BarChart3 } from 'lucide-react';

export const NewsletterManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['newsletter-stats'],
    queryFn: async () => {
      const [subscribersResult, campaignsResult] = await Promise.all([
        supabase
          .from('newsletter_subscribers')
          .select('status')
          .eq('status', 'active'),
        supabase
          .from('newsletter_campaigns')
          .select('status, opened_count, clicked_count, recipient_count')
      ]);

      const activeSubscribers = subscribersResult.data?.length || 0;
      const campaigns = campaignsResult.data || [];
      
      const totalSent = campaigns.reduce((sum, c) => sum + (c.recipient_count || 0), 0);
      const totalOpened = campaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0);
      const totalClicked = campaigns.reduce((sum, c) => sum + (c.clicked_count || 0), 0);

      return {
        activeSubscribers,
        totalCampaigns: campaigns.length,
        totalSent,
        totalOpened,
        totalClicked,
        openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0',
        clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0'
      };
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading newsletter management...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Management</h2>
          <p className="text-gray-600">Manage subscribers and send email campaigns</p>
        </div>
      </div>

      <NewsletterStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Create Campaign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <NewsletterStats stats={stats} detailed />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscribersList />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsList />
        </TabsContent>

        <TabsContent value="create">
          <CreateCampaign />
        </TabsContent>
      </Tabs>
    </div>
  );
};
