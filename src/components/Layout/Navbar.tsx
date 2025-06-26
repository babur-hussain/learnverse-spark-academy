import React from 'react';
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

const Navbar = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  // Fetch active classes for Study dropdown
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
                  <NavigationMenuTrigger className="text-sm">Learning</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 bg-white dark:bg-gray-900 backdrop-blur-md">
                      <li className="row-span-3">
                        <Link 
                          to="/catalog"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md transition-all duration-300 hover:bg-gradient-to-b hover:from-muted/70 hover:to-muted"
                        >
                          <Book className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Course Catalog
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Explore our comprehensive collection of courses and learning materials.
                          </p>
                        </Link>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/videos"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Video Library
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Access educational videos and lectures
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/live"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Live Classes
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Join interactive live learning sessions
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
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

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">Study</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-2 p-4 bg-white dark:bg-gray-900 backdrop-blur-md">
                      {isLoadingClasses ? (
                        <li className="text-muted-foreground text-center py-2">Loading...</li>
                      ) : classes.length === 0 ? (
                        <li className="text-muted-foreground text-center py-2">No classes available</li>
                      ) : (
                        classes.map((cls: any) => (
                          <li key={cls.id}>
                            <Link
                              to={`/study/${cls.slug}`}
                              className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm font-medium"
                            >
                              {cls.name}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}

        <div className="flex items-center space-x-2 md:space-x-4">
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
