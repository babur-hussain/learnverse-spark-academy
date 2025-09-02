import React, { Suspense, useEffect } from 'react';
import WebRoutes from './routes';
import './index.css';
import './App.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { GuardianProvider } from '@/contexts/GuardianContext';
import { Toaster } from '@/components/UI/toaster';
import { EducationalLoader } from '@/components/UI/educational-loader';
import { ToastProvider } from '@/hooks/use-toast';
import SafeErrorBoundary from '@/components/Layout/SafeErrorBoundary';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { supabase } from '@/integrations/supabase/client';

function WebRoot() {
  useEffect(() => {
    // Ensure any invalid/stale auth states are cleared to prevent refresh errors
    supabase.auth.getSession().then(({ error }) => {
      if (error) {
        supabase.auth.signOut().catch(() => {});
      }
    });

    const configureStatusBar = async () => {
      try {
        // Ensure status bar doesn't overlay the web view
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        // Set status bar style based on current theme
        const isDarkMode = document.documentElement.classList.contains('dark');
        if (isDarkMode) {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#09090b' });
        } else {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
        
        // Set status bar height for proper spacing
        await StatusBar.setPadding({ top: 0, left: 0, right: 0, bottom: 0 });
      } catch (error) {
        // Plugin may not be available in web environment
        console.log('StatusBar plugin not available:', error);
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
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><EducationalLoader message="Preparing your learning experience..." /></div>}>
              <WebRoutes />
            </Suspense>
            <Toaster />
          </GuardianProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeErrorBoundary>
  );
}

export default WebRoot;


