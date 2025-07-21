import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-muted-foreground mb-4">You need to login to view your cart.</p>
          <Button onClick={() => navigate('/auth')}>Login</Button>
        </div>
      </MainLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-4">Start shopping to add items to your cart.</p>
          <Button onClick={() => navigate('/stationary')}>Start Shopping</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cart.length} items)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.product.brand?.name}</p>
                      <p className="font-bold text-lg">₹{item.product.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity({ cart_id: item.id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity({ cart_id: item.id, quantity: item.quantity + 1 })}
                        disabled={item.quantity >= item.product.stock_quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2 font-bold">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/stationary')}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;