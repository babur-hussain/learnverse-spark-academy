
<<<<<<< HEAD
import { loadScript } from '@/lib/utils';
=======
import { supabase } from '@/lib/supabase';
>>>>>>> main

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
<<<<<<< HEAD
  };
  handler: (response: any) => void;
}

export const initializeRazorpay = async () => {
  return new Promise((resolve) => {
=======
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
    
>>>>>>> main
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

<<<<<<< HEAD
export const createRazorpayOrder = async (courseId: string, amount: number) => {
  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ courseId, amount }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  
  return response.json();
=======
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
>>>>>>> main
};
