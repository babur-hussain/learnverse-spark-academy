
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SignupHero } from '@/components/Auth/SignupHero';
import { AuthDialog } from '@/components/Auth/AuthDialog';

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const mode = searchParams.get('mode') || 'signup';
  const referralCode = searchParams.get('ref') || '';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (mode === 'login') {
      setShowAuthDialog(true);
    }
  }, [mode]);

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AuthDialog 
          isOpen={showAuthDialog} 
          onClose={() => {
            setShowAuthDialog(false);
            navigate('/');
          }} 
          defaultTab="login"
        />
      </div>
    );
  }

  return <SignupHero />;
};

export default Auth;
