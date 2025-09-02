import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import LiveClassRoom from '@/components/LiveClass/LiveClassRoom';
import AuthGuard from '@/components/Layout/AuthGuard';

const LiveClassPage = () => {
  return (
    <AuthGuard>
      <MainLayout>
        <LiveClassRoom />
      </MainLayout>
    </AuthGuard>
  );
};

export default LiveClassPage;
