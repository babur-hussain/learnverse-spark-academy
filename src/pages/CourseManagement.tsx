import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import Navbar from '@/components/Layout/Navbar';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import CoursesList from '@/components/Admin/CourseManager/CoursesList';
import { FeaturedCoursesList } from '@/components/Admin/CourseManager/FeaturedCoursesList';

const CourseManagement = () => {
  const isMobile = useIsMobile();

  return (
    <AdminRoleGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Course Management</h1>

          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="featured">Featured Courses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="p-4 bg-white rounded-lg shadow">
              <CoursesList />
            </TabsContent>
            
            <TabsContent value="featured" className="p-4 bg-white rounded-lg shadow">
              <FeaturedCoursesList />
            </TabsContent>
          </Tabs>
        </main>

        {isMobile && <MobileFooter />}
      </div>
    </AdminRoleGuard>
  );
};

export default CourseManagement;
