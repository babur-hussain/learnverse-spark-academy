
import React, { useState } from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { Heart, ShoppingCart, Trash2, Star, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const isMobile = useIsMobile();
  const [wishlistItems, setWishlistItems] = useState([
    { 
      id: 1, 
      name: 'Premium A5 Leather Journal', 
      brand: 'Moleskine',
      image: '/public/images/materials.png', 
      price: 1299, 
      originalPrice: 1899,
      rating: 4.5,
      reviews: 234,
      discount: 32,
      inStock: true,
      badge: 'Best Seller'
    },
    { 
      id: 2, 
      name: 'Scientific Calculator FX-991ES Plus', 
      brand: 'Casio',
      image: '/public/images/computer.png', 
      price: 2450, 
      originalPrice: 2990,
      rating: 4.8,
      reviews: 1247,
      discount: 18,
      inStock: true,
      badge: 'Amazon\'s Choice'
    },
    { 
      id: 3, 
      name: 'Professional Ballpoint Pen Set', 
      brand: 'Parker',
      image: '/public/images/books.png', 
      price: 3250, 
      originalPrice: 4500,
      rating: 4.3,
      reviews: 89,
      discount: 28,
      inStock: false,
      badge: 'Limited Edition'
    },
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (id: number) => {
    // In real app, add to cart
    console.log('Added to cart:', id);
  };

  const moveAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => item.inStock);
    // In real app, add all in-stock items to cart
    console.log('Moving to cart:', inStockItems);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <Heart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
            <p className="text-gray-600 mb-8">Save items you like to your wishlist and review them anytime.</p>
            <Link to="/stationary">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-3">
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        {isMobile && <MobileFooter />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to="/stationary">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">My Wishlist</h1>
                <p className="text-gray-600">{wishlistItems.length} items saved</p>
              </div>
            </div>
            
            {wishlistItems.some(item => item.inStock) && (
              <Button onClick={moveAllToCart} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
            )}
          </div>

          {/* Wishlist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <Link to={`/product/${item.id}`}>
                      <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-50">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 space-y-1">
                      {item.badge && (
                        <Badge className={`text-xs px-2 py-1 ${
                          item.badge === 'Best Seller' ? 'bg-orange-500' :
                          item.badge === 'Amazon\'s Choice' ? 'bg-blue-600' :
                          item.badge === 'Limited Edition' ? 'bg-purple-600' :
                          'bg-green-600'
                        }`}>
                          {item.badge}
                        </Badge>
                      )}
                      {item.discount > 0 && (
                        <Badge variant="destructive" className="text-xs px-2 py-1">
                          -{item.discount}%
                        </Badge>
                      )}
                    </div>

                    {/* Remove from wishlist */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>

                    {/* Share button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-12 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm"
                    >
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Brand */}
                    <p className="text-sm text-blue-600 font-medium">{item.brand}</p>
                    
                    {/* Product name */}
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(item.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : i < item.rating
                                ? 'fill-yellow-400/50 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({item.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-gray-900">₹{item.price.toLocaleString()}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">₹{item.originalPrice.toLocaleString()}</span>
                      )}
                    </div>

                    {/* Stock status */}
                    <div className="flex items-center gap-2">
                      <Badge variant={item.inStock ? "default" : "destructive"} className="text-xs">
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                      {item.inStock && (
                        <span className="text-sm text-green-600">Available for delivery</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                        disabled={!item.inStock}
                        onClick={() => addToCart(item.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {item.inStock ? 'Add to Cart' : 'Currently Unavailable'}
                      </Button>
                      
                      {!item.inStock && (
                        <Button variant="outline" className="w-full" size="sm">
                          Notify When Available
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 101, name: 'Watercolor Paint Set', price: 4899, image: '/public/images/books.png' },
                { id: 102, name: 'Fountain Pen Collection', price: 2499, image: '/public/images/materials.png' },
                { id: 103, name: 'Sketching Notebook', price: 599, image: '/public/images/computer.png' },
                { id: 104, name: 'Geometry Box Set', price: 349, image: '/public/images/books.png' },
              ].map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-contain mb-2"
                    />
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="font-semibold">₹{product.price.toLocaleString()}</p>
                    <Button size="sm" className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-black">
                      <Heart className="h-3 w-3 mr-1" />
                      Add to Wishlist
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Wishlist;
