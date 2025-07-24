import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/UI/card';
import Navbar from '@/components/Layout/Navbar';

interface Course {
  id: string;
  title: string;
  description: string;
  banner_url?: string;
  thumbnail_url?: string;
}

const AllCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('title');
      if (!error && data) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-white">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4 mt-20">
        <h1 className="text-3xl font-bold mb-8 text-indigo-700">All Courses</h1>
        {loading ? (
          <div className="text-center py-16">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="cursor-pointer hover:shadow-xl transition-shadow group"
                onClick={() => navigate(`/catalog/course/${course.id}`)}
              >
                {course.banner_url || course.thumbnail_url ? (
                  <img
                    src={course.banner_url || course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-indigo-100 flex items-center justify-center rounded-t-lg text-5xl text-indigo-400">
                    📚
                  </div>
                )}
                <CardContent className="p-4">
                  <h2 className="font-semibold text-lg mb-1 group-hover:text-indigo-600 transition-colors">{course.title}</h2>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCoursesPage; 