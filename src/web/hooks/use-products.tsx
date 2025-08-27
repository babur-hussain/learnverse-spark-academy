
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      let query = supabase
        .from('products')
        .select(`
          *,
          brand:brands(name, logo_url),
          category:product_categories(name, slug),
          images:product_images(*)
        `)
        .eq('is_active', true);

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.brand_id) {
        query = query.eq('brand_id', filters.brand_id);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      return data as ProductCategory[];
    },
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Brand[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(name, logo_url, description),
          category:product_categories(name, slug),
          images:product_images(*),
          reviews:product_reviews(rating, title, comment, created_at, user_id)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as Product;
    },
  });
};
