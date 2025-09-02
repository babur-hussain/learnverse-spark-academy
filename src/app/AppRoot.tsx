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
import StatusBarService from '../services/StatusBarService';
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
        // Use the StatusBar service for better control
        await StatusBarService.getInstance().configureStatusBar();
      } catch (error) {
        console.log('StatusBar configuration failed:', error);
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


