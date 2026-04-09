
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import MainLayout from '@/components/Layout/MainLayout';
import CoursesList from '@/components/Admin/CourseManager/CoursesList';
import { FeaturedCoursesList } from '@/components/Admin/CourseManager/FeaturedCoursesList';

const CourseManagement = () => {
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
    </AdminRoleGuard>
  );
};

export default CourseManagement;
