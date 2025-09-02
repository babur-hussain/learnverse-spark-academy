import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';
import { Home, BookOpen, Video, FileText, ShoppingBag, Coffee, Baby, Headphones } from 'lucide-react';

const MobileFooter = () => {
  const location = useLocation();
  const { platform } = usePlatform();

  // Platform-specific navigation items
  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: 'Home', path: '/' },
      { icon: BookOpen, label: 'Courses', path: '/catalog' },
      { icon: Video, label: 'Live', path: '/live-class' },
      { icon: FileText, label: 'Notes', path: '/notes' },
    ];

    // Add platform-specific items
    if (platform.isWeb) {
      baseItems.push(
        { icon: ShoppingBag, label: 'Stationary', path: '/stationary' },
        { icon: Coffee, label: 'Cafes', path: '/cafes' }
      );
    }

    if (platform.isMobile) {
      baseItems.push(
        { icon: Baby, label: 'Kids', path: '/kids' },
        { icon: Headphones, label: 'Audio', path: '/audio' }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();
  
  // All items are scrollable, showing 5 at a time
  const maxVisibleIcons = 5;

  // Platform-specific styling
  const getFooterPadding = () => {
    if (platform.isIOS) {
      return 'pb-12'; // Extra padding for iOS safe area + scroll indicators
    }
    return 'pb-10'; // Extra padding for scroll indicators
  };

  const getNavGap = () => {
    if (platform.isMobile) {
      return platform.isIOS ? 'gap-1' : 'gap-2';
    }
    return 'gap-2';
  };

  const renderNavItem = (item: any) => {
    const isActive = location.pathname === item.path;
    
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[70px] flex-shrink-0 whitespace-nowrap rounded-lg transition-all duration-300 ${
          isActive 
            ? 'text-learn-purple dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-105' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        aria-label={item.label}
      >
        <item.icon 
          size={18} 
          className={`transition-all duration-300 ${isActive ? 'animate-scale-in' : 'group-hover:scale-110'}`} 
        />
        <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'font-semibold' : ''} truncate`}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <footer className={`mobile-footer fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 pt-2 ${getFooterPadding()} shadow-lg safe-area-bottom`}>
      <div className="w-full overflow-x-auto scrollbar-hide mobile-footer-scrollable">
        <nav className={`flex items-center px-2 ${getNavGap()}`} style={{ width: `${navItems.length * 70}px` }}>
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </div>
      
      {/* Scroll indicators */}
      {navItems.length > maxVisibleIcons && (
        <div className="flex justify-center pt-1 pb-1">
          <div className="flex space-x-1">
            {Array.from({ length: Math.ceil(navItems.length / maxVisibleIcons) }).map((_, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"
              />
            ))}
          </div>
        </div>
      )}
    </footer>
  );
};

export default MobileFooter;
