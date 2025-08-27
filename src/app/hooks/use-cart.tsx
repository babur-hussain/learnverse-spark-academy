
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  added_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    stock_quantity: number;
    images?: { image_url: string; is_primary: boolean }[];
    brand?: { name: string };
  };
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          product:products!inner(
            id,
            name,
            price,
            currency,
            stock_quantity,
            images:product_images(image_url, is_primary),
            brand:brands(name)
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ product_id, quantity = 1 }: { product_id: string; quantity?: number }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('shopping_cart')
        .upsert({
          user_id: user.id,
          product_id,
          quantity,
        }, {
          onConflict: 'user_id,product_id,variant_id'
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cart_id, quantity }: { cart_id: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('shopping_cart')
          .delete()
          .eq('id', cart_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shopping_cart')
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq('id', cart_id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (cart_id: string) => {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cart_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart.",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  return {
    cart: cartQuery.data || [],
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
  };
};
