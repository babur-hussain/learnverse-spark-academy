import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Video, FileText, ShoppingBag, Coffee, Baby, Headphones } from 'lucide-react';

const MobileFooter = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Courses', path: '/catalog' },
    { icon: Video, label: 'Live', path: '/live-class' },
    { icon: FileText, label: 'Notes', path: '/notes' },
    { icon: ShoppingBag, label: 'Stationary', path: '/stationary' },
    { icon: Baby, label: 'Kids', path: '/kids' },
    { icon: Headphones, label: 'Audio', path: '/audio' },
    { icon: Coffee, label: 'Cafes', path: '/cafes' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pt-2 pb-6 shadow-lg">
      <div className="w-full overflow-x-auto">
        <nav className="mobile-footer-nav flex items-center justify-start w-full px-4 gap-2 whitespace-nowrap min-w-max">
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
      </div>
    </footer>
  );
};

export default MobileFooter;
