
import React, { useState } from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, Truck, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Link } from 'react-router-dom';

const Cart = () => {
  const isMobile = useIsMobile();
  const [cartItems, setCartItems] = useState([
    { 
      id: 1, 
      name: 'Premium A5 Leather Journal', 
      brand: 'Moleskine',
      image: '/public/images/materials.png', 
      price: 1299, 
      originalPrice: 1899,
      qty: 2,
      inStock: true,
      freeShipping: true
    },
    { 
      id: 2, 
      name: 'Scientific Calculator FX-991ES Plus', 
      brand: 'Casio',
      image: '/public/images/computer.png', 
      price: 2450, 
      originalPrice: 2990,
      qty: 1,
      inStock: true,
      freeShipping: true
    },
  ]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const updateQuantity = (id: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(items => items.map(item => 
      item.id === id ? { ...item, qty: newQty } : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const moveToWishlist = (id: number) => {
    removeItem(id);
    // In real app, add to wishlist
  };

  const applyCoupon = () => {
    // Mock coupon validation
    const validCoupons = {
      'SAVE10': { discount: 10, type: 'percentage' },
      'FLAT50': { discount: 50, type: 'fixed' },
      'STUDENT15': { discount: 15, type: 'percentage' }
    };

    if (validCoupons[couponCode]) {
      setAppliedCoupon(couponCode);
      const coupon = validCoupons[couponCode];
      if (coupon.type === 'percentage') {
        setCouponDiscount((subtotal * coupon.discount) / 100);
      } else {
        setCouponDiscount(coupon.discount);
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const savings = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.qty, 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal - couponDiscount + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/stationary">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-3">
                Continue Shopping
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/stationary">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Shopping Cart ({cartItems.length} items)</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">{item.brand}</p>
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant={item.inStock ? "default" : "destructive"} className="text-xs">
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                          {item.freeShipping && (
                            <Badge variant="secondary" className="text-xs">
                              <Truck className="h-3 w-3 mr-1" />
                              Free Shipping
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.qty - 1)}
                                disabled={item.qty <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-3 py-1 min-w-[2rem] text-center">{item.qty}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.qty + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveToWishlist(item.id)}
                              className="text-gray-600 hover:text-red-600"
                            >
                              <Heart className="h-4 w-4 mr-1" />
                              Move to Wishlist
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">₹{(item.price * item.qty).toLocaleString()}</span>
                              {item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{(item.originalPrice * item.qty).toLocaleString()}
                                </span>
                              )}
                            </div>
                            {item.originalPrice > item.price && (
                              <p className="text-sm text-green-600">
                                You save ₹{((item.originalPrice - item.price) * item.qty).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Coupon Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Apply Coupon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <Button onClick={applyCoupon} disabled={!couponCode}>
                        Apply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">Coupon Applied!</p>
                        <p className="text-sm text-green-600">{appliedCoupon}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={removeCoupon}>
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Available Coupons:</p>
                    <ul className="space-y-1">
                      <li>• SAVE10 - 10% off</li>
                      <li>• FLAT50 - ₹50 off</li>
                      <li>• STUDENT15 - 15% off</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.qty, 0)} items)</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Your Savings</span>
                        <span>-₹{savings.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount ({appliedCoupon})</span>
                        <span>-₹{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600' : ''}>
                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                      </span>
                    </div>
                    
                    {shipping > 0 && (
                      <p className="text-sm text-blue-600">
                        Add ₹{(1000 - subtotal).toLocaleString()} more for FREE shipping
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 text-lg">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Free delivery on orders above ₹1000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Cart;
