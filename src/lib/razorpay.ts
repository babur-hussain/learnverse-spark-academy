
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  key: string;
  amount: number; // in smallest currency unit (paise for INR)
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
}

export const initializeRazorpay = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (itemType: 'course' | 'note', itemId: string, amount: number) => {
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { 
      itemType,
      itemId, 
      amount: Math.round(amount * 100) // Convert to paise
    }
  });
  
  if (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
  
  return data;
};

export const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  itemType: 'course' | 'note';
  itemId: string;
}) => {
  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: paymentData
  });
  
  if (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Payment verification failed');
  }
  
  return data;
};
