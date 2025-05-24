
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Mail, Bell, BookOpen, Users } from 'lucide-react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const benefits = [
    { icon: <BookOpen className="h-5 w-5" />, text: "Latest Course Updates" },
    { icon: <Bell className="h-5 w-5" />, text: "Career Tips & Insights" },
    { icon: <Users className="h-5 w-5" />, text: "Community Highlights" },
    { icon: <Mail className="h-5 w-5" />, text: "Exclusive Offers" }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-teal-500 to-blue-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">
            Stay Updated with <span className="text-teal-200">LearnVerse</span>
          </h2>
          <p className="text-xl text-blue-100">
            Get the latest updates on courses, career tips, and exclusive offers delivered to your inbox.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="bg-white/20 rounded-full p-3">
                <div className="text-white">
                  {benefit.icon}
                </div>
              </div>
              <span className="text-sm text-blue-100">{benefit.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            required
          />
          <Button 
            type="submit"
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            Subscribe
          </Button>
        </form>

        <p className="text-sm text-blue-200 mt-4">
          Join 50,000+ students already subscribed to our newsletter
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
