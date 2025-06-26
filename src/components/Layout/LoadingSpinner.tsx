
import React from 'react';
import { EducationalLoader } from '@/components/UI/educational-loader';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  className = "flex items-center justify-center h-32" 
}) => {
  return (
    <div className={className}>
      <EducationalLoader message={message} />
    </div>
  );
};

export default LoadingSpinner;
