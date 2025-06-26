
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/UI/input';
import useIsMobile from '@/hooks/use-mobile';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search...", 
  className = "",
  onSearch,
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const isMobile = useIsMobile();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
<<<<<<< HEAD
        className={`pl-9 pr-4 w-full bg-white dark:bg-gray-800 placeholder:text-gray-400 
          ${isMobile ? 'h-12 text-base rounded-xl' : 'h-10 rounded-md'}`}
=======
        className={`pl-10 pr-4 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm placeholder:text-gray-400 border-gray-200 dark:border-gray-700 focus:border-learn-purple dark:focus:border-purple-400 focus:ring-2 focus:ring-learn-purple/20 dark:focus:ring-purple-400/20 transition-all duration-300 
          ${isMobile ? 'h-12 text-base rounded-xl shadow-sm' : 'h-10 rounded-lg'}`}
>>>>>>> main
        value={query}
        onChange={handleInputChange}
        autoFocus={autoFocus && !isMobile} // Don't autofocus on mobile as it brings up keyboard
        autoComplete="off" // Better for mobile UX
        autoCorrect="off"
        spellCheck="false"
      />
    </div>
  );
};

export default SearchBar;
