import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
// Explicit dynamic routes for parameterized pages
import SubjectContent from './pages/SubjectContent';
import SubjectDetailsNew from './pages/SubjectDetailsNew';
import CourseDetailPage from './pages/CourseDetailPage';
import StudyClass from './pages/StudyClass';
import ChapterContentManagement from './pages/ChapterContentManagement';
import AdminNotificationsPage from './pages/AdminNotifications';

const kebab = (s: string) => s
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/\s+/g, '-')
  .toLowerCase();

const pageModules = import.meta.glob('./pages/**/*.tsx', { eager: true });

type RouteEntry = { path: string; Component: React.ComponentType };

const routeEntries: RouteEntry[] = [];

Object.entries(pageModules).forEach(([path, mod]: any) => {
  const Component = mod.default as React.ComponentType | undefined;
  if (!Component) return;
  const relative = path.replace('./pages/', '').replace(/\.tsx$/, '');
  let routePath = '';
  if (/^Index$/i.test(relative)) {
    routePath = '/';
  } else {
    routePath = '/' + kebab(relative.replace(/\\/g, '/')).replace(/\/index$/i, '');
  }
  routeEntries.push({ path: routePath, Component });
});

const NotFound = (pageModules['./pages/NotFound.tsx'] as any)?.default as React.ComponentType | undefined;

export default function AppRoutes() {
  console.log('🚀🚀🚀 APP ROUTES LOADED - Using app-specific routing');
  console.log('VITE_TARGET:', import.meta.env.VITE_TARGET);
  console.log('Current time:', new Date().toISOString());
  
  return (
    <HashRouter>
      <Routes>
        {/* Explicit dynamic routes that cannot be derived from filenames */}
        <Route path="/subject/:subjectId" element={<SubjectDetailsNew />} />
        <Route path="/study/:classSlugOrId" element={<StudyClass />} />
        <Route path="/study/:classSlugOrId/:subjectId" element={<SubjectDetailsNew />} />
        <Route path="/subject-management/subjects/:subjectId" element={<SubjectDetailsNew />} />
        <Route path="/subject-management/subject/:subjectId/chapter/:chapterId" element={<ChapterContentManagement />} />
        <Route path="/catalog/subject/:subjectId" element={<SubjectDetailsNew />} />
        <Route path="/catalog/course/:courseId" element={<CourseDetailPage />} />
        {/* Admin notifications (support both spellings) */}
        <Route path="/admin-notifications" element={<AdminNotificationsPage />} />
        <Route path="/admin-notification" element={<AdminNotificationsPage />} />
        {routeEntries.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        {NotFound && <Route path="*" element={<NotFound />} />}
      </Routes>
    </HashRouter>
  );
}
