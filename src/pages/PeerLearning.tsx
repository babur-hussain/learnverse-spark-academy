
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import StudyGroups from '@/components/PeerLearning/StudyGroups';
import SharedResources from '@/components/PeerLearning/SharedResources';
import GroupChallenges from '@/components/PeerLearning/GroupChallenges';
import StudyRooms from '@/components/PeerLearning/StudyRooms';

const PeerLearning = () => {
  const [activeTab, setActiveTab] = useState('groups');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Peer Learning Hub</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
          <TabsTrigger value="resources">Shared Resources</TabsTrigger>
          <TabsTrigger value="challenges">Group Challenges</TabsTrigger>
          <TabsTrigger value="rooms">Study Rooms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups">
          <StudyGroups />
        </TabsContent>
        
        <TabsContent value="resources">
          <SharedResources />
        </TabsContent>
        
        <TabsContent value="challenges">
          <GroupChallenges />
        </TabsContent>
        
        <TabsContent value="rooms">
          <StudyRooms />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PeerLearning;
