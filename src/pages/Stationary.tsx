import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent } from '@/components/UI/card';
import { ProductCard } from '@/components/Stationary/ProductCard';
import { useProducts, useProductCategories, useBrands } from '@/hooks/use-products';
import MainLayout from '@/components/Layout/MainLayout';
import useIsMobile from '@/hooks/use-mobile';

const Stationary = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const { data: categories = [], isLoading: isLoadingCategories } = useProductCategories();
  const { data: brands = [], isLoading: isLoadingBrands } = useBrands();
  
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({
    category_id: selectedCategory || undefined,
    brand_id: selectedBrand || undefined,
    search: searchQuery || undefined,
  });

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesPrice;
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
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [products, priceRange, sortBy]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                  className="w-full pl-12 pr-4 py-3 text-lg rounded-lg border-0 shadow-lg text-gray-900 dark:text-gray-100"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="font-medium text-sm">All Categories</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="font-medium text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className={`${isMobile ? (showFilters ? 'block' : 'hidden') : 'block'} w-full lg:w-64 space-y-6 ${isMobile ? 'fixed inset-0 bg-white dark:bg-gray-900 z-50 p-4 overflow-y-auto' : ''}`}>
              {isMobile && showFilters && (
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    ✕
                  </Button>
                </div>
              )}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Brands</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="brand"
                      value=""
                      checked={selectedBrand === ''}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">All</span>
                  </label>
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        value={brand.id}
                        checked={selectedBrand === brand.id}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>₹0</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredProducts.length} results
                    </span>
                    
                    {isMobile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full sm:w-auto"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 min-w-0 sm:min-w-[180px]"
                    >
                      <option value="relevance">Sort by Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>

                    {!isMobile && (
                      <div className="flex border rounded dark:border-gray-600">
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
                    )}
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`grid gap-4 sm:gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {filteredProducts.length === 0 && !isLoadingProducts && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No products found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setSelectedBrand('');
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

        {/* Seller Registration CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 mt-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Want to Sell Your Products?</h2>
            <p className="text-purple-100 mb-6 text-lg">
              Join thousands of sellers and start your business journey with us. 
              Easy setup, powerful tools, and dedicated support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/seller-registration')}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Register as Seller
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/seller-dashboard')}
                className="border-white text-white hover:bg-white/10"
              >
                Seller Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Stationary;
