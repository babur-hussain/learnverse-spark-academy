
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/UI/badge';
import { PurchaseButton } from '@/components/UI/PurchaseButton';

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
  studentsCount?: number; // Add this prop to match what's used in SubjectCatalog
  onClick?: () => void;
  className?: string;
  tags?: string[]; // Add this prop to match what's used in SubjectCatalog
  lastUpdated?: Date; // Add this prop to match what's used in SubjectCatalog
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
        "flex flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md",
        !isPurchased && price !== 0 ? "cursor-default" : "cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
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
          </div>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex gap-4">
            {duration && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{duration}</span>
              </div>
            )}
            
            {rating !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="dark:text-gray-300">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {price !== undefined && (
            isPurchased ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Purchased
              </Badge>
            ) : (
              price === 0 ? (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Free
                </Badge>
              ) : (
                <PurchaseButton
                  courseId={id}
                  title={title}
                  amount={price}
                  className="bg-learn-purple hover:bg-learn-purple/90"
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
