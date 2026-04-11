
import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Get the actual resolved theme (light or dark)
  const getResolvedTheme = useCallback((theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, []);

  // Apply theme to DOM
  const applyTheme = useCallback((theme: Theme) => {
    const resolved = getResolvedTheme(theme);
    
    // Remove both classes first
    document.documentElement.classList.remove('light', 'dark');
    
    // Add the resolved theme class
    document.documentElement.classList.add(resolved);
    
    // Set data attribute for additional styling
    document.documentElement.setAttribute('data-theme', resolved);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolved === 'dark' ? '#09090b' : '#ffffff');
    }
    
    // Update status bar if available
    if (window.StatusBar) {
      try {
        window.StatusBar.setStyle(resolved === 'dark' ? 'light' : 'dark');
        window.StatusBar.setBackgroundColor({ color: resolved === 'dark' ? '#09090b' : '#ffffff' });
      } catch (error) {
        console.log('StatusBar not available for theme update');
      }
    }
    
    setResolvedTheme(resolved);
  }, [getResolvedTheme]);

  // Initialize theme on mount
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system preference
      setTheme('system');
      applyTheme('system');
    }
  }, [applyTheme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }, [resolvedTheme, applyTheme]);

  // Set specific theme
  const setSpecificTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Reset to system preference
  const resetToSystem = useCallback(() => {
    setTheme('system');
    localStorage.removeItem('theme');
    applyTheme('system');
  }, [applyTheme]);

  return { 
    theme, 
    resolvedTheme,
    toggleTheme, 
    setTheme: setSpecificTheme,
    resetToSystem,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system'
  };
}
