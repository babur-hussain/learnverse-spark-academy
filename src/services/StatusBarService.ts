import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

class StatusBarService {
  private static instance: StatusBarService;
  private isConfigured = false;

  private constructor() {}

  public static getInstance(): StatusBarService {
    if (!StatusBarService.instance) {
      StatusBarService.instance = new StatusBarService();
    }
    return StatusBarService.instance;
  }

  public async configureStatusBar(): Promise<void> {
    if (this.isConfigured) return;

    try {
      // Force status bar to not overlay web view
      await StatusBar.setOverlaysWebView({ overlay: false });
      
      // Set initial style and background
      const isDarkMode = document.documentElement.classList.contains('dark');
      await StatusBar.setStyle({ 
        style: isDarkMode ? Style.Light : Style.Dark 
      });
      
      await StatusBar.setBackgroundColor({ 
        color: isDarkMode ? '#09090b' : '#ffffff' 
      });

      // Show status bar with proper styling
      try {
        await StatusBar.show();
        // Set minimal padding to ensure status bar is visible
        await StatusBar.setPadding({ top: 0, left: 0, right: 0, bottom: 0 });
      } catch {
        // If showing fails, ensure status bar is visible
        console.log('StatusBar show failed, ensuring visibility');
      }
      
      // Add scroll event listener to prevent status bar from showing
      this.addScrollListener();
      
      // Add app state change listener
      this.addAppStateListener();
      
      // Add theme change listener
      this.addThemeChangeListener();
      
      // Force viewport adjustments
      this.adjustViewport();
      
      this.isConfigured = true;
      console.log('StatusBar configured successfully');
    } catch (error) {
      console.log('StatusBar configuration failed:', error);
      // Don't use fallback CSS solution as it interferes with status bar visibility
    }
  }

  private adjustViewport(): void {
    // Force viewport adjustments for iOS
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    }
    
    // Set proper status bar height for iOS (approximately 47px for status bar + Dynamic Island)
    const statusBarHeight = '30px';
    const safeAreaTop = '30px';
    document.documentElement.style.setProperty('--status-bar-height', statusBarHeight);
    document.documentElement.style.setProperty('--safe-area-inset-top', safeAreaTop);
  }



  private addScrollListener(): void {
    let lastScrollTop = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // If scrolling down, ensure status bar stays visible
      if (scrollTop > lastScrollTop && scrollTop > 10) {
        this.showStatusBar();
      }

      lastScrollTop = scrollTop;

      // Set timeout to ensure status bar stays visible after scrolling stops
      scrollTimeout = setTimeout(() => {
        this.showStatusBar();
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private addAppStateListener(): void {
    try {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // App came to foreground, ensure status bar is visible
          setTimeout(() => {
            this.showStatusBar();
          }, 100);
        }
      });
    } catch (error) {
      console.log('App state listener not available:', error);
    }
  }

  private addThemeChangeListener(): void {
    try {
      // Listen for theme changes in the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains('dark')) {
              // Theme changed to dark
              this.updateTheme(true);
            } else {
              // Theme changed to light
              this.updateTheme(false);
            }
          }
        });
      });

      // Start observing the document element for class changes
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      // Also listen for localStorage changes
      window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
          const newTheme = e.newValue as string;
          this.updateTheme(newTheme === 'dark');
        }
      });

      console.log('Theme change listener added');
    } catch (error) {
      console.log('Theme change listener not available:', error);
    }
  }

  private async hideStatusBar(): Promise<void> {
    try {
      await StatusBar.hide();
    } catch (error) {
      // Ignore errors
    }
  }

  public async updateTheme(isDarkMode: boolean): Promise<void> {
    try {
      // Update status bar style based on theme
      await StatusBar.setStyle({ 
        style: isDarkMode ? Style.Light : Style.Dark 
      });
      
      // Update status bar background color based on theme
      await StatusBar.setBackgroundColor({ 
        color: isDarkMode ? '#09090b' : '#ffffff' 
      });
      
      // Ensure status bar stays visible with new theme
      await this.showStatusBar();
      
      console.log('StatusBar theme updated:', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.log('Theme update failed:', error);
    }
  }

  public async showStatusBar(): Promise<void> {
    try {
      await StatusBar.show();
    } catch (error) {
      console.log('Show status bar failed:', error);
    }
  }
}

export default StatusBarService;
