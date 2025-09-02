import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';
import { Home, BookOpen, Video, FileText, ShoppingBag, Coffee, Baby, Headphones } from 'lucide-react';

const MobileFooter = () => {
  const location = useLocation();
  const { platform } = usePlatform();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);

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

  // Handle scroll events for custom scrollbar
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollbar = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;
      const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollPosition(scrollPercentage);
      setShowScrollbar(maxScroll > 0);
    };

    updateScrollbar();
    container.addEventListener('scroll', updateScrollbar);
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollbar);
      resizeObserver.disconnect();
    };
  }, [navItems.length]);

  // Platform-specific styling
  const getFooterPadding = () => {
    if (platform.isIOS) {
      return 'pb-12'; // Extra padding for iOS safe area + scrollbar
    }
    return 'pb-10'; // Extra padding for scrollbar visibility
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
      <div className="w-full">
        <div 
          ref={scrollContainerRef}
          className="w-full overflow-x-auto mobile-footer-scrollable scrollbar-hide"
        >
          <nav className={`flex items-center px-2 ${getNavGap()}`} style={{ width: `${navItems.length * 70}px` }}>
            {navItems.map((item) => renderNavItem(item))}
          </nav>
        </div>
        
        {/* Custom visible scrollbar */}
        {showScrollbar && (
          <div className="relative w-full px-4 py-2">
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-1 bg-gray-500 dark:bg-gray-400 rounded-full transition-all duration-150 ease-out"
                style={{ 
                  width: '25%', // Represents visible area (roughly 5 icons out of total)
                  transform: `translateX(${scrollPosition * 300}%)` // Adjust multiplier based on content
                }}
              />
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default MobileFooter;
