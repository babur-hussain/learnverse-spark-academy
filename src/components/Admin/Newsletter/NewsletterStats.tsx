
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Users, Mail, Eye, MousePointer } from 'lucide-react';

interface NewsletterStatsProps {
  stats: {
    activeSubscribers: number;
    totalCampaigns: number;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    openRate: string;
    clickRate: string;
  } | undefined;
  detailed?: boolean;
}

export const NewsletterStats: React.FC<NewsletterStatsProps> = ({ stats, detailed = false }) => {
  if (!stats) return null;

  const mainStats = [
    {
      title: "Active Subscribers",
      value: stats.activeSubscribers.toLocaleString(),
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Campaigns",
      value: stats.totalCampaigns.toLocaleString(),
      icon: Mail,
      color: "text-green-600"
    },
    {
      title: "Emails Sent",
      value: stats.totalSent.toLocaleString(),
      icon: Eye,
      color: "text-purple-600"
    },
    {
      title: "Open Rate",
      value: `${stats.openRate}%`,
      icon: MousePointer,
      color: "text-orange-600"
    }
  ];

  const detailedStats = [
    {
      title: "Total Opened",
      value: stats.totalOpened.toLocaleString(),
      description: `${stats.openRate}% open rate`
    },
    {
      title: "Total Clicked",
      value: stats.totalClicked.toLocaleString(),
      description: `${stats.clickRate}% click rate`
    },
    {
      title: "Click-to-Open Rate",
      value: stats.totalOpened > 0 ? `${((stats.totalClicked / stats.totalOpened) * 100).toFixed(1)}%` : '0%',
      description: "Clicks per open"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {detailed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {detailedStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
