
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, UserX, Mail } from 'lucide-react';

export const SubscribersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: subscribers, isLoading, refetch } = useQuery({
    queryKey: ['newsletter-subscribers', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleUnsubscribe = async (email: string) => {
    try {
      const { error } = await supabase.rpc('unsubscribe_from_newsletter', {
        subscriber_email: email
      });

      if (error) throw error;

      toast({
        title: "Subscriber Unsubscribed",
        description: `${email} has been unsubscribed.`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to unsubscribe user.",
        variant: "destructive"
      });
    }
  };

  const exportSubscribers = () => {
    if (!subscribers) return;

    const csvContent = [
      'Email,Status,Subscribed At,Source',
      ...subscribers.map(sub => 
        `${sub.email},${sub.status},${sub.subscribed_at},${sub.source}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'unsubscribed': return 'secondary';
      case 'bounced': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading subscribers...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Newsletter Subscribers ({subscribers?.length || 0})
          </CardTitle>
          <Button onClick={exportSubscribers} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          {subscribers?.map((subscriber) => (
            <div
              key={subscriber.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{subscriber.email}</p>
                  <p className="text-sm text-gray-600">
                    Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    {subscriber.source && ` • Source: ${subscriber.source}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusColor(subscriber.status)}>
                  {subscriber.status}
                </Badge>
                {subscriber.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnsubscribe(subscriber.email)}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Unsubscribe
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!subscribers?.length && (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No subscribers found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
