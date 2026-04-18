
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
