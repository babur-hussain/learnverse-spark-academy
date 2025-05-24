
import React from 'react';
import { Card, CardContent } from '@/components/UI/card';
import { MessageCircle, FileText, Video, Laptop } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  darkBgColor: string;
  imageSrc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, bgColor, darkBgColor, imageSrc }) => {
  return (
    <div className="flex flex-col h-full">
      <Card className={`overflow-hidden border-none h-full ${bgColor} ${darkBgColor} flex flex-col`}>
        <div className="p-6 flex-1">
          <div className="relative h-48 mb-4 flex items-center justify-center">
            <img
              src={imageSrc}
              alt={title}
              className="w-full max-h-48 object-contain"
            />
          </div>
          <h3 className="text-2xl font-bold mt-4 dark:text-white">{title}</h3>
          <div className="mt-2 text-gray-600 dark:text-gray-300">{description}</div>
        </div>
      </Card>
    </div>
  );
};

const FeatureCards: React.FC = () => {
  const features = [
    {
      title: "Daily live classes",
      description: "Chat with educators, ask questions, answer live polls, and get your doubts cleared - all while the class is going on",
      icon: <MessageCircle className="h-6 w-6" />,
      bgColor: "bg-blue-100",
      darkBgColor: "dark:bg-blue-900/30",
      imageSrc: "/public/lovable-uploads/1569b805-6435-4733-a347-b3da28d83dc0.png"
    },
    {
      title: "Practice and revise",
      description: "Learning isn't just limited to classes with our practice section, mock tests and lecture notes shared as PDFs for your revision",
      icon: <FileText className="h-6 w-6" />,
      bgColor: "bg-pink-100",
      darkBgColor: "dark:bg-pink-900/30",
      imageSrc: "/public/lovable-uploads/975abd52-dbd2-46db-9a22-99c1f432c985.png"
    },
    {
      title: "Learn anytime, anywhere",
      description: "One subscription gets you access to all our live and recorded classes to watch from the comfort of any of your devices",
      icon: <Video className="h-6 w-6" />,
      bgColor: "bg-yellow-100",
      darkBgColor: "dark:bg-yellow-900/30",
      imageSrc: "/public/lovable-uploads/d7669345-f691-4da8-8d7d-c7b80f50b033.png"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              bgColor={feature.bgColor}
              darkBgColor={feature.darkBgColor}
              imageSrc={feature.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
