import React from 'react';
import { useParams } from 'react-router-dom';
import { CourseResourceManager } from '@/components/Admin/CourseManager/CourseResourceManager';

const CourseResourcePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  if (!courseId) return <div>Invalid course</div>;
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Manage Course Resources</h1>
      <CourseResourceManager courseId={courseId} />
    </div>
  );
};

export default CourseResourcePage; 