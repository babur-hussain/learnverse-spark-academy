import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import VideoUploadPanel from '@/components/VideoManagement/VideoUploadPanel';
import LiveSessionManager from '@/components/VideoManagement/LiveSessionManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';
import InstructorRoleGuard from '@/components/Layout/InstructorRoleGuard';

const VideoManagement = () => {
  const isMobile = useIsMobile();

  return (
    <AuthGuard>
      <InstructorRoleGuard>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-6">Video Management</h1>
            
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="live">Live Sessions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="videos" className="mt-0">
                <VideoUploadPanel />
              </TabsContent>
              
              <TabsContent value="live" className="mt-0">
                <LiveSessionManager />
              </TabsContent>
            </Tabs>
          </main>
          
          {isMobile ? (
            <MobileFooter />
          ) : (
            <footer className="py-8 bg-gray-100 dark:bg-gray-800">
              <div className="mx-auto px-4 text-center">
                <p className="text-muted-foreground">© 2025 LearnVerse: Spark Academy. All rights reserved.</p>
              </div>
            </footer>
          )}
        </div>
      </InstructorRoleGuard>
    </AuthGuard>
  );
};

export default VideoManagement;
