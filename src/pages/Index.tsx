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

  // On mount or user change, load class and college from profile if logged in
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('Loading profile for user:', user.email, 'on device:', navigator.userAgent);
    
    supabase
      .from('profiles')
      .select('class_id, college_id')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load profile:', error);
          // Retry once after a short delay for network issues
          setTimeout(() => {
            console.log('Retrying profile load...');
            supabase
              .from('profiles')
              .select('class_id, college_id')
              .eq('id', user.id)
              .single()
              .then(({ data: retryData, error: retryError }) => {
                if (retryError) {
                  console.error('Profile load retry failed:', retryError);
                } else {
                  console.log('Profile load retry successful:', retryData);
                  // Process the retry data
                  const dbClass = retryData?.class_id || '';
                  const dbCollege = retryData?.college_id || '';
                  
                  if (dbClass) {
                    setSelectedClass(dbClass);
                    localStorage.setItem('selectedClass', dbClass);
                    setCookie('selectedClass', dbClass);
                    console.log('✅ Cross-device sync (retry): Restored class from profile:', dbClass);
                  }
                  
                  if (dbCollege) {
                    setSelectedCollege(dbCollege);
                    localStorage.setItem('selectedCollege', dbCollege);
                    setCookie('selectedCollege', dbCollege);
                    console.log('✅ Cross-device sync (retry): Restored college from profile:', dbCollege);
                  }
                }
              });
          }, 2000);
          return;
        }
        
        const dbClass = data?.class_id || '';
        const dbCollege = data?.college_id || '';
        
        console.log('Profile loaded from DB:', { dbClass, dbCollege, userEmail: user.email });
        
        // Clear any existing local selections to ensure clean state
        setSelectedClass('');
        setSelectedCollege('');
        
        // Always prioritize database values (user's last explicit choice)
        if (dbClass) {
          setSelectedClass(dbClass);
          localStorage.setItem('selectedClass', dbClass);
          setCookie('selectedClass', dbClass);
          console.log('✅ Cross-device sync: Restored class from profile:', dbClass);
        }
        
        if (dbCollege) {
          setSelectedCollege(dbCollege);
          localStorage.setItem('selectedCollege', dbCollege);
          setCookie('selectedCollege', dbCollege);
          console.log('✅ Cross-device sync: Restored college from profile:', dbCollege);
        }
        
        if (!dbClass && !dbCollege) {
          console.log('ℹ️ No class/college selection found in profile for user:', user.email);
        }
      });
  }, [user]);

  // No default class/college selection. Persist only explicit user choices.

  // Track if this is a user-initiated change vs. system restoration
  const [isUserChange, setIsUserChange] = useState(false);

  // On class change, update profile if logged in, else just localStorage
  useEffect(() => {
    if (selectedClass && isUserChange) {
      localStorage.setItem('selectedClass', selectedClass);
      setCookie('selectedClass', selectedClass);
      if (user?.id) {
        supabase
          .from('profiles')
          .update({ class_id: selectedClass })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Failed to update profile class_id:', error);
            } else {
              console.log('Profile updated: class_id =', selectedClass);
            }
          });
      }
      // Auto-deselect college when class is selected (only on user change)
      if (selectedCollege) {
        setSelectedCollege('');
        localStorage.removeItem('selectedCollege');
        setCookie('selectedCollege', '', 0);
        if (user?.id) {
          supabase
            .from('profiles')
            .update({ college_id: null })
            .eq('id', user.id)
            .then(({ error }) => {
              if (error) {
                console.error('Failed to clear profile college_id:', error);
              } else {
                console.log('Profile updated: college_id cleared');
              }
            });
        }
      }
      setIsUserChange(false); // Reset flag
    }
  }, [selectedClass, user, selectedCollege, isUserChange]);

  // On college change, update profile if logged in, else just localStorage
  useEffect(() => {
    if (selectedCollege && isUserChange) {
      localStorage.setItem('selectedCollege', selectedCollege);
      setCookie('selectedCollege', selectedCollege);
      if (user?.id) {
        supabase
          .from('profiles')
          .update({ college_id: selectedCollege })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Failed to update profile college_id:', error);
            } else {
              console.log('Profile updated: college_id =', selectedCollege);
            }
          });
      }
      // Auto-deselect class when college is selected (only on user change)
      if (selectedClass) {
        setSelectedClass('');
        localStorage.removeItem('selectedClass');
        setCookie('selectedClass', '', 0);
        if (user?.id) {
          supabase
            .from('profiles')
            .update({ class_id: null })
            .eq('id', user.id)
            .then(({ error }) => {
              if (error) {
                console.error('Failed to clear profile class_id:', error);
              } else {
                console.log('Profile updated: class_id cleared');
              }
            });
        }
      }
      setIsUserChange(false); // Reset flag
    }
  }, [selectedCollege, user, selectedClass, isUserChange]);

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
    <MainLayout selectedClass={selectedClass} setSelectedClass={setSelectedClass} selectedCollege={selectedCollege} setSelectedCollege={setSelectedCollege} setIsUserChange={setIsUserChange}>
      <Navbar selectedClass={selectedClass} setSelectedClass={setSelectedClass} selectedCollege={selectedCollege} setSelectedCollege={setSelectedCollege} />
      <div className="min-h-screen flex flex-col">
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
