import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/Layout/MainLayout';
import { Package, MapPin, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      name: string;
      images?: { image_url: string; is_primary: boolean }[];
    };
  }[];
}

const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-purple-500',
  shipped: 'bg-orange-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500'
};

const Orders = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            unit_price,
            total_price,
            product:products(
              name,
              images:product_images(image_url, is_primary)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-muted-foreground">You need to login to view your orders.</p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">Loading orders...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        
        {orders?.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order #{order.order_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.created_at), 'PPp')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={`${statusColors[order.status as keyof typeof statusColors]} text-white`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="text-lg font-bold mt-1">₹{order.total_amount}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items Ordered:</h4>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0].image_url}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.unit_price} = ₹{item.total_price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <p>{order.shipping_address.fullName}</p>
                        <p>{order.shipping_address.street}</p>
                        <p>
                          {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postalCode}
                        </p>
                        <p>Phone: {order.shipping_address.phone}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Details
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <p>Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                        <p>Status: {order.payment_status}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;