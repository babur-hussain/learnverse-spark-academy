
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/integrations/api/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  sku?: string;
  brand_id?: string;
  category_id?: string;
  price: number;
  original_price?: number;
  currency: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  tags?: string[];
  features?: string[];
  created_at: string;
  updated_at: string;
  brand?: { name: string; logo_url?: string };
  category?: { name: string; slug: string };
  images?: ProductImage[];
  rating?: number;
  review_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  order_index: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  is_active: boolean;
  order_index: number;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
}

export const useProducts = (filters?: {
  category_id?: string;
  brand_id?: string;
  search?: string;
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.category_id) params.category_id = filters.category_id;
      if (filters?.brand_id) params.brand_id = filters.brand_id;
      if (filters?.search) params.search = filters.search;
      if (filters?.featured) params.featured = 'true';

      const { data } = await apiClient.get('/api/products', { params });
      return data as Product[];
    },
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/products/categories');
      return data as ProductCategory[];
    },
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/products/brands');
      return data as Brand[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/products/${id}`);
      return data as Product;
    },
  });
};
