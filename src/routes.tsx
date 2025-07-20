import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Notes from '@/pages/Notes';
import PaidNotes from '@/pages/PaidNotes';
import ComingSoon from './pages/NotFound';
import Admin from './pages/Admin';
import GuardianDashboard from './pages/GuardianDashboard';
import Explore from './pages/Explore';
import SubjectManagement from './pages/SubjectManagement';
import SubjectContent from './pages/SubjectContent';
import SubjectDetails from './pages/SubjectDetails';
import Catalog from './pages/Catalog';
import ChapterContentManagement from './pages/ChapterContentManagement';
import CourseManagement from './pages/CourseManagement';
import VideoManagement from './pages/VideoManagement';
import TestManagement from './pages/TestManagement';
import StudyClass from './pages/StudyClass';
import AdminClassesPage from './pages/AdminClasses';
import FindYourSchool from './pages/FindYourSchool';

// Lazy load SimpleContent page
const SimpleContent = lazy(() => import('./pages/SimpleContent'));
const Stationary = React.lazy(() => import('./pages/Stationary'));
const Cafes = React.lazy(() => import('./pages/Cafes'));
const Kids = React.lazy(() => import('./pages/Kids'));
const Product = React.lazy(() => import('./pages/Product'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Order = React.lazy(() => import('./pages/Order'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
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
    path: '/simple-content',
    element: <SimpleContent />,
  },
  {
    path: '/guardian-dashboard',
    element: <GuardianDashboard />,
  },
  {
    path: '/subject-management',
    element: <SubjectManagement />,
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
  // Chapter content management route
  {
    path: '/subject-management/subject/:subjectId/chapter/:chapterId',
    element: <ChapterContentManagement />,
  },
  // Fix the route for subject content page
  {
    path: '/subject-management/subjects/:subjectId',
    element: <SubjectContent />,
  },
  // Additional route to support existing links
  {
    path: '/subject/:subjectId',
    element: <SubjectContent />,
  },
  // Use SubjectDetails for catalog subject pattern
  {
    path: '/catalog/subject/:subjectId',
    element: <SubjectDetails />,
  },
  // Add the Explore route
  {
    path: '/explore',
    element: <Explore />,
  },
  // Add the Catalog route
  {
    path: '/catalog',
    element: <Catalog />,
  },
  // Add the Profile route
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/study/:classSlugOrId',
    element: <StudyClass />,
  },
  {
    path: '/study/:classSlugOrId/:subjectId',
    element: <SubjectContent />,
  },
  {
    path: '/admin/classes',
    element: <AdminClassesPage />,
  },
  {
    path: '/find-your-school',
    element: <FindYourSchool />,
  },
  {
    path: '/stationary',
    element: <Stationary />,
  },
  {
    path: '/kids',
    element: <Kids />,
  },
  {
    path: '/cafes',
    element: <Cafes />,
  },
  {
    path: '/product/:id',
    element: <Product />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/wishlist',
    element: <Wishlist />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    path: '/order/:id',
    element: <Order />,
  },
  {
    path: '*',
    element: <ComingSoon />,
  },
]);
