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

export default function AppRoot() {
  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        const isDarkMode = document.documentElement.classList.contains('dark');
        if (isDarkMode) {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#09090b' });
        } else {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
      } catch {
        // plugin may not be available in web
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

  return (
    <SafeErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <GuardianProvider>
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


