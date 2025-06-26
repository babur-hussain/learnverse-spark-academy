
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/UI/badge';
import { PurchaseButton } from '@/components/UI/PurchaseButton';
<<<<<<< HEAD
=======
import useIsMobile from '@/hooks/use-mobile';
>>>>>>> main

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  lessons_count: number;
  duration: string;
  rating: number;
  price?: number;
  instructor?: {
    name: string;
    avatar_url?: string;
  };
}

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  image?: string;
  instructor?: {
    name: string;
    avatar?: string;
  };
  duration?: string;
  rating?: number;
  price?: number;
  isPurchased?: boolean;
<<<<<<< HEAD
  studentsCount?: number; // Add this prop to match what's used in SubjectCatalog
  onClick?: () => void;
  className?: string;
  tags?: string[]; // Add this prop to match what's used in SubjectCatalog
  lastUpdated?: Date; // Add this prop to match what's used in SubjectCatalog
=======
  studentsCount?: number;
  onClick?: () => void;
  className?: string;
  tags?: string[];
  lastUpdated?: Date;
>>>>>>> main
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  image = '/placeholder.svg',
  instructor,
  duration,
  rating,
  price,
  isPurchased,
  studentsCount,
  onClick,
  className,
  tags,
  lastUpdated
}) => {
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const isMobile = useIsMobile();
>>>>>>> main

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (isPurchased || price === 0) {
      navigate(`/course/${id}`);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div 
      className={cn(
<<<<<<< HEAD
        "flex flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md",
        !isPurchased && price !== 0 ? "cursor-default" : "cursor-pointer",
=======
        "flex flex-col overflow-hidden rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50",
        !isPurchased && price !== 0 ? "cursor-default" : "cursor-pointer hover:-translate-y-1 hover:scale-[1.02]",
        isMobile && "touch-feedback",
>>>>>>> main
        className
      )}
      onClick={handleClick}
    >
<<<<<<< HEAD
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        {!isPurchased && price !== 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Lock className="h-8 w-8 text-white opacity-75" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col p-4">
        <h3 className="font-medium text-lg mb-2 line-clamp-1 dark:text-gray-100">{title}</h3>
        
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{description}</p>
        )}
        
        {instructor && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback>{instructor.name ? getInitials(instructor.name) : "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 dark:text-gray-300">{instructor.name}</span>
=======
      <div className={`relative ${isMobile ? 'aspect-video' : 'aspect-video'} overflow-hidden`}>
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {!isPurchased && price !== 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <Lock className="h-6 w-6 md:h-8 md:w-8 text-white opacity-75" />
          </div>
        )}
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
      
      <div className={`flex flex-col ${isMobile ? 'p-3' : 'p-4'} flex-grow`}>
        <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} mb-2 line-clamp-2 text-gray-900 dark:text-gray-100 leading-tight`}>
          {title}
        </h3>
        
        {description && (
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed`}>
            {description}
          </p>
        )}
        
        {instructor && (
          <div className={`flex items-center gap-2 mb-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <Avatar className={isMobile ? 'h-5 w-5' : 'h-6 w-6'}>
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback className="text-xs">{instructor.name ? getInitials(instructor.name) : "U"}</AvatarFallback>
            </Avatar>
            <span className="text-gray-600 dark:text-gray-300 line-clamp-1">{instructor.name}</span>
>>>>>>> main
          </div>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-2">
<<<<<<< HEAD
          <div className="flex gap-4">
            {duration && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
=======
          <div className="flex gap-3">
            {duration && (
              <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                <Clock className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
>>>>>>> main
                <span>{duration}</span>
              </div>
            )}
            
            {rating !== undefined && (
<<<<<<< HEAD
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="dark:text-gray-300">{rating.toFixed(1)}</span>
=======
              <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <Star className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} fill-yellow-400 text-yellow-400`} />
                <span className="text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
>>>>>>> main
              </div>
            )}
          </div>
          
          {price !== undefined && (
            isPurchased ? (
<<<<<<< HEAD
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
=======
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
>>>>>>> main
                Purchased
              </Badge>
            ) : (
              price === 0 ? (
<<<<<<< HEAD
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
=======
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
>>>>>>> main
                  Free
                </Badge>
              ) : (
                <PurchaseButton
<<<<<<< HEAD
                  courseId={id}
                  title={title}
                  amount={price}
                  className="bg-learn-purple hover:bg-learn-purple/90"
=======
                  itemType="course"
                  itemId={id}
                  title={title}
                  amount={price}
                  className={`bg-learn-purple hover:bg-learn-purple/90 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm'}`}
                  size={isMobile ? 'sm' : 'default'}
>>>>>>> main
                />
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
