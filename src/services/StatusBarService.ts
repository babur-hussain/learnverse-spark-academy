class StatusBarService {
  private static instance: StatusBarService;

  private constructor() {}

  public static getInstance(): StatusBarService {
    if (!StatusBarService.instance) {
      StatusBarService.instance = new StatusBarService();
    }
    return StatusBarService.instance;
  }

  public async configureStatusBar(): Promise<void> {
    // Web implementation - do nothing
    this.adjustViewport();
  }

  private adjustViewport(): void {
    // Force viewport adjustments for iOS Safari
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    }
    
    // Set proper status bar height variables
    const statusBarHeight = '0px';
    const safeAreaTop = '0px';
    document.documentElement.style.setProperty('--status-bar-height', statusBarHeight);
    document.documentElement.style.setProperty('--safe-area-inset-top', safeAreaTop);
  }

  public async updateTheme(isDarkMode: boolean): Promise<void> {
    // Web implementation - do nothing
  }

  public async showStatusBar(): Promise<void> {
    // Web implementation - do nothing
  }
}

export default StatusBarService;
