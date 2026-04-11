
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/integrations/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    currency: string;
    images?: { image_url: string; is_primary: boolean }[];
    brand?: { name: string };
  };
}

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data } = await apiClient.get('/api/wishlist');
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (product_id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data } = await apiClient.post('/api/wishlist', { product_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist.",
      });
    },
    onError: (error) => {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (product_id: string) => {
      if (!user) throw new Error('User not authenticated');

      await apiClient.delete(`/api/wishlist/${product_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist.",
      });
    },
  });

  const isInWishlist = (product_id: string) => {
    return wishlistQuery.data?.some(item => item.product_id === product_id) || false;
  };

  const toggleWishlist = (product_id: string) => {
    if (isInWishlist(product_id)) {
      removeFromWishlistMutation.mutate(product_id);
    } else {
      addToWishlistMutation.mutate(product_id);
    }
  };

  return {
    wishlist: wishlistQuery.data || [],
    isLoading: wishlistQuery.isLoading,
    error: wishlistQuery.error,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    toggleWishlist,
    isInWishlist,
    isAddingToWishlist: addToWishlistMutation.isPending,
  };
};
