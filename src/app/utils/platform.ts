import { Capacitor } from "@capacitor/core";

// More robust native detection for Capacitor WebView
export const isApp = (() => {
  try {
    if (Capacitor?.isNativePlatform?.()) return true;
    // Fallback for some environments
    const isFileScheme = typeof document !== 'undefined' && !!document.URL && document.URL.indexOf('http') !== 0;
    const platform = (Capacitor as any)?.getPlatform?.();
    return isFileScheme || (platform && platform !== 'web');
  } catch {
    return false;
  }
})();


