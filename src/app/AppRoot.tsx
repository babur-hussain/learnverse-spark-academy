import React, { Suspense, useEffect } from 'react';
import './index.css';
import AppRoutes from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { GuardianProvider } from '@/contexts/GuardianContext';
import { ToastProvider } from '@/hooks/use-toast';
import SafeErrorBoundary from '@/components/Layout/SafeErrorBoundary';
import { Toaster } from '@/components/UI/toaster';
import { EducationalLoader } from '@/components/UI/educational-loader';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsService } from './services/NotificationsService';

function PushTokenRegistrar() {
  const { user } = useAuth();
  useEffect(() => {
    NotificationsService.registerDeviceToken(user?.id ?? null).catch(() => {});
  }, [user]);
  return null;
}

export default function AppRoot() {
  useEffect(() => {
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
      try {
        handler = await CapApp.addListener('backButton', () => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        });
      } catch {}
    };
    setupHandler();

    return () => {
      if (handler) handler.remove();
    };
  }, []);

  // push registration handled inside PushTokenRegistrar within providers

  return (
    <SafeErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <GuardianProvider>
            <PushTokenRegistrar />
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><EducationalLoader message="Loading..." /></div>}>
              <AppRoutes />
            </Suspense>
            <Toaster />
          </GuardianProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeErrorBoundary>
  );
}


