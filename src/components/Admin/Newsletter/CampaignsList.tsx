
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Eye, MousePointer, Calendar, Send } from 'lucide-react';

export const CampaignsList: React.FC = () => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['newsletter-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'scheduled': return 'outline';
      case 'sending': return 'default';
      case 'sent': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-3 w-3" />;
      case 'sending': return <Send className="h-3 w-3" />;
      case 'sent': return <Mail className="h-3 w-3" />;
      default: return null;
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading campaigns...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Campaigns ({campaigns?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns?.map((campaign) => (
          <div
            key={campaign.id}
            className="p-4 border rounded-lg space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{campaign.title}</h3>
                <p className="text-gray-600 text-sm">{campaign.subject}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Created on {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={getStatusColor(campaign.status)} className="flex items-center gap-1">
                {getStatusIcon(campaign.status)}
                {campaign.status}
              </Badge>
            </div>

            {campaign.status === 'sent' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                    <Send className="h-4 w-4" />
                    Sent
                  </div>
                  <div className="font-semibold">{campaign.recipient_count?.toLocaleString() || 0}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    Opened
                  </div>
                  <div className="font-semibold">
                    {campaign.opened_count?.toLocaleString() || 0}
                    <span className="text-xs text-gray-500 ml-1">
                      ({campaign.recipient_count > 0 
                        ? ((campaign.opened_count / campaign.recipient_count) * 100).toFixed(1) 
                        : 0}%)
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                    <MousePointer className="h-4 w-4" />
                    Clicked
                  </div>
                  <div className="font-semibold">
                    {campaign.clicked_count?.toLocaleString() || 0}
                    <span className="text-xs text-gray-500 ml-1">
                      ({campaign.recipient_count > 0 
                        ? ((campaign.clicked_count / campaign.recipient_count) * 100).toFixed(1) 
                        : 0}%)
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Sent Date</div>
                  <div className="font-semibold text-sm">
                    {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            )}

            {campaign.scheduled_at && campaign.status === 'scheduled' && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">
                  Scheduled for: {new Date(campaign.scheduled_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}

        {!campaigns?.length && (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No campaigns created yet</p>
            <p className="text-sm text-gray-500">Create your first email campaign to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
