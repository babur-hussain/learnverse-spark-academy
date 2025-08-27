
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/UI/button';
import { ArrowRight, Brain, Target, BarChart } from 'lucide-react';

const PersonalizedLearningPromo = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Personalized Learning Experience</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered system adapts to your unique learning style, pace, and needs to create a truly personalized educational journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-background p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Learning Path</h3>
            <p className="text-muted-foreground mb-4">
              Receive custom-tailored learning paths based on your diagnostic assessment, learning style, and goals.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Adaptive Content</h3>
            <p className="text-muted-foreground mb-4">
              Get recommendations that automatically adjust based on your performance and preferences.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Analytics</h3>
            <p className="text-muted-foreground mb-4">
              Track your progress with detailed analytics and insights to see your improvement over time.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/personalized-learning">
              Start Your Personalized Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PersonalizedLearningPromo;
