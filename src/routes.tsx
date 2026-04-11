import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Notes from './pages/Notes';
import PaidNotes from './pages/PaidNotes';
import ComingSoon from './pages/NotFound';
import GuardianDashboard from './pages/GuardianDashboard';
import Explore from './pages/Explore';
import SubjectContent from './pages/SubjectContent';
import SubjectDetails from './pages/SubjectDetails';
import Catalog from './pages/Catalog';
import StudyClass from './pages/StudyClass';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletionPolicy from './pages/DataDeletionPolicy';
import FindYourSchool from './pages/FindYourSchool';
import CourseDetailPage from './pages/CourseDetailPage';
import AllCoursesPage from './pages/AllCoursesPage';

// Lazy loaded pages
const Stationary = React.lazy(() => import('./pages/Stationary'));
const Cafes = React.lazy(() => import('./pages/Cafes'));
const Kids = React.lazy(() => import('./pages/Kids'));
const Product = React.lazy(() => import('./pages/Product'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Order = React.lazy(() => import('./pages/Order'));
const Audio = React.lazy(() => import('./pages/Audio'));
const DownloadedPDFs = React.lazy(() => import('./pages/DownloadedPDFs'));

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
    path: '/guardian-dashboard',
    element: <GuardianDashboard />,
  },
  // Subject content routes (student-facing)
  {
    path: '/subject/:subjectId',
    element: <SubjectContent />,
  },
  {
    path: '/catalog/subject/:subjectId',
    element: <SubjectDetails />,
  },
  {
    path: '/explore',
    element: <Explore />,
  },
  {
    path: '/catalog',
    element: <Catalog />,
  },
  {
    path: '/catalog/course/:courseId',
    element: <CourseDetailPage />,
  },
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
    path: '/audio',
    element: <Audio />,
  },
  {
    path: '/all-courses',
    element: <AllCoursesPage />,
  },
  {
    path: '/notes',
    element: <Notes />,
  },
  {
    path: '/paid-notes',
    element: <PaidNotes />,
  },
  {
    path: '/downloaded-pdfs',
    element: <DownloadedPDFs />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/terms-of-service',
    element: <TermsOfService />,
  },
  {
    path: '/data-deletion-policy',
    element: <DataDeletionPolicy />,
  },
  {
    path: '*',
    element: <ComingSoon />,
  },
]);

