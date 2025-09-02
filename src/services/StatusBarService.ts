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

      // Ensure status bar is hidden initially
      await StatusBar.hide();
      
      // Add scroll event listener to prevent status bar from showing
      this.addScrollListener();
      
      // Add app state change listener
      this.addAppStateListener();
      
      this.isConfigured = true;
      console.log('StatusBar configured successfully');
    } catch (error) {
      console.log('StatusBar configuration failed:', error);
    }
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

      // If scrolling down, ensure status bar stays hidden
      if (scrollTop > lastScrollTop && scrollTop > 10) {
        this.hideStatusBar();
      }

      lastScrollTop = scrollTop;

      // Set timeout to hide status bar after scrolling stops
      scrollTimeout = setTimeout(() => {
        this.hideStatusBar();
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private addAppStateListener(): void {
    try {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // App came to foreground, ensure status bar is hidden
          setTimeout(() => {
            this.hideStatusBar();
          }, 100);
        }
      });
    } catch (error) {
      console.log('App state listener not available:', error);
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
      await StatusBar.setStyle({ 
        style: isDarkMode ? Style.Light : Style.Dark 
      });
      
      await StatusBar.setBackgroundColor({ 
        color: isDarkMode ? '#09090b' : '#ffffff' 
      });
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
