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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FindSchoolSection from '@/components/Home/FindSchoolSection';

// Simple cookie helpers to complement localStorage for persistence
function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || '';
  return '';
}

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 365): void {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureAttr = isSecure ? '; Secure' : '';
  // Preference cookies only (not auth); Lax prevents CSRF leakage
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secureAttr}`;
}

const Home = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(() =>
    localStorage.getItem('selectedClass') || getCookie('selectedClass') || ''
  );
  const [selectedCollege, setSelectedCollege] = useState(() =>
    localStorage.getItem('selectedCollege') || getCookie('selectedCollege') || ''
  );

  // Rehydrate from localStorage once after mount (guards against hydration/order issues)
  useEffect(() => {
    try {
      const lc = localStorage.getItem('selectedClass') || '';
      const lcol = localStorage.getItem('selectedCollege') || '';
      if (lc && lc !== selectedClass) setSelectedClass(lc);
      if (lcol && lcol !== selectedCollege) setSelectedCollege(lcol);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simple approach: Load from profile on login, always keep in sync
  useEffect(() => {
    if (!user?.id) return;
    
    // Load user's saved selection from database
    supabase
      .from('profiles')
      .select('class_id, college_id')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load profile:', error);
          return;
        }
        
        const dbClass = data?.class_id || '';
        const dbCollege = data?.college_id || '';
        
        console.log('Profile loaded:', { dbClass, dbCollege });
        
        // Set state and localStorage from database
        if (dbClass) {
          setSelectedClass(dbClass);
          localStorage.setItem('selectedClass', dbClass);
        }
        
        if (dbCollege) {
          setSelectedCollege(dbCollege);
          localStorage.setItem('selectedCollege', dbCollege);
        }
      });
  }, [user]);

  // No default class/college selection. Persist only explicit user choices.

  // Simple approach: When selection changes, update both localStorage and database
  useEffect(() => {
    if (!selectedClass && !selectedCollege) return; // Skip if both are empty
    
    if (selectedClass) {
      // Class selected - clear college and update database
      localStorage.setItem('selectedClass', selectedClass);
      localStorage.removeItem('selectedCollege');
      
      if (user?.id) {
        supabase
          .from('profiles')
          .update({ 
            class_id: selectedClass, 
            college_id: null 
          })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Failed to update profile:', error);
            } else {
              console.log('Profile updated: class =', selectedClass, 'college = null');
            }
          });
      }
    }
    
    if (selectedCollege) {
      // College selected - clear class and update database
      localStorage.setItem('selectedCollege', selectedCollege);
      localStorage.removeItem('selectedClass');
      
      if (user?.id) {
        supabase
          .from('profiles')
          .update({ 
            class_id: null, 
            college_id: selectedCollege 
          })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Failed to update profile:', error);
            } else {
              console.log('Profile updated: class = null, college =', selectedCollege);
            }
          });
      }
    }
  }, [selectedClass, selectedCollege, user]);

  // Debug function for cross-device sync verification (available in console)
  useEffect(() => {
    if (user?.id) {
      // Make debug function available globally for testing
      (window as any).debugCrossDeviceSync = () => {
        console.log('🔍 Debugging cross-device sync...');
        console.log('Current user:', user.email);
        console.log('Current selections:', { selectedClass, selectedCollege });
        console.log('LocalStorage:', {
          class: localStorage.getItem('selectedClass'),
          college: localStorage.getItem('selectedCollege')
        });
        
        // Verify database state
        supabase
          .from('profiles')
          .select('class_id, college_id')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('❌ Database verification failed:', error);
            } else {
              console.log('✅ Database state:', data);
              console.log('🔄 Sync status:', {
                classInSync: data?.class_id === selectedClass,
                collegeInSync: data?.college_id === selectedCollege
              });
            }
          });
      };
      
      console.log('🔧 Debug function available: window.debugCrossDeviceSync()');
    }
  }, [user, selectedClass, selectedCollege]);

  return (
    <MainLayout selectedClass={selectedClass} setSelectedClass={setSelectedClass} selectedCollege={selectedCollege} setSelectedCollege={setSelectedCollege}>
      <div className="w-full overflow-x-hidden content-above-footer">
        <AIHero />
        
        <ClassSubjectsGrid selectedClass={selectedClass} selectedCollege={selectedCollege} />
        <Hero />
        <FindSchoolSection />
        <FeaturedCategories />
        
        {/* Interactive 3D Learning Section */}
        <Interactive3DSection />
        
        <OnlineSchoolSection />
        <TrendingCoursesSection />
        <OnlineEducationSection />
        
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-4">
          <FeaturedSubjects selectedCollege={selectedCollege} />
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
