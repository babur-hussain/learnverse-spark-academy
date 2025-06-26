import MainLayout from '@/components/Layout/MainLayout';
import React, { useEffect } from 'react';

const socialLinks = [
  { href: 'https://twitter.com/', label: 'Twitter', icon: '🐦' },
  { href: 'https://facebook.com/', label: 'Facebook', icon: '📘' },
  { href: 'https://instagram.com/', label: 'Instagram', icon: '📸' },
];

const AnimatedBackground = () => (
  <>
    <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300 opacity-30 rounded-full animate-float-slow blur-2xl z-0" />
    <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-300 opacity-20 rounded-full animate-float-fast blur-2xl z-0" />
    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-300 opacity-20 rounded-full animate-float-medium blur-2xl z-0" />
  </>
);

const ComingSoon = () => {
  useEffect(() => {
    document.title = "Coming Soon | Spark Academy";
  }, []);

  return (
    <MainLayout>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-200 via-blue-100 to-pink-100 dark:from-purple-900 dark:via-blue-900 dark:to-pink-900 overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-900/80 border border-purple-200 dark:border-purple-800 backdrop-blur-md max-w-lg w-full">
          <h1 className="text-5xl md:text-6xl font-extrabold text-purple-700 dark:text-purple-200 mb-6 flex items-center justify-center gap-3">
            <span role="img" aria-label="Rocket">🚀</span> Coming Soon!
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8 font-medium">We're working hard to bring you something amazing.<br/>Stay tuned for updates!</p>
          <a href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200">Back to Home</a>
          <div className="mt-8 flex justify-center gap-6">
            {socialLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl hover:scale-125 transition-transform duration-200"
                aria-label={link.label}
              >
                <span role="img" aria-label={link.label}>{link.icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.03); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-50px) scale(1.1); }
        }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 9s ease-in-out infinite; }
        .animate-glow {
          text-shadow: 0 0 8px #a78bfa, 0 0 16px #f472b6, 0 0 32px #60a5fa;
        }
      `}</style>
    </MainLayout>
  );
};

export const ComingSoonInline = ({ message = "This feature is coming soon! Stay tuned for updates." }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 rounded-2xl shadow-md border border-purple-200 dark:border-purple-800 max-w-md mx-auto">
    <div className="text-4xl mb-2 animate-glow">🚀</div>
    <div className="text-lg font-semibold text-purple-700 dark:text-purple-200 text-center mb-1">Coming Soon</div>
    <div className="text-sm text-gray-700 dark:text-gray-200 text-center">{message}</div>
  </div>
);

export default ComingSoon;
