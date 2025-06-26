
import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { GuardianProvider } from './contexts/GuardianContext';
import { Toaster } from '@/components/UI/toaster';
import { EducationalLoader } from './components/UI/educational-loader';
import { ToastProvider } from '@/hooks/use-toast';
<<<<<<< HEAD
import ErrorBoundary from './components/ErrorBoundary';
=======
import SafeErrorBoundary from './components/Layout/SafeErrorBoundary';
>>>>>>> main

function App() {
  console.log('App component rendering...');
  
  return (
<<<<<<< HEAD
    <ErrorBoundary>
=======
    <SafeErrorBoundary>
>>>>>>> main
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
<<<<<<< HEAD
    </ErrorBoundary>
=======
    </SafeErrorBoundary>
>>>>>>> main
  );
}

export default App;
