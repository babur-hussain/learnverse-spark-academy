
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Video, FileText } from 'lucide-react';

const MobileFooter = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Courses', path: '/catalog' },
    { icon: Video, label: 'Live', path: '/live-class' },
    { icon: FileText, label: 'Notes', path: '/notes' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 pb-safe shadow-lg">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-2 px-5 rounded-lg transition-all ${
                isActive 
                  ? 'text-learn-purple dark:text-purple-400 bg-gray-100 dark:bg-gray-800' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              aria-label={item.label}
            >
              <item.icon size={22} className={isActive ? 'animate-scale-in' : ''} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default MobileFooter;
