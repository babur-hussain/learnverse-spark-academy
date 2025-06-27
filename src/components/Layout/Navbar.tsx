import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import UserMenu from './UserMenu';
import { Button } from '@/components/UI/button';
import { useTheme } from '@/hooks/use-theme';
import useIsMobile from '@/hooks/use-mobile';
import { Moon, Sun, GraduationCap, Book, Users, Video, MessageCircle, Brain, Compass, Heart, Menu } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/UI/navigation-menu";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Navbar = ({ selectedClass, setSelectedClass }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  // Fetch active classes for Class dropdown
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['active-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const selectedClassObj = classes.find(cls => cls.id === selectedClass);

  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj.id);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 md:h-16 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 z-50 shadow-sm">
      <div className="h-full mx-auto px-4 flex items-center justify-between max-w-7xl">
        <Link to="/" className="text-xl md:text-2xl font-bold text-learn-purple flex items-center gap-2 touch-feedback">
          <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
          <span className={isMobile ? 'text-lg' : 'text-2xl'}>LearnVerse</span>
        </Link>

        {!isMobile && (
          <div className="hidden md:flex items-center space-x-2">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">
                    {selectedClassObj ? (selectedClassObj.board ? `${selectedClassObj.board} > ${selectedClassObj.name}` : selectedClassObj.name) : 'Class'}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-56 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                      {isLoadingClasses ? (
                        <li className="p-2 text-center text-muted-foreground">Loading...</li>
                      ) : (
                        classes.map((cls) => (
                          <li key={cls.id}>
                            <button
                              className={`w-full text-left px-4 py-2 rounded hover:bg-accent transition ${selectedClass === cls.id ? 'bg-accent font-bold' : ''}`}
                              onClick={() => handleClassSelect(cls)}
                            >
                              {cls.board ? `${cls.board} > ${cls.name}` : cls.name}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Community</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 bg-white dark:bg-gray-900 backdrop-blur-md">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/forum"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Discussion Forum
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Engage with other learners and share knowledge
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/peer-learning"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Peer Learning
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Study groups and collaborative learning
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 bg-white dark:bg-gray-900 backdrop-blur-md">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/notes"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Book className="h-4 w-4" />
                              Notes
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Access and manage your study notes
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/personalized"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Personalized Learning
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Your customized learning path
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/career-guidance"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Compass className="h-4 w-4" />
                              Career Guidance
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Explore career paths and get guidance
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}

        <div className="flex items-center space-x-2 md:space-x-4">
          {isMobile && (
            <select
              className="rounded-md border px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white mr-2"
              value={selectedClass || ''}
              onChange={e => {
                const cls = classes.find(c => c.id === e.target.value);
                if (cls) setSelectedClass(cls.id);
              }}
            >
              <option value="">Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.board ? `${cls.board} > ${cls.name}` : cls.name}
                </option>
              ))}
            </select>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`touch-feedback transition-all duration-300 hover:scale-110 ${isMobile ? 'h-9 w-9' : 'h-10 w-10'}`}
          >
            {theme === "light" ? (
              <Moon className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
            ) : (
              <Sun className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
