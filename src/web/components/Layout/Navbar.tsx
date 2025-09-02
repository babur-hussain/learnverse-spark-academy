
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import UserMenu from './UserMenu';
import { Button } from '@/components/UI/button';
import { useTheme } from '@/hooks/use-theme';
import useIsMobile from '@/hooks/use-mobile';
import { Moon, Sun, GraduationCap, Book, Users, Video, MessageCircle, Brain, Compass, Heart, Menu, ShoppingBag, Coffee, Baby, Headphones, ChevronDown, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NavbarProps {
  selectedClass?: any;
  setSelectedClass?: any;
  selectedCollege?: any;
  setSelectedCollege?: any;
}

const Navbar: React.FC<NavbarProps> = ({ selectedClass, setSelectedClass, selectedCollege, setSelectedCollege }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  
  // Custom dropdown state
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  
  // Refs for dropdown positioning
  const classDropdownRef = useRef<HTMLDivElement>(null);
  const collegeDropdownRef = useRef<HTMLDivElement>(null);
  const communityDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);

  // Timeout refs for smooth hover experience
  const classTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collegeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const communityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hover-based dropdown handlers with delay
  const handleClassDropdownHover = useCallback((isHovering: boolean) => {
    if (classTimeoutRef.current) {
      clearTimeout(classTimeoutRef.current);
    }
    
    if (isHovering) {
      setIsClassDropdownOpen(true);
    } else {
      classTimeoutRef.current = setTimeout(() => {
        setIsClassDropdownOpen(false);
      }, 150); // 150ms delay before closing
    }
  }, []);

  const handleCollegeDropdownHover = useCallback((isHovering: boolean) => {
    if (collegeTimeoutRef.current) {
      clearTimeout(collegeTimeoutRef.current);
    }
    
    if (isHovering) {
      setIsCollegeDropdownOpen(true);
    } else {
      collegeTimeoutRef.current = setTimeout(() => {
        setIsCollegeDropdownOpen(false);
      }, 150); // 150ms delay before closing
    }
  }, []);

  const handleCommunityDropdownHover = useCallback((isHovering: boolean) => {
    if (communityTimeoutRef.current) {
      clearTimeout(communityTimeoutRef.current);
    }
    
    if (isHovering) {
      setIsCommunityDropdownOpen(true);
    } else {
      communityTimeoutRef.current = setTimeout(() => {
        setIsCommunityDropdownOpen(false);
      }, 150); // 150ms delay before closing
    }
  }, []);

  const handleResourcesDropdownHover = useCallback((isHovering: boolean) => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
    }
    
    if (isHovering) {
      setIsResourcesDropdownOpen(true);
    } else {
      resourcesTimeoutRef.current = setTimeout(() => {
        setIsResourcesDropdownOpen(false);
      }, 150); // 150ms delay before closing
    }
  }, []);

  // Close all dropdowns function
  const closeAllDropdowns = useCallback(() => {
    // Clear all timeouts
    if (classTimeoutRef.current) clearTimeout(classTimeoutRef.current);
    if (collegeTimeoutRef.current) clearTimeout(collegeTimeoutRef.current);
    if (communityTimeoutRef.current) clearTimeout(communityTimeoutRef.current);
    if (resourcesTimeoutRef.current) clearTimeout(resourcesTimeoutRef.current);
    
    setIsClassDropdownOpen(false);
    setIsCollegeDropdownOpen(false);
    setIsCommunityDropdownOpen(false);
    setIsResourcesDropdownOpen(false);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (classTimeoutRef.current) clearTimeout(classTimeoutRef.current);
      if (collegeTimeoutRef.current) clearTimeout(collegeTimeoutRef.current);
      if (communityTimeoutRef.current) clearTimeout(communityTimeoutRef.current);
      if (resourcesTimeoutRef.current) clearTimeout(resourcesTimeoutRef.current);
    };
  }, []);

  // Fetch active classes for Class dropdown
  const { data: classes = [], isLoading: isLoadingClasses, error: classesError, refetch: refetchClasses } = useQuery({
    queryKey: ['active-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      console.log('Navbar: Fetched classes:', data); // Debug log
      return data;
    },
    retry: 3, // Retry up to 3 times
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Fetch colleges for College dropdown
  const { data: colleges = [], isLoading: isLoadingColleges, error: collegesError, refetch: refetchColleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      console.log('Navbar: Fetching colleges...'); // Debug log
      try {
        const { data, error } = await supabase
          .from('colleges')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Navbar: Error fetching colleges:', error); // Debug log
          throw error;
        }
        
        console.log('Navbar: Fetched colleges successfully:', data); // Debug log
        console.log('Navbar: Colleges count:', data?.length || 0); // Debug log
        
        return data || [];
      } catch (err) {
        console.error('Navbar: Exception in colleges query:', err); // Debug log
        throw err;
      }
    },
    retry: 3, // Retry up to 3 times
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const selectedClassObj = classes.find(cls => cls.id === selectedClass);
  const selectedCollegeObj = colleges.find(col => col.id === selectedCollege);

  // Debug log for classes and colleges state
  useEffect(() => {
    console.log('Navbar: Classes state updated:', { classes, selectedClass, selectedClassObj, isLoadingClasses, classesError });
  }, [classes, selectedClass, selectedClassObj, isLoadingClasses, classesError]);

  useEffect(() => {
    console.log('Navbar: Colleges state updated:', { 
      colleges, 
      selectedCollege, 
      selectedCollegeObj, 
      isLoadingColleges, 
      collegesError,
      collegesLength: colleges?.length || 0
    });
  }, [colleges, selectedCollege, selectedCollegeObj, isLoadingColleges, collegesError]);

  // Auto-refetch classes if there's an error or no data
  useEffect(() => {
    if (classesError || (!isLoadingClasses && (!classes || classes.length === 0))) {
      console.log('Navbar: Attempting to refetch classes due to error or empty data');
      refetchClasses();
    }
  }, [classesError, classes, isLoadingClasses, refetchClasses]);

  // Auto-refetch colleges if there's an error or no data
  useEffect(() => {
    if (collegesError || (!isLoadingColleges && (!colleges || colleges.length === 0))) {
      console.log('Navbar: Attempting to refetch colleges due to error or empty data');
      refetchColleges();
    }
  }, [collegesError, colleges, isLoadingColleges, refetchColleges]);

  const handleClassSelect = useCallback((classObj: any) => {
    if (setSelectedClass) {
      setSelectedClass(classObj.id);
      // Auto-deselect college when class is selected
      if (setSelectedCollege) {
        setSelectedCollege('');
      }
      try {
        localStorage.setItem('selectedClass', classObj.id);
        localStorage.removeItem('selectedCollege');
      } catch {}
    }
    setIsClassDropdownOpen(false);
  }, [setSelectedClass, setSelectedCollege]);

  const handleCollegeSelect = useCallback((collegeObj: any) => {
    if (setSelectedCollege) {

      setSelectedCollege(collegeObj.id);
      // Auto-deselect class when college is selected
      if (setSelectedClass) {
        setSelectedClass('');
      }
      try {
        localStorage.setItem('selectedCollege', collegeObj.id);
        localStorage.removeItem('selectedClass');
      } catch {}
    }
    setIsCollegeDropdownOpen(false);
  }, [setSelectedCollege, setSelectedClass]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside all dropdown containers
      if (!classDropdownRef.current?.contains(target) && 
          !collegeDropdownRef.current?.contains(target) &&
          !communityDropdownRef.current?.contains(target) && 
          !resourcesDropdownRef.current?.contains(target)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllDropdowns]);

  // Close dropdowns when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllDropdowns();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeAllDropdowns]);

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm z-50 dynamic-island-safe"
      >
        <div className="mx-auto px-2 sm:px-4 flex items-center justify-between max-w-7xl h-12">
          {/* Logo - Responsive sizing */}
          <Link to="/" className="text-lg md:text-2xl font-bold text-learn-purple flex items-center gap-1 md:gap-2 touch-feedback flex-shrink-0">
            <GraduationCap className="h-5 w-5 md:h-8 md:w-8" />
            <span className="text-base sm:text-lg md:text-2xl">LearnVerse</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-2">
              {/* Custom Class Dropdown */}
              {setSelectedClass && (
                <div className="relative" ref={classDropdownRef}>
                  <button
                    onMouseEnter={() => handleClassDropdownHover(true)}
                    onMouseLeave={() => handleClassDropdownHover(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors"
                    disabled={isLoadingClasses}
                  >
                    {isLoadingClasses ? 'Loading...' : (selectedClassObj ? selectedClassObj.name : 'Class')}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isClassDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]"
                      onMouseEnter={() => handleClassDropdownHover(true)}
                      onMouseLeave={() => handleClassDropdownHover(false)}
                    >
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Class</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              refetchClasses();
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            title="Refresh classes"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>
                      <ul className="p-2">
                        {isLoadingClasses ? (
                          <li className="p-2 text-center text-muted-foreground">Loading classes...</li>
                        ) : classesError ? (
                          <li className="p-2 text-center text-red-500">
                            <div>Error loading classes</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                refetchClasses();
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                            >
                              Try again
                            </button>
                          </li>
                        ) : classes && classes.length > 0 ? (
                          classes.map((cls) => (
                            <li key={cls.id}>
                              <button
                                className={`w-full text-left px-4 py-2 rounded hover:bg-accent transition-colors duration-200 ${selectedClass === cls.id ? 'bg-accent font-bold' : ''}`}
                                onClick={() => handleClassSelect(cls)}
                              >
                                {cls.name}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="p-2 text-center text-muted-foreground">No classes available</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Custom College Dropdown */}
              {setSelectedCollege && (
                <div className="relative" ref={collegeDropdownRef}>
                  <button
                    onMouseEnter={() => handleCollegeDropdownHover(true)}
                    onMouseLeave={() => handleCollegeDropdownHover(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors"
                    disabled={isLoadingColleges}
                  >
                    <Building2 className="h-4 w-4" />
                    {isLoadingColleges ? 'Loading...' : (selectedCollegeObj ? selectedCollegeObj.name : 'College')}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCollegeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isCollegeDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]"
                      onMouseEnter={() => handleCollegeDropdownHover(true)}
                      onMouseLeave={() => handleCollegeDropdownHover(false)}
                    >
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select College</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              refetchColleges();
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            title="Refresh colleges"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>
                      <ul className="p-2">
                        {isLoadingColleges ? (
                          <li className="p-2 text-center text-muted-foreground">Loading colleges...</li>
                        ) : collegesError ? (
                          <li className="p-2 text-center text-red-500">
                            <div>Error loading colleges</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                refetchColleges();
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                            >
                              Try again
                            </button>
                          </li>
                        ) : colleges && colleges.length > 0 ? (
                          colleges.map((col) => (
                            <li key={col.id}>
                              <button
                                className={`w-full text-left px-4 py-2 rounded hover:bg-accent transition-colors duration-200 ${selectedCollege === col.id ? 'bg-accent font-bold' : ''}`}
                                onClick={() => handleCollegeSelect(col)}
                              >
                                {col.name}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="p-2 text-center text-muted-foreground">No colleges available</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Community Dropdown */}
              <div className="relative" ref={communityDropdownRef}>
                <button
                  onMouseEnter={() => handleCommunityDropdownHover(true)}
                  onMouseLeave={() => handleCommunityDropdownHover(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors"
                >
                  Community
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCommunityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCommunityDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-[400px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]"
                    onMouseEnter={() => handleCommunityDropdownHover(true)}
                    onMouseLeave={() => handleCommunityDropdownHover(false)}
                  >
                    <div className="grid gap-3 p-4 md:grid-cols-2">
                      <Link
                        to="/forum"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => setIsCommunityDropdownOpen(false)}
                      >
                        <div className="text-sm font-medium leading-none flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Discussion Forum
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Engage with other learners and share knowledge
                        </p>
                      </Link>
                      <Link
                        to="/peer-learning"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => setIsCommunityDropdownOpen(false)}
                      >
                        <div className="text-sm font-medium leading-none flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Peer Learning
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Study groups and collaborative learning
                        </p>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Resources Dropdown */}
              <div className="relative" ref={resourcesDropdownRef}>
                <button
                  onMouseEnter={() => handleResourcesDropdownHover(true)}
                  onMouseLeave={() => handleResourcesDropdownHover(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors"
                >
                  Resources
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isResourcesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isResourcesDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-[400px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]"
                    onMouseEnter={() => handleResourcesDropdownHover(true)}
                    onMouseLeave={() => handleResourcesDropdownHover(false)}
                  >
                    <div className="grid gap-3 p-4 md:grid-cols-2">
                      <Link
                        to="/notes"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => setIsResourcesDropdownOpen(false)}
                      >
                        <div className="text-sm font-medium leading-none flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Notes
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Access and manage your study notes
                        </p>
                      </Link>
                      <Link
                        to="/personalized"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => setIsResourcesDropdownOpen(false)}
                      >
                        <div className="text-sm font-medium leading-none flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Personalized Learning
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Your customized learning path
                        </p>
                      </Link>
                      <Link
                        to="/career-guidance"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => setIsResourcesDropdownOpen(false)}
                      >
                        <div className="text-sm font-medium leading-none flex items-center gap-2">
                          <Compass className="h-4 w-4" />
                          Career Guidance
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Explore career paths and get guidance
                        </p>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Links */}
              <Link to="/stationary" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                <ShoppingBag size={18} />
                <span>Stationary</span>
              </Link>
              <Link to="/kids" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                <Baby size={18} />
                <span>Kids</span>
              </Link>
              
              <Link to="/cafes" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                <Coffee size={18} />
                <span>Internet Cafe</span>
              </Link>
            </div>
          )}

          {/* Right side controls - Responsive layout */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
            {/* Mobile Class/College Selectors */}
            {isMobile && setSelectedClass && (
              <select
                className="rounded border px-1 py-0.5 bg-background text-foreground border-border max-w-[75px] focus:outline-none focus:ring-1 focus:ring-primary h-7"
                style={{ fontSize: '10px' }}
                value={selectedClass || ''}
                onChange={e => {
                  const cls = classes.find(c => c.id === e.target.value);
                  if (cls) {
                    setSelectedClass(cls.id);
                    // Auto-deselect college when class is selected
                    if (setSelectedCollege) {
                      setSelectedCollege('');
                    }
                    try {
                      localStorage.setItem('selectedClass', cls.id);
                      localStorage.removeItem('selectedCollege');
                    } catch {}
                  }
                }}
              >
                <option value="">Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            )}
            {isMobile && setSelectedCollege && (
              <select
                className="rounded border px-1 py-0.5 bg-background text-foreground border-border max-w-[75px] focus:outline-none focus:ring-1 focus:ring-primary h-7"
                style={{ fontSize: '10px' }}
                value={selectedCollege || ''}
                onChange={e => {
                  const col = colleges.find(c => c.id === e.target.value);
                  if (col) {
                    setSelectedCollege(col.id);
                    // Auto-deselect class when college is selected
                    if (setSelectedClass) {
                      setSelectedClass('');
                    }
                    try {
                      localStorage.setItem('selectedCollege', col.id);
                      localStorage.removeItem('selectedClass');
                    } catch {}
                  }
                }}
              >
                <option value="">College</option>
                {colleges.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            )}
            
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="touch-feedback transition-all duration-300 hover:scale-110 h-7 w-7"
            >
              <Moon className="h-4 w-4" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* User Menu */}
            <div className="flex-shrink-0">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
