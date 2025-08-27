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

function WebRoot() {
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


