import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';
import CareerAptitudeTest from '@/components/CareerGuidance/CareerAptitudeTest';
import CareerMatches from '@/components/CareerGuidance/CareerMatches';
import CareerRoadmap from '@/components/CareerGuidance/CareerRoadmap';
import CourseRecommendations from '@/components/CareerGuidance/CourseRecommendations';
import CareerProgress from '@/components/CareerGuidance/CareerProgress';
import CareerChat from '@/components/CareerGuidance/CareerChat';

const CareerGuidance = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('aptitude-test');

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-learn-purple">Career Guidance System</h1>
            </div>
            
            <Tabs
              defaultValue="aptitude-test"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-center mb-6 overflow-x-auto">
                <TabsList className="grid grid-cols-3 md:grid-cols-6">
                  <TabsTrigger value="aptitude-test">
                    Aptitude Test
                  </TabsTrigger>
                  <TabsTrigger value="career-matches">
                    Career Matches
                  </TabsTrigger>
                  <TabsTrigger value="roadmap">
                    Roadmap
                  </TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Course Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="progress">
                    Progress
                  </TabsTrigger>
                  <TabsTrigger value="ai-chat">
                    Career Chat
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="aptitude-test">
                <CareerAptitudeTest onComplete={() => setActiveTab('career-matches')} />
              </TabsContent>
              
              <TabsContent value="career-matches">
                <CareerMatches onSelectCareer={() => setActiveTab('roadmap')} />
              </TabsContent>
              
              <TabsContent value="roadmap">
                <CareerRoadmap />
              </TabsContent>
              
              <TabsContent value="recommendations">
                <CourseRecommendations />
              </TabsContent>
              
              <TabsContent value="progress">
                <CareerProgress />
              </TabsContent>
              
              <TabsContent value="ai-chat">
                <CareerChat />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {isMobile && <MobileFooter />}
      </div>
    </AuthGuard>
  );
};

export default CareerGuidance;
