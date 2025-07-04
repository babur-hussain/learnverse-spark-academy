
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Video, MessageCircle, User, Store, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/UI/badge';

interface MobileFooterProps {
  selectedClass?: any;
  setSelectedClass?: (classData: any) => void;
}

const MobileFooter: React.FC<MobileFooterProps> = ({ selectedClass, setSelectedClass }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Courses', path: '/catalog' },
    { icon: Store, label: 'Store', path: '/stationary' },
    { icon: Video, label: 'Videos', path: '/video-library' },
    { icon: User, label: 'Profile', path: user ? '/profile' : '/auth' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center px-3 py-2 min-w-0 flex-1 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                {item.path === '/cart' && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                )}
                {item.path === '/wishlist' && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs">
                    2
                  </Badge>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooter;
