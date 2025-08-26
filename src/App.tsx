
import React, { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { GuardianProvider } from './contexts/GuardianContext';
import { Toaster } from '@/components/UI/toaster';
import { EducationalLoader } from './components/UI/educational-loader';
import { ToastProvider } from '@/hooks/use-toast';
import SafeErrorBoundary from './components/Layout/SafeErrorBoundary';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

function App() {
  console.log('App component rendering...');
  
  // Android back button handler
  useEffect(() => {
    // Configure StatusBar so content doesn't draw under it
    const configureStatusBar = async () => {
      try {
        // Ensure status bar doesn't overlay the webview
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        // Check if we're in dark mode and set appropriate colors
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        if (isDarkMode) {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#09090b' }); // Dark background to match theme
        } else {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' }); // White background to match theme
        }
        
        console.log('Status bar configured successfully');
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
      <ToastProvider>
        <AuthProvider>
          <GuardianProvider>
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
      </ToastProvider>
    </SafeErrorBoundary>
  );
}

export default App;
