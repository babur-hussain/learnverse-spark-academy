
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ForumCategory } from '@/types/forum';

interface ForumCategoriesListProps {
  categories: ForumCategory[];
  currentCategory: ForumCategory | null;
}

const ForumCategoriesList = ({ categories, currentCategory }: ForumCategoriesListProps) => {
  return (
    <div className="space-y-1">
      <Link
        to="/forum"
        className={cn(
          "flex items-center px-3 py-2 rounded-md text-sm hover:bg-secondary",
          !currentCategory && "bg-secondary font-medium"
        )}
      >
        All Categories
      </Link>
      
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/forum/category/${category.slug}`}
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm hover:bg-secondary",
            currentCategory?.id === category.id && "bg-secondary font-medium"
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
};

export default ForumCategoriesList;
