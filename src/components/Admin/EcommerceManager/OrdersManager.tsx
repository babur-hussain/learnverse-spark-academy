import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent } from '@/components/UI/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: any;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    products: {
      name: string;
    };
  }[];
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-orange-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

export function OrdersManager() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            unit_price,
            products(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Order status updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating order status', description: error.message, variant: 'destructive' });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <Badge 
        variant="secondary" 
        className={`${statusOption?.color || 'bg-gray-500'} text-white`}
      >
        {statusOption?.label || status}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Orders Management</h2>
        <div className="flex gap-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Order #{order.order_number}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {format(new Date(order.created_at), 'PPp')}
                  </p>
                  <p className="text-lg font-bold mt-1">₹{order.total_amount}</p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Order Items:</h4>
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">{item.products?.name}</span>
                    <div className="text-sm">
                      <span>Qty: {item.quantity}</span>
                      <span className="ml-4">₹{item.unit_price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {order.shipping_address && (
                <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <h4 className="font-medium text-sm mb-1">Shipping Address:</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.shipping_address.street}, {order.shipping_address.city}, 
                    {order.shipping_address.state} - {order.shipping_address.postal_code}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {orders?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No orders found for the selected status.
        </div>
      )}
    </div>
  );
}