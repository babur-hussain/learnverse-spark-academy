import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import LiveClassRoom from '@/components/LiveClass/LiveClassRoom';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';
import LiveSessionAccessGuard from '@/components/Layout/LiveSessionAccessGuard';

const LiveClassSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const isMobile = useIsMobile();

  return (
    <AuthGuard>
      <LiveSessionAccessGuard>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <LiveClassRoom sessionId={sessionId} />
          </main>
          {isMobile && <MobileFooter />}
        </div>
      </LiveSessionAccessGuard>
    </AuthGuard>
  );
};

export default LiveClassSessionPage;
