
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/UI/tabs';
import { CategoryList } from './CategoryList';
import { FeaturedCategoriesList } from './FeaturedCategoriesList';

export function CategoryManager() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>
      
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">All Categories</TabsTrigger>
          <TabsTrigger value="featured">Featured Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <CategoryList />
        </TabsContent>
        
        <TabsContent value="featured">
          <FeaturedCategoriesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
