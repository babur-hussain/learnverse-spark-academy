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
import StatusBarService from '../../services/StatusBarService';
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
        // Use the StatusBar service for better control
        await StatusBarService.getInstance().configureStatusBar();
      } catch (error) {
        console.log('StatusBar configuration failed:', error);
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


