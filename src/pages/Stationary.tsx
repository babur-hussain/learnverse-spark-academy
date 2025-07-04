
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Heart, ShoppingCart, MapPin, Bell, SlidersHorizontal, Grid, List } from 'lucide-react';
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
  { id: 1, name: 'Notebooks', emoji: '📒', color: 'from-blue-400 to-blue-600', count: 45 },
  { id: 2, name: 'Pens', emoji: '🖊️', color: 'from-purple-400 to-purple-600', count: 89 },
  { id: 3, name: 'Calculators', emoji: '🧮', color: 'from-green-400 to-green-600', count: 23 },
  { id: 4, name: 'Art & Craft', emoji: '🎨', color: 'from-pink-400 to-pink-600', count: 67 },
  { id: 5, name: 'Office Supplies', emoji: '📎', color: 'from-amber-400 to-amber-600', count: 156 },
  { id: 6, name: 'School Bags', emoji: '🎒', color: 'from-red-400 to-red-600', count: 34 },
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
    badge: 'Top Choice',
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
  const [sortBy, setSortBy] = useState('relevance');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white rounded-3xl">
      <CardContent className="p-0">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <div className="aspect-square overflow-hidden bg-gray-50 relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
              />
              {product.discount > 0 && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                    -{product.discount}%
                  </Badge>
                </div>
              )}
              {product.badge && (
                <div className="absolute top-3 right-12">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-semibold rounded-full">
                    {product.badge}
                  </Badge>
                </div>
              )}
            </div>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
            onClick={() => toggleWishlist(product.id)}
          >
            <Heart 
              className={`h-5 w-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </Button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">{product.brand}</p>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-tight mt-1 text-lg">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : i < product.rating
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">({product.reviews})</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            {product.freeShipping && (
              <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full inline-block">
                FREE Delivery
              </p>
            )}
          </div>

          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full py-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 sticky top-0 z-40 pt-safe shadow-xl">
        <div className="px-4 py-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">📝</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Premium Stationery Store</h1>
                <p className="text-blue-100 text-sm flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Discover quality stationery items for work, study, and creativity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
                <Bell className="h-6 w-6" />
                <Badge className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full p-0" />
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
                  <ShoppingCart className="h-6 w-6" />
                  <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs bg-orange-500 text-white font-bold rounded-full">
                    3
                  </Badge>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for pens, notebooks, calculators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-14 py-4 rounded-3xl border-0 bg-white/95 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-white/50 text-lg font-medium shadow-lg"
            />
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">Filters & Sort</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4 text-lg">Sort by</h3>
                    <div className="space-y-3">
                      {[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' },
                        { value: 'rating', label: 'Customer Rating' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="sort"
                            value={option.value}
                            checked={sortBy === option.value}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="mr-3 w-4 h-4 text-blue-600"
                          />
                          <span className="font-medium">{option.label}</span>
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
      <div className="px-4 py-6 bg-white">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex-shrink-0 flex flex-col items-center p-4 rounded-2xl transition-all duration-300 min-w-[80px] ${
                selectedCategory === category.name
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-2xl mb-2 shadow-md`}>
                {category.emoji}
              </div>
              <span className="text-xs font-bold text-center leading-tight">
                {category.name}
              </span>
              <span className="text-xs opacity-75 mt-1">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="px-4 py-4 bg-white border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-900">
              {filteredProducts.length} results
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-full"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-full"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="rounded-full font-semibold"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 pb-24">
        {filteredProducts.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'flex flex-col gap-4'
          } mt-6`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-lg mb-6">Try adjusting your search or filters</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="rounded-full px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {isMobile && user && <MobileFooter />}
    </div>
  );
};

export default Stationary;
