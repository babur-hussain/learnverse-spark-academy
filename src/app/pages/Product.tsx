
import React, { useState } from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { useParams } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw, Plus, Minus, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';

const products = [
  { 
    id: 1, 
    name: 'Premium A5 Leather Journal', 
    brand: 'Moleskine',
    images: ['/images/materials.png', '/images/books.png', '/images/computer.png'],
    price: 1299, 
    originalPrice: 1899, 
    rating: 4.5, 
    reviews: 234,
    discount: 32,
    category: 'Notebooks',
    description: 'Experience the perfect blend of tradition and innovation with this premium leather journal. Crafted with attention to detail, this journal features high-quality paper that\'s perfect for both writing and sketching.',
    features: ['200 dotted pages', 'Elastic closure', 'Ribbon bookmark', 'Premium leather cover', 'Acid-free paper'],
    specifications: {
      'Size': 'A5 (14.8 x 21 cm)',
      'Pages': '200',
      'Paper Weight': '80gsm',
      'Binding': 'Thread-bound',
      'Cover Material': 'Genuine Leather'
    },
    inStock: true,
    stockCount: 47,
    badge: 'Best Seller',
    freeShipping: true,
    deliveryDate: '2-3 business days',
    warranty: '1 year quality guarantee'
  },
  { 
    id: 2, 
    name: 'Scientific Calculator FX-991ES Plus', 
    brand: 'Casio',
    images: ['/images/computer.png', '/images/materials.png'],
    price: 2450, 
    originalPrice: 2990, 
    rating: 4.8, 
    reviews: 1247,
    discount: 18,
    category: 'Calculators',
    description: 'The most advanced scientific calculator designed for students and professionals. With 417 functions and natural textbook display, it handles complex calculations with ease.',
    features: ['417 built-in functions', 'Natural textbook display', 'Dual power (solar + battery)', 'Multi-line display', 'Equation solver'],
    specifications: {
      'Functions': '417',
      'Display': '2-line LCD',
      'Power': 'Dual (Solar + LR44)',
      'Memory': '9 variables',
      'Dimensions': '162 x 80 x 13.8 mm'
    },
    inStock: true,
    stockCount: 23,
    badge: 'Amazon\'s Choice',
    freeShipping: true,
    deliveryDate: '1-2 business days',
    warranty: '2 years manufacturer warranty'
  },
];

const relatedProducts = [
  { id: 3, name: 'Fountain Pen Set', price: 2499, rating: 4.3, image: '/images/books.png' },
  { id: 4, name: 'Sticky Notes Pack', price: 299, rating: 4.2, image: '/images/materials.png' },
  { id: 5, name: 'Ruler Set', price: 149, rating: 4.1, image: '/images/computer.png' },
  { id: 6, name: 'Highlighter Set', price: 399, rating: 4.4, image: '/images/books.png' },
];

const Product = () => {
  const isMobile = useIsMobile();
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <span className="text-gray-500">Stationery</span>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-500">{product.category}</span>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full aspect-square object-contain p-8"
                />
                {product.discount > 0 && (
                  <Badge variant="destructive" className="absolute top-4 left-4">
                    -{product.discount}%
                  </Badge>
                )}
              </div>
              
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-blue-600 font-medium mb-2">{product.brand}</p>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
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
                  <span className="text-blue-600 hover:underline cursor-pointer">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Badge */}
                {product.badge && (
                  <Badge className={`mb-4 ${
                    product.badge === 'Best Seller' ? 'bg-orange-500' :
                    product.badge === 'Amazon\'s Choice' ? 'bg-blue-600' :
                    'bg-purple-600'
                  }`}>
                    {product.badge}
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b py-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-red-600">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-green-600 font-medium">You save ₹{(product.originalPrice - product.price).toLocaleString()} ({product.discount}%)</p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">In Stock ({product.stockCount} available)</span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    disabled={quantity >= product.stockCount}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Buttons */}
              <div className="space-y-3">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 text-lg">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full py-3 text-lg">
                  Buy Now
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Delivery Info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Free Delivery</p>
                      <p className="text-sm text-gray-600">Arrives in {product.deliveryDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Easy Returns</p>
                      <p className="text-sm text-gray-600">30-day return policy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Warranty</p>
                      <p className="text-sm text-gray-600">{product.warranty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Details Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  
                  <h4 className="font-semibold mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium">{key}:</span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium">Excellent quality!</span>
                      </div>
                      <p className="text-gray-700 mb-2">Perfect for my daily journaling needs. The paper quality is outstanding and the leather cover feels premium.</p>
                      <p className="text-sm text-gray-500">By Sarah M. - Verified Purchase</p>
                    </div>
                    
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Star className="h-4 w-4 text-gray-300" />
                        </div>
                        <span className="font-medium">Great value for money</span>
                      </div>
                      <p className="text-gray-700 mb-2">Good quality product, arrived quickly. Would recommend to others.</p>
                      <p className="text-sm text-gray-500">By John D. - Verified Purchase</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Customers who viewed this item also viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full aspect-square object-contain mb-3"
                    />
                    <h3 className="font-medium mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(relatedProduct.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">({relatedProduct.rating})</span>
                    </div>
                    <p className="font-semibold text-lg">₹{relatedProduct.price.toLocaleString()}</p>
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

export default Product;
