import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { useToast } from '@/hooks/use-toast';
import { initializeRazorpay, createRazorpayOrder, verifyPayment } from '@/lib/razorpay';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, IndianRupee } from 'lucide-react';
import { CouponInput } from './CouponInput';

interface PurchaseButtonProps {
  itemType: 'course' | 'note';
  itemId: string;
  title: string;
  amount: number;
  onSuccess?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  showCouponInput?: boolean;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  itemType,
  itemId,
  title,
  amount,
  onSuccess,
  className,
  disabled = false,
  size = 'default',
  showCouponInput = true
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');

  const finalAmount = Math.max(0, amount - discount);

  const handleCouponApplied = (discountAmount: number, couponCode: string) => {
    setDiscount(discountAmount);
    setAppliedCoupon(couponCode);
  };

  const handleCouponRemoved = () => {
    setDiscount(0);
    setAppliedCoupon('');
  };

  const recordCouponUsage = async (couponCode: string, orderId: string) => {
    try {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id, used_count')
        .eq('code', couponCode)
        .single();

      if (coupon) {
        // Record usage
        await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: coupon.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            order_id: orderId,
            discount_amount: discount
          });

        // Update usage count - increment by 1
        await supabase
          .from('coupons')
          .update({ used_count: coupon.used_count + 1 })
          .eq('id', coupon.id);
      }
    } catch (error) {
      console.error('Failed to record coupon usage:', error);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);

      // Initialize Razorpay
      const isRazorpayLoaded = await initializeRazorpay();
      if (!isRazorpayLoaded) {
        toast({
          title: "Error",
          description: "Payment gateway failed to load. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please login to make a purchase.",
          variant: "destructive",
        });
        return;
      }

      // Create Razorpay order with final amount
      const order = await createRazorpayOrder(itemType, itemId, finalAmount);

      const options = {
        key: 'rzp_test_XVVq4GDDrDcS9a',
        amount: order.amount,
        currency: "INR",
        name: "LearnVerse Academy",
        description: `Purchase ${title}${appliedCoupon ? ` (Coupon: ${appliedCoupon})` : ''}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              itemType,
              itemId
            });

            // Record coupon usage if applied
            if (appliedCoupon) {
              await recordCouponUsage(appliedCoupon, response.razorpay_order_id);
            }

            toast({
              title: "Purchase Successful!",
              description: `${itemType === 'course' ? 'Course' : 'Note'} purchased successfully.`,
            });
            
            onSuccess?.();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
          }
        },
        theme: {
          color: "#4F46E5"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {showCouponInput && (
        <CouponInput
          itemType={itemType}
          amount={amount}
          onCouponApplied={handleCouponApplied}
          onCouponRemoved={handleCouponRemoved}
          appliedCoupon={appliedCoupon}
        />
      )}
      
      <div className="space-y-2">
        {discount > 0 && (
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Original Price:</span>
              <span>₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-₹{discount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Final Price:</span>
              <span>₹{finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handlePurchase} 
          disabled={loading || disabled}
          className={className}
          size={size}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <IndianRupee className="mr-1 h-4 w-4" />
              Buy ₹{finalAmount.toLocaleString('en-IN')}
              {discount > 0 && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Save ₹{discount.toFixed(0)}
                </span>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
