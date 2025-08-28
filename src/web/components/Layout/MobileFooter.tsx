import React from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Video, FileText, ShoppingBag, Baby, Headphones, Coffee } from 'lucide-react';

/**
 * Web-only bottom navigation with horizontal scrolling
 * - Fixed at bottom-5 (20px from bottom)
 * - Always shows full icon + label (min height)
 * - Smooth horizontal scroll with visible scrollbar
 */
const MobileFooter: React.FC = () => {
  const location = useLocation();

  const items = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Courses', path: '/catalog' },
    { icon: Video, label: 'Live', path: '/live-class' },
    { icon: FileText, label: 'Notes', path: '/notes' },
    { icon: ShoppingBag, label: 'Stationary', path: '/stationary' },
    { icon: Baby, label: 'Kids', path: '/kids' },
    { icon: Headphones, label: 'Audio', path: '/audio' },
    { icon: Coffee, label: 'Cafes', path: '/cafes' },
  ];

  const footer = (
    <footer className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-auto bg-background/95 backdrop-blur-md border-t border-border">
      {/* Scroll container touching both sides like header */}
      <div className="w-full overflow-x-auto overflow-y-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
        <nav className="flex items-center gap-1.5 px-2 py-2 min-h-[68px]" style={{ minWidth: 'max-content' }}>
          {items.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-md flex-shrink-0 min-w-[72px] transition-colors ${
                  active
                    ? 'bg-purple-50 text-learn-purple dark:bg-purple-900/20 dark:text-purple-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60'
                }`}
                aria-label={label}
              >
                <Icon size={18} />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );

  // Render via portal to escape any parent overflow/transform on homepage
  if (typeof document !== 'undefined') {
    return createPortal(footer, document.body);
  }

  return footer;
};

export default MobileFooter;


