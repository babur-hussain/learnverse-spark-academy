import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/UI/tabs';
import { ProductsManager } from './ProductsManager';
import { CategoriesManager } from './CategoriesManager';
import { BrandsManager } from './BrandsManager';
import { OrdersManager } from './OrdersManager';
import { InventoryManager } from './InventoryManager';

export function EcommerceManager() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ecommerce Management</h1>
      
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <ProductsManager />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>
        
        <TabsContent value="brands">
          <BrandsManager />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersManager />
        </TabsContent>
        
        <TabsContent value="inventory">
          <InventoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}