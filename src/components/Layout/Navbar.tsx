
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import UserMenu from './UserMenu';
import { Button } from '@/components/UI/button';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun, GraduationCap, Book, Users, Video, MessageCircle, Brain, Compass, Heart } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/UI/navigation-menu";

const Navbar = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-learn-purple flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          LearnVerse
        </Link>

        <div className="hidden md:flex items-center space-x-2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Learning</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <li className="row-span-3">
                      <Link 
                        to="/catalog"
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
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
                <NavigationMenuTrigger>Community</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
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
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
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

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="mr-2"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
