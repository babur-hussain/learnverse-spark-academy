
import React from 'react';
import { Button } from '@/components/UI/button';
import { useToast } from '@/hooks/use-toast';
import { initializeRazorpay, createRazorpayOrder } from '@/lib/razorpay';
import { supabase } from '@/lib/supabase';

interface PurchaseButtonProps {
  courseId: string;
  title: string;
  amount: number;
  onSuccess?: () => void;
  className?: string;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  courseId,
  title,
  amount,
  onSuccess,
  className
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const res = await initializeRazorpay();
      if (!res) {
        toast({
          title: "Error",
          description: "Razorpay SDK failed to load",
          variant: "destructive",
        });
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please login to purchase this course",
          variant: "destructive",
        });
        return;
      }

      // Create order
      const order = await createRazorpayOrder(courseId, amount);

      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Learn Verse",
        description: `Purchase ${title}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Record purchase in database
          const { error } = await supabase
            .from('user_courses')
            .insert({
              user_id: user.id,
              course_id: courseId,
              payment_id: response.razorpay_payment_id,
              payment_amount: amount,
              status: 'active'
            });

          if (error) {
            toast({
              title: "Error",
              description: "Failed to record purchase",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Success",
            description: "Course purchased successfully!",
          });
          
          onSuccess?.();
        },
        prefill: {
          name: user.user_metadata?.full_name,
          email: user.email,
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePurchase} 
      disabled={loading}
      className={className}
    >
      {loading ? "Processing..." : `Purchase ₹${amount}`}
    </Button>
  );
};
