
import React from 'react';
import { Loader2 } from 'lucide-react';

interface EducationalLoaderProps {
  message?: string;
  className?: string;
}

export function EducationalLoader({ message, className = "" }: EducationalLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-learn-purple" />
        <div className="absolute inset-0 rounded-full animate-ping-slow opacity-20 bg-learn-purple/50" />
      </div>
      {message && (
        <p className="mt-4 text-muted-foreground animate-pulse text-center max-w-[200px]">
          {message}
        </p>
      )}
    </div>
  );
}
