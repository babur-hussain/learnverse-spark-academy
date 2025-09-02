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

  // Platform-specific styling
  const getFooterPadding = () => {
    if (platform.isIOS) {
      return 'pb-8'; // Extra padding for iOS safe area
    }
    return 'pb-6';
  };

  const getNavGap = () => {
    if (platform.isMobile) {
      return platform.isIOS ? 'gap-1' : 'gap-2';
    }
    return 'gap-2';
  };

  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pt-2 ${getFooterPadding()} shadow-lg`}>
      <div className="w-full overflow-x-auto">
        <nav className={`mobile-footer-nav flex items-center justify-start w-full px-4 ${getNavGap()} whitespace-nowrap min-w-max`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 flex-shrink-0 min-w-[80px] whitespace-nowrap rounded-lg transition-all duration-300 ${
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
                <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        
        {/* Platform-specific feature indicator */}
        {platform.isMobile && (
          <div className="px-4 mt-2">
            <div className="text-center">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                platform.isIOS 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {platform.isIOS ? '🍎' : '🤖'}
                <span className="ml-1">
                  {platform.isIOS ? 'iOS Optimized' : 'Android Optimized'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default MobileFooter;
