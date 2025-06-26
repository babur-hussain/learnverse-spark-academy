
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Check, X, Tag } from 'lucide-react';

interface CouponInputProps {
  itemType: 'course' | 'note';
  amount: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string;
}

interface CouponData {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount: number;
  usage_limit?: number;
  used_count: number;
  applicable_to: 'all' | 'courses' | 'notes';
}

export const CouponInput: React.FC<CouponInputProps> = ({
  itemType,
  amount,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateAndApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        toast({
          title: "Invalid Coupon",
          description: "Coupon code not found or expired.",
          variant: "destructive",
        });
        return;
      }

      const couponData = coupon as CouponData;

      // Check if coupon is applicable to item type
      if (couponData.applicable_to !== 'all' && couponData.applicable_to !== `${itemType}s`) {
        toast({
          title: "Invalid Coupon",
          description: `This coupon is only valid for ${couponData.applicable_to}.`,
          variant: "destructive",
        });
        return;
      }

      // Check minimum amount
      if (amount < couponData.minimum_amount) {
        toast({
          title: "Minimum Amount Not Met",
          description: `Minimum purchase amount is ₹${couponData.minimum_amount}.`,
          variant: "destructive",
        });
        return;
      }

      // Check usage limit
      if (couponData.usage_limit && couponData.used_count >= couponData.usage_limit) {
        toast({
          title: "Coupon Limit Reached",
          description: "This coupon has reached its usage limit.",
          variant: "destructive",
        });
        return;
      }

      // Check if user already used this coupon
      const { data: usage } = await supabase
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', couponData.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (usage && usage.length > 0) {
        toast({
          title: "Coupon Already Used",
          description: "You have already used this coupon.",
          variant: "destructive",
        });
        return;
      }

      // Calculate discount
      let discount = 0;
      if (couponData.discount_type === 'percentage') {
        discount = (amount * couponData.discount_value) / 100;
      } else {
        discount = couponData.discount_value;
      }

      // Ensure discount doesn't exceed item price
      discount = Math.min(discount, amount);

      onCouponApplied(discount, couponData.code);
      setCouponCode('');
      
      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${discount.toFixed(2)}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to apply coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved();
    toast({
      title: "Coupon Removed",
      description: "Coupon discount has been removed.",
    });
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <Badge variant="outline" className="text-green-700 border-green-300">
            {appliedCoupon}
          </Badge>
          <span className="text-sm text-green-700 dark:text-green-400">Applied</span>
        </div>
        <Button variant="ghost" size="sm" onClick={removeCoupon}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter coupon code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        onKeyPress={(e) => e.key === 'Enter' && validateAndApplyCoupon()}
      />
      <Button 
        variant="outline" 
        onClick={validateAndApplyCoupon}
        disabled={!couponCode.trim() || loading}
      >
        {loading ? '...' : 'Apply'}
      </Button>
    </div>
  );
};
