import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Admin from './pages/Admin';
import AdminClassesPage from './pages/AdminClasses';
import SubjectManagement from './pages/SubjectManagement';
import CourseManagement from './pages/CourseManagement';
import VideoManagement from './pages/VideoManagement';
import TestManagement from './pages/TestManagement';
import ChapterContentManagement from './pages/ChapterContentManagement';
import SubjectContent from './pages/SubjectContent';
import Auth from './pages/Auth';
import ComingSoon from './pages/NotFound';

const SimpleContent = lazy(() => import('./pages/SimpleContent'));
const CollegeManagement = lazy(() => import('./pages/CollegeManagement'));
const CourseResourcePage = lazy(() => import('./pages/CourseResourcePage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/admin',
    element: <Admin />,
  },
  {
    path: '/admin/classes',
    element: <AdminClassesPage />,
  },
  {
    path: '/admin/course-resources/:courseId',
    element: <CourseResourcePage />,
  },
  {
    path: '/subject-management',
    element: <SubjectManagement />,
  },
  {
    path: '/subject-management/subject/:subjectId/chapter/:chapterId',
    element: <ChapterContentManagement />,
  },
  {
    path: '/subject-management/subjects/:subjectId',
    element: <SubjectContent />,
  },
  {
    path: '/subject/:subjectId',
    element: <SubjectContent />,
  },
  {
    path: '/course-management',
    element: <CourseManagement />,
  },
  {
    path: '/video-management',
    element: <VideoManagement />,
  },
  {
    path: '/test-management',
    element: <TestManagement />,
  },
  {
    path: '/simple-content',
    element: <SimpleContent />,
  },
  {
    path: '/college-management',
    element: <CollegeManagement />,
  },
  {
    path: '*',
    element: <ComingSoon />,
  },
]);
