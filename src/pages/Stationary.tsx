
import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronDown, Menu, SlidersHorizontal, MapPin, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent } from '@/components/UI/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/UI/sheet';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { useAuth } from '@/contexts/AuthContext';

const categories = [
  { id: 1, name: 'Electronic', icon: '📱', color: 'bg-blue-500', count: 45 },
  { id: 2, name: 'Food & Drink', icon: '🍔', color: 'bg-orange-500', count: 89 },
  { id: 3, name: 'Accessories', icon: '👜', color: 'bg-purple-500', count: 23 },
  { id: 4, name: 'Beauty', icon: '💄', color: 'bg-pink-500', count: 67 },
  { id: 5, name: 'Furniture', icon: '🪑', color: 'bg-amber-500', count: 156 },
  { id: 6, name: 'Fashion', icon: '👕', color: 'bg-green-500', count: 234 },
  { id: 7, name: 'Health', icon: '🏥', color: 'bg-red-500', count: 45 },
  { id: 8, name: 'Stationery', icon: '✏️', color: 'bg-indigo-500', count: 198 },
];

const products = [
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
    category: 'Notebooks',
    features: ['200 pages', 'Dotted', 'Elastic closure'],
    badge: 'Best Seller',
    freeShipping: true,
    colors: ['Black', 'Brown', 'Navy']
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
    category: 'Calculators',
    features: ['417 functions', 'Natural display', 'Dual power'],
    badge: 'Amazon\'s Choice',
    freeShipping: true,
    colors: ['Black']
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
    category: 'Pens',
    features: ['Premium metal body', 'Gift box included', 'Refillable'],
    badge: 'Limited Edition',
    freeShipping: true,
    colors: ['Silver', 'Gold', 'Black']
  },
  { 
    id: 4, 
    name: 'Colorful Sticky Notes Pack', 
    brand: 'Post-it',
    image: '/public/images/materials.png', 
    price: 299, 
    originalPrice: 450, 
    rating: 4.2, 
    reviews: 567,
    discount: 34,
    category: 'Office Supplies',
    features: ['12 colors', '100 sheets each', 'Super sticky'],
    badge: 'Great Value',
    freeShipping: false,
    colors: ['Multicolor']
  },
  { 
    id: 5, 
    name: 'Watercolor Paint Set Professional', 
    brand: 'Faber-Castell',
    image: '/public/images/books.png', 
    price: 4899, 
    originalPrice: 6200, 
    rating: 4.7, 
    reviews: 145,
    discount: 21,
    category: 'Art Supplies',
    features: ['48 colors', 'Artist quality', 'Mixing palette included'],
    badge: 'Professional Grade',
    freeShipping: true,
    colors: ['Standard']
  },
  { 
    id: 6, 
    name: 'Mechanical Pencil Set 0.5mm', 
    brand: 'Staedtler',
    image: '/public/images/materials.png', 
    price: 850, 
    originalPrice: 1200, 
    rating: 4.4, 
    reviews: 324,
    discount: 29,
    category: 'Pencils',
    features: ['Metal grip', 'Lead indicator', 'Eraser included'],
    badge: 'Student Favorite',
    freeShipping: true,
    colors: ['Blue', 'Black', 'Red']
  },
];

const Stationary = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, sortBy]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white dark:bg-gray-800 rounded-2xl">
      <CardContent className="p-0">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700 relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
              />
              {product.discount > 0 && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
                    {product.discount}% off
                  </Badge>
                </div>
              )}
            </div>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 shadow-sm"
            onClick={() => toggleWishlist(product.id)}
          >
            <Heart 
              className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} 
            />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{product.brand}</p>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-tight mt-1">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : i < product.rating
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">({product.reviews})</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            {product.freeShipping && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">FREE Delivery</p>
            )}
          </div>

          <Button className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium rounded-full py-2">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 pt-safe transition-colors">
        <div className="px-4 py-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Stationery Store</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Deliver to 123 Block A, Delhi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <Badge className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full p-0" />
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500">
                    3
                  </Badge>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Find you needed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-2xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:border-orange-500 focus:ring-orange-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <SlidersHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SheetHeader>
                  <SheetTitle className="text-gray-900 dark:text-gray-100">Filters</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Sort by</h3>
                    <div className="space-y-2">
                      {[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' },
                        { value: 'rating', label: 'Customer Rating' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="sort"
                            value={option.value}
                            checked={sortBy === option.value}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="mr-3 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex flex-col items-center p-2 sm:p-3 rounded-2xl transition-all ${
                selectedCategory === category.name
                  ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${category.color} rounded-2xl flex items-center justify-center text-white text-base sm:text-lg mb-1 sm:mb-2`}>
                {category.icon}
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 text-center leading-tight">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Flash Sale Banner */}
      <div className="mx-4 my-4">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">6.6 Flash Sale</h2>
                <p className="text-sm opacity-90">Cashback Up to 100%</p>
              </div>
              <Button className="bg-white text-red-500 hover:bg-gray-100 font-semibold px-4 sm:px-6 rounded-full text-sm">
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Flash Sale</h2>
          <Link to="/stationary/all" className="text-orange-500 dark:text-orange-400 text-sm font-medium hover:text-orange-600 dark:hover:text-orange-300">
            See all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No products found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {isMobile && user && <MobileFooter />}
    </div>
  );
};

export default Stationary;
