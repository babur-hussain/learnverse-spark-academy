
import React from 'react';
import { Button } from './UI/button';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404 Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go Home
        </Button>
      </div>
    </MainLayout>
  );
};

export default ErrorPage;
