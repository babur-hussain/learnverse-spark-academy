import React from 'react';
import SmartSearchbar from '../Search/SmartSearchbar';
import { Brain } from 'lucide-react';
import { TooltipProvider } from '@/components/UI/tooltip';

const AIHero: React.FC = () => {
  return (
    <TooltipProvider>
      <section className="relative bg-gradient-to-b from-background to-background/80 pt-6 pb-8 md:pt-12 md:pb-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Brain className="h-6 w-6" />
              <span className="text-lg font-medium">AI-Powered Learning Assistant</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
              Learn Smarter with LearnVerse AI
            </h1>
            <p className="text-muted-foreground max-w-2xl mb-6">
              Ask any question, upload documents, or get help with concepts.
              Our AI-powered learning assistant provides instant, accurate answers to help you excel in your studies.
            </p>
          </div>
          
          <SmartSearchbar />
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Supports PDF, Word docs, images and text files up to 5MB
            </p>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default AIHero;
