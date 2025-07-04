
import React, { useState } from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { CreditCard, MapPin, Truck, Shield, ArrowLeft, Edit, Plus, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const isMobile = useIsMobile();
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const cartItems = [
    { 
      id: 1, 
      name: 'Premium A5 Leather Journal', 
      brand: 'Moleskine',
      image: '/public/images/materials.png', 
      price: 1299, 
      qty: 2,
      deliveryDate: 'Tomorrow'
    },
    { 
      id: 2, 
      name: 'Scientific Calculator FX-991ES Plus', 
      brand: 'Casio',
      image: '/public/images/computer.png', 
      price: 2450, 
      qty: 1,
      deliveryDate: 'Tomorrow'
    },
  ];

  const addresses = [
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      address: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543210',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      name: 'John Doe',
      address: '456 Business Park, Floor 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400070',
      phone: '+91 9876543210',
      isDefault: false
    }
  ];

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', fee: 0 },
    { id: 'upi', name: 'UPI Payment', icon: '📱', fee: 0 },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', fee: 0 },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', fee: 0 },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">Address</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">Payment</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">Review</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.map((address, index) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAddress(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={selectedAddress === index}
                            onChange={() => setSelectedAddress(index)}
                            className="mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary">{address.type}</Badge>
                              {address.isDefault && (
                                <Badge variant="default" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="font-medium">{address.name}</p>
                            <p className="text-sm text-gray-600">
                              {address.address}<br />
                              {address.city}, {address.state} - {address.pincode}<br />
                              Phone: {address.phone}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAddAddress(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedPayment} onValueChange={setSelectedPayment}>
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                      {paymentMethods.map(method => (
                        <TabsTrigger key={method.id} value={method.id} className="text-xs">
                          <span className="mr-1">{method.icon}</span>
                          {method.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="cod" className="mt-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">💵</span>
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          • No additional charges<br />
                          • Exact change appreciated<br />
                          • Available for orders up to ₹50,000
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="upi" className="mt-4">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">📱</span>
                            <p className="font-medium">Pay with UPI</p>
                          </div>
                          <Input placeholder="Enter UPI ID (e.g., name@paytm)" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {['GooglePay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                            <Button key={app} variant="outline" size="sm">
                              {app}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="card" className="mt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input placeholder="Cardholder Name" />
                          <Input placeholder="Card Number" />
                          <Input placeholder="MM/YY" />
                          <Input placeholder="CVV" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="h-4 w-4" />
                          <span>Your card details are encrypted and secure</span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="netbanking" className="mt-4">
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">Select your bank:</p>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Other'].map(bank => (
                            <Button key={bank} variant="outline" size="sm">
                              {bank}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Order Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Review Items & Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-blue-600 font-medium">{item.brand}</p>
                        <h3 className="font-medium line-clamp-2">{item.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">Qty: {item.qty}</span>
                          <span className="font-semibold">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Truck className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Delivery {item.deliveryDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items ({cartItems.reduce((sum, item) => sum + item.qty, 0)})</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Order Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 text-lg"
                    onClick={() => window.location.href = '/order/123456'}
                  >
                    Place Order
                  </Button>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Safe and secure payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Free delivery on all orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Easy returns & exchanges</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p className="font-medium text-blue-800 mb-1">Order Protection</p>
                    <p className="text-blue-700">
                      Your order is protected by our money-back guarantee. 
                      If you're not satisfied, we'll make it right.
                    </p>
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

export default Checkout;
