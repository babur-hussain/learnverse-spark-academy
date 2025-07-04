import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { 
  Search, 
  Menu, 
  X, 
  User, 
  ShoppingCart, 
  Heart,
  Bell,
  Settings,
  LogOut,
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  Video,
  MessageCircle,
  Star,
  Home,
  Store
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/UI/dropdown-menu';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import { supabase } from '@/lib/supabase';
import useIsMobile from '@/hooks/use-mobile';

interface NavbarProps {
  selectedClass?: any;
  setSelectedClass?: (classData: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ selectedClass, setSelectedClass }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      setClasses(data || []);
      
      // Set default class if none selected
      if (!selectedClass && data && data.length > 0 && setSelectedClass) {
        const defaultClass = data.find(c => c.slug === 'class-10') || data[0];
        setSelectedClass(defaultClass);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navigationItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Courses', href: '/catalog', icon: BookOpen },
    { label: 'Stationery', href: '/stationary', icon: Store },
    { label: 'Videos', href: '/video-library', icon: Video },
    { label: 'Forum', href: '/forum', icon: MessageCircle },
  ];
  
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LearnVerse</span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="nav-link">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
                <Link to="/catalog" className="nav-link">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Courses
                </Link>
                <Link to="/stationary" className="nav-link">
                  <Store className="h-4 w-4 mr-2" />
                  Stationery
                </Link>
                <Link to="/video-library" className="nav-link">
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </Link>
                <Link to="/forum" className="nav-link">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Forum
                </Link>
              </div>
            )}

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses, notes, videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Cart Icon */}
                  <Link to="/cart">
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        3
                      </Badge>
                    </Button>
                  </Link>

                  {/* Wishlist Icon */}
                  <Link to="/wishlist">
                    <Button variant="ghost" size="icon" className="relative">
                      <Heart className="h-5 w-5" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        2
                      </Badge>
                    </Button>
                  </Link>

                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-2 -right-2 h-2 w-2 bg-red-500 rounded-full p-0" />
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => setIsAuthOpen(true)}>
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-2">
              <Link 
                to="/" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4 mr-3" />
                Home
              </Link>
              <Link 
                to="/catalog" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4 mr-3" />
                Courses
              </Link>
              <Link 
                to="/stationary" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Store className="h-4 w-4 mr-3" />
                Stationery
              </Link>
              <Link 
                to="/video-library" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Video className="h-4 w-4 mr-3" />
                Videos
              </Link>
              <Link 
                to="/forum" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="h-4 w-4 mr-3" />
                Forum
              </Link>
            </div>
          </div>
        )}
      </nav>

      <AuthDialog 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </>
  );
};

export default Navbar;
