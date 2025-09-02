import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import LiveClassRoom from '@/components/LiveClass/LiveClassRoom';
import AuthGuard from '@/components/Layout/AuthGuard';
import LiveSessionAccessGuard from '@/components/Layout/LiveSessionAccessGuard';

const LiveClassSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <AuthGuard>
      <LiveSessionAccessGuard>
        <MainLayout>
          <LiveClassRoom sessionId={sessionId} />
        </MainLayout>
      </LiveSessionAccessGuard>
    </AuthGuard>
  );
};

export default LiveClassSessionPage;
