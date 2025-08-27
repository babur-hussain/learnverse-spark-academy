
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CouponDialog } from './CouponDialog';
import { Trash2, Calendar, Users, Target } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applicable_to: 'all' | 'courses' | 'notes';
  created_at: string;
}

export const CouponsList: React.FC = () => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: coupons, isLoading, refetch } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coupon deleted successfully.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    return coupon.discount_type === 'percentage' 
      ? `${coupon.discount_value}%` 
      : `₹${coupon.discount_value}`;
  };

  const isExpired = (coupon: Coupon) => {
    return coupon.valid_until && new Date(coupon.valid_until) < new Date();
  };

  if (isLoading) {
    return <div>Loading coupons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <CouponDialog onSuccess={refetch} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons?.map((coupon) => (
          <Card key={coupon.id} className={`${!coupon.is_active || isExpired(coupon) ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{coupon.code}</CardTitle>
                <div className="flex gap-2">
                  <CouponDialog coupon={coupon} onSuccess={refetch} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(coupon.id)}
                    disabled={deletingId === coupon.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={coupon.is_active ? "default" : "secondary"}>
                  {coupon.is_active ? "Active" : "Inactive"}
                </Badge>
                {isExpired(coupon) && (
                  <Badge variant="destructive">Expired</Badge>
                )}
                <Badge variant="outline">{coupon.applicable_to}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold text-green-600">
                {formatDiscount(coupon)} OFF
              </div>
              
              {coupon.minimum_amount > 0 && (
                <div className="text-sm text-gray-600">
                  Min. purchase: ₹{coupon.minimum_amount}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{coupon.used_count}</span>
                  {coupon.usage_limit && <span>/{coupon.usage_limit}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {coupon.valid_until 
                      ? `Until ${new Date(coupon.valid_until).toLocaleDateString()}`
                      : 'No expiry'
                    }
                  </span>
                </div>
              </div>

              {coupon.usage_limit && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(coupon.used_count / coupon.usage_limit) * 100}%` }}
                  ></div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {coupons?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No coupons found. Create your first coupon!</p>
        </div>
      )}
    </div>
  );
};
