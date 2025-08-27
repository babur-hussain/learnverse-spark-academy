import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import Navbar from '@/components/Layout/Navbar';
import LearningPath from '@/components/PersonalizedLearning/LearningPath';
import LearningAnalytics from '@/components/PersonalizedLearning/LearningAnalytics';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';

const PersonalizedLearning = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('path');

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <Tabs
              defaultValue="path"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-center mb-6">
                <TabsList>
                  <TabsTrigger value="path">Learning Path</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="path">
                <LearningPath />
              </TabsContent>
              
              <TabsContent value="analytics">
                <LearningAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {isMobile && <MobileFooter />}
      </div>
    </AuthGuard>
  );
};

export default PersonalizedLearning;
