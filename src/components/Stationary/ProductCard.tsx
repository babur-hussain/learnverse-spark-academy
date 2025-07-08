
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Product } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isAddingToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || '/public/images/materials.png';
  const discount = product.original_price && product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product_id: product.id });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl">
      <CardContent className="p-0">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-50 dark:bg-gray-800">
              <img 
                src={primaryImage} 
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {product.is_featured && (
              <Badge className="text-xs px-2 py-1 bg-orange-500">
                Best Seller
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm dark:bg-gray-800/80 dark:hover:bg-gray-800"
            onClick={handleToggleWishlist}
          >
            <Heart 
              className={`h-4 w-4 ${
                isInWishlist(product.id) 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} 
            />
          </Button>
        </div>

        <div className="p-4 space-y-2">
          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{product.brand.name}</p>
          )}
          
          {/* Product name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : i < product.rating!
                        ? 'fill-yellow-400/50 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">({product.review_count || 0})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              ₹{product.price.toLocaleString()}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ₹{product.original_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {feature}
                </Badge>
              ))}
            </div>
          )}

          {/* Shipping info */}
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            FREE Delivery
          </p>

          {/* Add to cart button */}
          <Button 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium mt-3"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_quantity === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
