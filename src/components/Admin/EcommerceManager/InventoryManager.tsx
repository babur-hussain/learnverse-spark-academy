import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
}

interface InventoryTransaction {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes: string | null;
  created_at: string;
  products: {
    name: string;
  };
}

export function InventoryManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['products-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['inventory-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          products(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as InventoryTransaction[];
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('inventory_transactions').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Stock adjusted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adjusting stock', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setSelectedProduct('');
    setAdjustmentType('in');
    setQuantity('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const product = products?.find(p => p.id === selectedProduct);
    if (!product) return;

    const adjustmentQuantity = parseInt(quantity);
    const newStock = adjustmentType === 'in' 
      ? product.stock_quantity + adjustmentQuantity
      : Math.max(0, product.stock_quantity - adjustmentQuantity);

    const data = {
      product_id: selectedProduct,
      type: adjustmentType,
      quantity: adjustmentQuantity,
      previous_stock: product.stock_quantity,
      new_stock: newStock,
      notes: notes || null,
      reference_type: 'manual_adjustment'
    };

    adjustStockMutation.mutate(data);
  };

  const getLowStockProducts = () => {
    return products?.filter(product => product.stock_quantity < 10) || [];
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading inventory...</div>;
  }

  const lowStockProducts = getLowStockProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Adjust Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stock Adjustment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product">Product *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Current: {product.stock_quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Adjustment Type *</Label>
                  <Select value={adjustmentType} onValueChange={(value: 'in' | 'out') => setAdjustmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Stock In (+)</SelectItem>
                      <SelectItem value="out">Stock Out (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for adjustment"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Adjust Stock
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-red-500" />
              Low Stock Alert
            </h3>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-sm">{product.name}</span>
                  <Badge variant="destructive">{product.stock_quantity} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="font-semibold mb-4">Recent Inventory Transactions</h3>
        <div className="space-y-2">
          {transactions?.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'in' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : transaction.type === 'out' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <RotateCcw className="h-4 w-4 text-blue-500" />
                    )}
                    <div>
                      <span className="font-medium">{transaction.products.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {transaction.type === 'in' ? '+' : '-'}{transaction.quantity} units
                        {transaction.notes && ` • ${transaction.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>
                      {transaction.previous_stock} → {transaction.new_stock}
                    </div>
                    <div className="text-muted-foreground">
                      {format(new Date(transaction.created_at), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}