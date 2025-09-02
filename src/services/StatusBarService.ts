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
        style: isDarkMode ? Style.Dark : Style.Light 
      });
      
      await StatusBar.setBackgroundColor({ 
        color: isDarkMode ? '#000000' : '#ffffff' 
      });

      // Try to hide status bar completely
      try {
        await StatusBar.hide();
      } catch {
        // If hiding fails, try setting height to 0
        await StatusBar.setPadding({ top: 0, left: 0, right: 0, bottom: 0 });
      }
      
      // Add scroll event listener to prevent status bar from showing
      this.addScrollListener();
      
      // Add app state change listener
      this.addAppStateListener();
      
      // Force viewport adjustments
      this.adjustViewport();
      
      this.isConfigured = true;
      console.log('StatusBar configured successfully');
    } catch (error) {
      console.log('StatusBar configuration failed:', error);
      // Fallback to CSS-only solution
      this.fallbackCSSSolution();
    }
  }

  private adjustViewport(): void {
    // Force viewport adjustments for iOS
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    }
    
    // Add CSS variables for status bar height
    document.documentElement.style.setProperty('--status-bar-height', '0px');
    document.documentElement.style.setProperty('--safe-area-inset-top', '0px');
  }

  private fallbackCSSSolution(): void {
    // CSS-only fallback when StatusBar plugin fails
    this.adjustViewport();
    
    // Add CSS to hide status bar area
    const style = document.createElement('style');
    style.textContent = `
      body { 
        padding-top: 0 !important; 
        margin-top: 0 !important; 
      }
      #root { 
        padding-top: 0 !important; 
        margin-top: 0 !important; 
      }
      .app-header { 
        top: 0 !important; 
        margin-top: 0 !important; 
        padding-top: 0 !important; 
      }
      .status-bar-area { 
        height: 0 !important; 
        min-height: 0 !important; 
        display: none !important; 
      }
    `;
    document.head.appendChild(style);
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
        style: isDarkMode ? Style.Dark : Style.Light 
      });
      
      await StatusBar.setBackgroundColor({ 
        color: isDarkMode ? '#000000' : '#ffffff' 
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
