
import React, { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { GuardianProvider } from './contexts/GuardianContext';
import { PlatformProvider } from './contexts/PlatformContext';
import { Toaster } from '@/components/UI/toaster';
import { EducationalLoader } from '@/components/UI/educational-loader';
import { ToastProvider } from '@/hooks/use-toast';
import SafeErrorBoundary from '@/components/Layout/SafeErrorBoundary';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { NotificationsService } from './services/NotificationsService';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function PushTokenRegistrar() {
  const { user } = useAuth();
  useEffect(() => {
    NotificationsService.registerDeviceToken(user?.id ?? null).catch(() => {});
  }, [user]);
  return null;
}

function App() {
  console.log('App component rendering...');
  
  // Platform-specific status bar and layout configuration
  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        // Check if we're in dark mode and set appropriate colors
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // iOS-specific configuration
        if (Capacitor.getPlatform() === 'ios') {
          // For iOS, we want the status bar to NOT overlay the webview so it's visible
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          if (isDarkMode) {
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#1f2937' }); // Dark gray to match header
          } else {
            await StatusBar.setStyle({ style: Style.Dark });
            await StatusBar.setBackgroundColor({ color: '#ffffff' }); // White background
          }
          
          // Ensure status bar is visible and properly configured
          await StatusBar.show();
          console.log('iOS StatusBar configured with overlay: false');
        } else {
          // Android and other platforms
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          if (isDarkMode) {
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#09090b' });
          } else {
            await StatusBar.setStyle({ style: Style.Dark });
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
          }
        }
        
        console.log('Status bar configured successfully for', Capacitor.getPlatform());
      } catch (err) {
        console.log('Status bar configuration failed:', err);
        // ignore if plugin not available (web)
      }
    };

    configureStatusBar();

    let handler: any = null;
    
    const setupHandler = async () => {
      handler = await CapApp.addListener('backButton', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });
    };

    setupHandler();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []);

  return (
    <SafeErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <PlatformProvider>
            <AuthProvider>
              <GuardianProvider>
                <PushTokenRegistrar />
                <Suspense fallback={
                  <div className="flex items-center justify-center h-screen">
                    <EducationalLoader message="Preparing your learning experience..." />
                  </div>
                }>
                  <RouterProvider router={router} />
                </Suspense>
                <Toaster />
              </GuardianProvider>
            </AuthProvider>
          </PlatformProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeErrorBoundary>
  );
}

export default App;
