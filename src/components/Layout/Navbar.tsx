import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import UserMenu from './UserMenu';
import { Button } from '@/components/UI/button';
import { useThemeContext } from '@/contexts/ThemeContext';
import { usePlatform } from '@/contexts/PlatformContext';
import { Moon, Sun, GraduationCap, Book, Users, Video, MessageCircle, Brain, Compass, Heart, Menu, ShoppingBag, Coffee, Baby, Headphones, ChevronDown, Building2, Globe } from 'lucide-react';
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
  const { theme, resolvedTheme, toggleTheme, isDark, isLight, isSystem } = useThemeContext();
  const { platform } = usePlatform();
  
  // Window width state for responsive behavior
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
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

  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch classes and colleges data
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Load saved selections from localStorage
  useEffect(() => {
    try {
      const savedClass = localStorage.getItem('selectedClass');
      const savedCollege = localStorage.getItem('selectedCollege');
      
      if (savedClass && setSelectedClass) {
        setSelectedClass(savedClass);
      }
      if (savedCollege && setSelectedCollege) {
        setSelectedCollege(savedCollege);
      }
    } catch (error) {
      console.log('Failed to load saved selections:', error);
    }
  }, [setSelectedClass, setSelectedCollege]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node) &&
        collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target as Node) &&
        communityDropdownRef.current && !communityDropdownRef.current.contains(event.target as Node) &&
        resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(event.target as Node)
      ) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllDropdowns]);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and main navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LearnVerse</span>
            </Link>

            {/* Desktop Navigation Items - Only show on large screens and non-mobile devices */}
            {!platform.isMobile && windowWidth > 1024 && (
              <div className="flex items-center space-x-1">
                <Link to="/web" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                  <Globe size={18} />
                  <span>Web</span>
                </Link>
                
                {/* Class Dropdown */}
                <div 
                  ref={classDropdownRef}
                  className="relative"
                  onMouseEnter={() => handleClassDropdownHover(true)}
                  onMouseLeave={() => handleClassDropdownHover(false)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                    <Book size={18} />
                    <span>Class</span>
                    <ChevronDown size={16} className="transition-transform duration-200" />
                  </button>
                  
                  {isClassDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                      {classes.map((cls: any) => (
                        <button
                          key={cls.id}
                          onClick={() => {
                            setSelectedClass?.(cls.id);
                            localStorage.setItem('selectedClass', cls.id);
                            if (setSelectedCollege) {
                              setSelectedCollege('');
                              localStorage.removeItem('selectedCollege');
                            }
                            setIsClassDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm"
                        >
                          {cls.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* College Dropdown */}
                {setSelectedCollege && (
                  <div 
                    ref={collegeDropdownRef}
                    className="relative"
                    onMouseEnter={() => handleCollegeDropdownHover(true)}
                    onMouseLeave={() => handleCollegeDropdownHover(false)}
                  >
                    <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                      <Building2 size={18} />
                      <span>College</span>
                      <ChevronDown size={16} className="transition-transform duration-200" />
                    </button>
                    
                    {isCollegeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                        {colleges.map((col: any) => (
                          <button
                            key={col.id}
                            onClick={() => {
                              setSelectedCollege(col.id);
                              localStorage.setItem('selectedCollege', col.id);
                              if (setSelectedClass) {
                                setSelectedClass('');
                                localStorage.removeItem('selectedClass');
                              }
                              setIsCollegeDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm"
                          >
                            {col.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Link to="/community" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                  <Users size={18} />
                  <span>Community</span>
                </Link>
                
                <Link to="/resources" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                  <Compass size={18} />
                  <span>Resources</span>
                </Link>
                
                <Link to="/stationary" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                  <ShoppingBag size={18} />
                  <span>Stationary</span>
                </Link>
                
                <Link to="/kids" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                  <Baby size={18} />
                  <span>Kids</span>
                </Link>
                <Link to="/audio" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                  <Headphones size={18} />
                  <span>Audio</span>
                </Link>
                <Link to="/cafes" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition">
                  <Coffee size={18} />
                  <span>Cafes</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {platform.isMobile && (
              <button className="lg:hidden p-2 rounded-md hover:bg-accent transition">
                <Menu size={20} />
              </button>
            )}
          </div>

          {/* Right side controls - Responsive layout */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
            {/* Mobile Class/College Selectors - Show for all mobile devices including mobile web */}
            {(platform.isMobile || windowWidth <= 1024) && setSelectedClass && (
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
            {(platform.isMobile || windowWidth <= 1024) && setSelectedCollege && (
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
            
            {/* Enhanced Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="touch-feedback transition-all duration-300 hover:scale-110 h-7 w-7 relative"
              title={`Current theme: ${theme === 'system' ? 'System' : theme} (${resolvedTheme})`}
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="h-4 w-4 text-yellow-400" />
              ) : (
                <Sun className="h-4 w-4 text-orange-500" />
              )}
              {theme === 'system' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-background"></div>
              )}
              <span className="sr-only">
                Toggle theme (Current: {theme === 'system' ? 'System' : theme})
              </span>
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
