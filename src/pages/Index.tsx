import React, { useState, useEffect } from 'react';
import AIHero from '@/components/Home/AIHero';
import Hero from '@/components/Home/Hero';
import Enhanced3DHero from '@/components/Home/Enhanced3DHero';
import Interactive3DSection from '@/components/Home/Interactive3DSection';
import FeaturedCategories from '@/components/Home/FeaturedCategories';
import OnlineSchoolSection from '@/components/Home/OnlineSchoolSection';
import TrendingCoursesSection from '@/components/Home/TrendingCoursesSection';
import OnlineEducationSection from '@/components/Home/OnlineEducationSection';
import FeaturedCourses from '@/components/Home/FeaturedCourses';
import FeaturedSubjects from '@/components/Home/FeaturedSubjects';
import CourseOfferSection from '@/components/Home/CourseOfferSection';
import GoalsSection from '@/components/Home/GoalsSection';
import MyLearnings from '@/components/Home/MyLearnings';
import PersonalizedLearningPromo from '@/components/Home/PersonalizedLearningPromo';
import EducatorSpotlight from '@/components/Home/EducatorSpotlight';
import LearningStats from '@/components/Home/LearningStats';
import BecomeInstructorSection from '@/components/Home/BecomeInstructorSection';
import AppDownload from '@/components/Home/AppDownload';
import CollegeStudentSection from '@/components/Home/CollegeStudentSection';
import SkillBasedLearningSection from '@/components/Home/SkillBasedLearningSection';
import CareerReadinessSection from '@/components/Home/CareerReadinessSection';
import TestimonialsSection from '@/components/Home/TestimonialsSection';
import NewsletterSection from '@/components/Home/NewsletterSection';
import useIsMobile from '@/hooks/use-mobile';
import MainLayout from '@/components/Layout/MainLayout';
import ClassSubjectsGrid from '@/components/Home/ClassSubjectsGrid';
import Navbar from '@/components/Layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FindSchoolSection from '@/components/Home/FindSchoolSection';

const Home = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem('selectedClass') || '');

  // On mount or user change, load class from profile if logged in
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('class_id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.class_id) {
            setSelectedClass(data.class_id);
            localStorage.setItem('selectedClass', data.class_id);
          }
        });
    }
  }, [user]);

  // On class change, update profile if logged in, else just localStorage
  useEffect(() => {
    if (selectedClass) {
      localStorage.setItem('selectedClass', selectedClass);
      if (user?.id) {
        supabase
          .from('profiles')
          .update({ class_id: selectedClass })
          .eq('id', user.id);
      }
    }
  }, [selectedClass, user]);

  return (
    <MainLayout>
      <Navbar selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
      <div className="min-h-screen flex flex-col">
        <AIHero />
        <ClassSubjectsGrid selectedClass={selectedClass} />
        <Hero />
        <FindSchoolSection />
        <FeaturedCategories />
        
        {/* Interactive 3D Learning Section */}
        <Interactive3DSection />
        
        <OnlineSchoolSection />
        <TrendingCoursesSection />
        <OnlineEducationSection />
        
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-4">
          <FeaturedSubjects />
        </div>
        
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-4">
          <FeaturedCourses />
        </div>
        
        <CourseOfferSection />
        
        {/* College-focused sections */}
        <CollegeStudentSection />
        <Enhanced3DHero />
        <SkillBasedLearningSection />
        
        <PersonalizedLearningPromo />
        <GoalsSection />
        <MyLearnings />
        
        <CareerReadinessSection />
        <TestimonialsSection />
        
        <EducatorSpotlight />
        <LearningStats />
        <BecomeInstructorSection />
        
        <NewsletterSection />
        <AppDownload />
      </div>
    </MainLayout>
  );
};

export default Home;
