import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Explicit dynamic routes for pages that require params
import SubjectContent from './pages/SubjectContent';
import SubjectDetails from './pages/SubjectDetails';
import CourseDetailPage from './pages/CourseDetailPage';
import StudyClass from './pages/StudyClass';
import ChapterContentManagement from './pages/ChapterContentManagement';

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

  // Derive route path from filename
  // ./pages/Index.tsx -> /
  // ./pages/Profile.tsx -> /profile
  // ./pages/Admin/Users.tsx -> /admin/users
  const relative = path.replace('./pages/', '').replace(/\.tsx$/, '');

  let routePath = '';
  if (/^Index$/i.test(relative)) {
    routePath = '/';
  } else {
    routePath = '/' + kebab(relative.replace(/\\/g, '/'));
    routePath = routePath.replace(/\/index$/i, '');
  }

  routeEntries.push({ path: routePath, Component });
});

// Fallback NotFound if present
const NotFound = (pageModules['./pages/NotFound.tsx'] as any)?.default as React.ComponentType | undefined;
export default function WebRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Explicit dynamic routes that cannot be derived from filenames */}
        <Route path="/subject/:subjectId" element={<SubjectContent />} />
        <Route path="/study/:classSlugOrId" element={<StudyClass />} />
        <Route path="/study/:classSlugOrId/:subjectId" element={<SubjectContent />} />
        <Route path="/subject-management/subjects/:subjectId" element={<SubjectContent />} />
        <Route path="/subject-management/subject/:subjectId/chapter/:chapterId" element={<ChapterContentManagement />} />
        <Route path="/catalog/subject/:subjectId" element={<SubjectDetails />} />
        <Route path="/catalog/course/:courseId" element={<CourseDetailPage />} />
        {routeEntries.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        {NotFound && <Route path="*" element={<NotFound />} />}
      </Routes>
    </BrowserRouter>
  );
}
