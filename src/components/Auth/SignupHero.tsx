
import React, { useState } from 'react';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/UI/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/UI/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SignupHero = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // If user is logged in, don't show the signup section
  if (user) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('91') && value.length > 0) {
      value = '91' + value;
    }
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    setPhoneNumber(value);
  };

  const formatPhoneNumber = (number: string) => {
    if (!number) return '';
    if (number.startsWith('91')) {
      return '+' + number;
    }
    return '+91' + number;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });

      if (error) throw error;

      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
      setShowOTPDialog(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    setIsLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Phone number verified successfully.",
      });
      setShowOTPDialog(false);

    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
            Crack your goal
            <br />
            with India's top educators
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Over <span className="text-green-500 font-semibold">10 crore</span> learners trust us for their preparation
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                <img 
                  src="/public/lovable-uploads/5f8332a7-0fd5-4cf0-ba9e-7f701f8b6385.png" 
                  alt="India flag" 
                  className="h-4 w-6 mr-2" 
                />
                +91
              </div>
              <Input
                type="tel"
                placeholder="Enter your mobile number"
                className="pl-20 h-14 text-lg bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
                value={phoneNumber.replace(/^91/, '')}
                onChange={handlePhoneChange}
                disabled={isLoading}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We'll send an OTP for verification
            </p>
            <Button 
              type="submit" 
              className="w-full h-14 text-lg bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
              disabled={isLoading || phoneNumber.length < 10}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Join for free
            </Button>
          </form>
        </div>
        
        <div className="relative hidden md:block">
          <div className="aspect-square relative">
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full overflow-hidden shadow-lg transform transition-transform hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                alt="Student learning"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full overflow-hidden shadow-lg transform transition-transform hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                alt="Student with tablet"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full overflow-hidden shadow-lg transform transition-transform hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                alt="Student reading"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-8 right-0 w-52 h-52 rounded-full overflow-hidden shadow-lg transform transition-transform hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                alt="Student on phone"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-gray-100">Enter verification code</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We've sent a code to {formatPhoneNumber(phoneNumber)}
            </p>
            <InputOTP
              value={otp}
              onChange={(value) => setOtp(value)}
              maxLength={6}
              render={({ slots }) => (
                <InputOTPGroup className="gap-2">
                  {slots.map((slot, i) => (
                    <InputOTPSlot key={i} {...slot} index={i} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                  ))}
                </InputOTPGroup>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowOTPDialog(false)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button 
                onClick={verifyOTP} 
                disabled={isLoading || otp.length !== 6}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Verify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignupHero;
