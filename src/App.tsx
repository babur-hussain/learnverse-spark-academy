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

function App() {
  console.log('App component rendering...');
  
  // Android back button handler
  useEffect(() => {
    const handler = CapApp.addListener('backButton', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
    return () => {
      handler.remove();
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
