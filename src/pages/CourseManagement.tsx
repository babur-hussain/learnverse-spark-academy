<<<<<<< HEAD
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import Navbar from '@/components/Layout/Navbar';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
=======

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import MainLayout from '@/components/Layout/MainLayout';
>>>>>>> main
import CoursesList from '@/components/Admin/CourseManager/CoursesList';
import { FeaturedCoursesList } from '@/components/Admin/CourseManager/FeaturedCoursesList';

const CourseManagement = () => {
<<<<<<< HEAD
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
=======
  return (
    <AdminRoleGuard>
      <MainLayout>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Course Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create, manage, and organize your courses and featured content.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="courses">All Courses</TabsTrigger>
            <TabsTrigger value="featured">Featured Courses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <CoursesList />
          </TabsContent>
          
          <TabsContent value="featured">
            <FeaturedCoursesList />
          </TabsContent>
        </Tabs>
      </MainLayout>
>>>>>>> main
    </AdminRoleGuard>
  );
};

export default CourseManagement;
