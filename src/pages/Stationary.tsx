import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent } from '@/components/UI/card';

const categories = [
  { id: 1, name: 'Notebooks & Journals', count: 45, image: '/public/images/materials.png' },
  { id: 2, name: 'Pens & Pencils', count: 89, image: '/public/images/books.png' },
  { id: 3, name: 'Calculators', count: 23, image: '/public/images/computer.png' },
  { id: 4, name: 'Art Supplies', count: 67, image: '/public/images/materials.png' },
  { id: 5, name: 'Office Supplies', count: 156, image: '/public/images/books.png' },
  { id: 6, name: 'School Essentials', count: 234, image: '/public/images/materials.png' },
];

const brands = ['Parker', 'Pilot', 'Faber-Castell', 'Staedtler', 'Casio', 'Texas Instruments', 'Moleskine', 'Rhodia'];

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
    freeShipping: true
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
    freeShipping: true
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
    freeShipping: true
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
    freeShipping: false
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
    freeShipping: true
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
    freeShipping: true
  },
];

const Stationary = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Sort products
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
      case 'newest':
        // Keep original order for newest
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, priceRange]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl">
      <CardContent className="p-0">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-50">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {product.badge && (
              <Badge className={`text-xs px-2 py-1 ${
                product.badge === 'Best Seller' ? 'bg-orange-500' :
                product.badge === 'Amazon\'s Choice' ? 'bg-blue-600' :
                product.badge === 'Limited Edition' ? 'bg-purple-600' :
                product.badge === 'Professional Grade' ? 'bg-green-600' :
                'bg-red-500'
              }`}>
                {product.badge}
              </Badge>
            )}
            {product.discount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                -{product.discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm"
            onClick={() => toggleWishlist(product.id)}
          >
            <Heart 
              className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </Button>
        </div>

        <div className="p-4 space-y-2">
          {/* Brand */}
          <p className="text-sm text-blue-600 font-medium">{product.brand}</p>
          
          {/* Product name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
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
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Shipping info */}
          {product.freeShipping && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Truck className="h-3 w-3" />
              FREE Delivery
            </p>
          )}

          {/* Add to cart button */}
          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium mt-3">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Premium Stationery Store</h1>
              <p className="text-blue-100 mb-6">Discover quality stationery items for work, study, and creativity</p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Input
                  type="text"
                  placeholder="Search for pens, notebooks, calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-lg rounded-lg border-0 shadow-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <img src={category.image} alt={category.name} className="w-5 h-5 rounded" />
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div className={`${isMobile ? (showFilters ? 'block' : 'hidden') : 'block'} w-full md:w-64 space-y-6`}>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-3">Brands</h3>
                <div className="space-y-2">
                  {['All', ...brands].map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        value={brand}
                        checked={selectedBrand === brand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹0</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-3">Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {filteredProducts.length} results
                    </span>
                    
                    {isMobile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border rounded px-3 py-2"
                    >
                      <option value="relevance">Sort by Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>

                    <div className="flex border rounded">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedBrand('All');
                      setPriceRange([0, 10000]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Stationary;
