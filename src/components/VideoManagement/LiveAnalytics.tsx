
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';

interface LiveAnalyticsProps {
  sessionId: string;
  viewerCount: number;
  streamDuration: number;
}

const generateRandomViewerData = (duration: number, currentViewers: number) => {
  // Generate data points for each 5 minutes
  const points = Math.max(6, Math.floor(duration / 300));
  const data = [];
  
  // Start with a number between 0-5
  let viewers = Math.floor(Math.random() * 6);
  
  for (let i = 0; i < points; i++) {
    // Add a point every 5 minutes
    const time = i * 5;
    
    // Random change between -2 and +5
    const change = Math.floor(Math.random() * 8) - 2;
    viewers = Math.max(0, viewers + change);
    
    // Make sure the current number gets to the latest viewer count
    if (i === points - 1) {
      viewers = currentViewers;
    }
    
    data.push({
      time: `${Math.floor(time / 60)}h${time % 60}m`,
      viewers
    });
  }
  
  return data;
};

const generateDeviceData = () => {
  return [
    { name: 'Mobile', value: Math.floor(Math.random() * 60) + 20 },
    { name: 'Desktop', value: Math.floor(Math.random() * 40) + 20 },
    { name: 'Tablet', value: Math.floor(Math.random() * 20) + 5 },
  ];
};

const generateBatchData = () => {
  return [
    { name: 'Summer 2025 - Free', students: Math.floor(Math.random() * 30) + 10 },
    { name: 'Summer 2025 - Premium', students: Math.floor(Math.random() * 25) + 15 },
    { name: 'Fall 2025 - Free', students: Math.floor(Math.random() * 20) + 5 },
    { name: 'Fall 2025 - Premium', students: Math.floor(Math.random() * 15) + 5 },
  ];
};

const generateEngagementData = (duration: number) => {
  // Generate data points for each 5 minutes
  const points = Math.max(6, Math.floor(duration / 300));
  const data = [];
  
  let chatActivity = Math.floor(Math.random() * 6);
  let reactions = Math.floor(Math.random() * 3);
  
  for (let i = 0; i < points; i++) {
    // Add a point every 5 minutes
    const time = i * 5;
    
    // Random changes
    const chatChange = Math.floor(Math.random() * 8) - 2;
    chatActivity = Math.max(0, chatActivity + chatChange);
    
    const reactionChange = Math.floor(Math.random() * 5) - 1;
    reactions = Math.max(0, reactions + reactionChange);
    
    data.push({
      time: `${Math.floor(time / 60)}h${time % 60}m`,
      chat: chatActivity,
      reactions: reactions,
      questions: Math.floor(Math.random() * 3)
    });
  }
  
  return data;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const LiveAnalytics: React.FC<LiveAnalyticsProps> = ({ 
  sessionId,
  viewerCount, 
  streamDuration 
}) => {
  const [viewerData, setViewerData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [batchData, setBatchData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate mock data
    setViewerData(generateRandomViewerData(streamDuration, viewerCount));
    setDeviceData(generateDeviceData());
    setBatchData(generateBatchData());
    setEngagementData(generateEngagementData(streamDuration));
  }, [streamDuration, viewerCount]);
  
  // Used for resetting the charts when browser is resized
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    const handleResize = () => setKey(prev => prev + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-6">
          {/* Viewer count over time */}
          <Card>
            <CardHeader>
              <CardTitle>Viewer Count</CardTitle>
              <CardDescription>Number of viewers throughout the stream</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full" key={`viewer-${key}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={viewerData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="viewers" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorViewers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Engagement metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
              <CardDescription>Chat messages, reactions, and questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full" key={`engagement-${key}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={engagementData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="chat" 
                      name="Chat Messages"
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="reactions" 
                      name="Reactions"
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="questions" 
                      name="Questions"
                      stackId="1"
                      stroke="#ffc658" 
                      fill="#ffc658" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-6 pt-6">
          {/* Detailed engagement metrics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chat Activity</CardTitle>
                <CardDescription>Messages per 5-minute interval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full" key={`chat-${key}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={engagementData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="chat" name="Chat Messages" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Questions & Reactions</CardTitle>
                <CardDescription>Interactive engagement during stream</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full" key={`questions-${key}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={engagementData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="questions" name="Questions" fill="#ffc658" />
                      <Bar dataKey="reactions" name="Reactions" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="audience" className="space-y-6 pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Viewer Devices</CardTitle>
                <CardDescription>How students are watching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full" key={`devices-${key}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Viewers by Batch</CardTitle>
                <CardDescription>Which batches are watching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full" key={`batches-${key}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={batchData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" name="Students" fill="#8884d8">
                        {batchData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveAnalytics;
