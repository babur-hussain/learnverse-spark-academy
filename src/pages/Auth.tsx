import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import { Button } from '@/components/UI/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/UI/form';
import { Input } from '@/components/UI/input';
import { BookOpen, User, UserCog, Check, ChevronRight, Phone } from 'lucide-react';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { Label } from '@/components/UI/label';
import { Separator } from '@/components/UI/separator';
import { Alert, AlertTitle } from '@/components/UI/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/UI/input-otp';
import { Dialog, DialogContent } from '@/components/UI/dialog';
import { ReferralInput } from '@/components/Auth/ReferralInput';

// Define schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).optional().or(z.literal('')),
  fullName: z.string().optional().or(z.literal('')),
  role: z.enum(['student', 'teacher'], { required_error: "Please select a role" }),
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;

const Auth = () => {
  const { platform } = usePlatform();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "phone">(() => {
    // Try to get the last active tab from localStorage
    const savedTab = localStorage.getItem('authActiveTab');
    return (savedTab as "login" | "register" | "phone") || "login";
  });

  // Function to update activeTab and save to localStorage
  const updateActiveTab = (tab: "login" | "register" | "phone") => {
    setActiveTab(tab);
    localStorage.setItem('authActiveTab', tab);
  };
  const { user, loading, login, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Platform-specific styling
  const getContainerPadding = () => {
    if (platform.isMobile) {
      return platform.isIOS ? 'py-8 px-4' : 'py-10 px-4';
    }
    return 'py-12 px-4 sm:px-6 lg:px-8';
  };

  const getCardWidth = () => {
    if (platform.isMobile) {
      return 'max-w-sm';
    }
    return 'max-w-md';
  };

  const getTitleSize = () => {
    if (platform.isMobile) {
      return 'text-2xl';
    }
    return 'text-3xl';
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Get referral code from URL params
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      fullName: '',
      role: 'student',
    },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  React.useEffect(() => {
    try {
      if (activeTab === "login") {
        loginForm.reset();
      } else if (activeTab === "register") {
        registerForm.reset();
      } else {
        phoneForm.reset();
      }
      setAuthError(null);
      setSuccessMessage(null);
    } catch (error) {
      console.error('Error resetting form:', error);
      // Fallback: manually clear forms
      setAuthError(null);
      setSuccessMessage(null);
    }
  }, [activeTab, loginForm, registerForm, phoneForm]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);
    
    try {
      // Validate form data before submission
      if (!data.email || !data.password || !data.role) {
        setAuthError("Please fill in all required fields");
        return;
      }

      const response = await signUp(data.email, data.password, {
        username: data.username || '',
        full_name: data.fullName || '',
        role: data.role as UserRole,
      });
      
      // Handle response with proper error checking
      if (!response) {
        setAuthError("Registration failed. Please try again.");
        return;
      }
      
      if (response.error) {
        setAuthError(response.error);
        
        // Only auto-switch to login for specific errors
        if (response.error === "Account already exists") {
          setTimeout(() => {
            setActiveTab("login");
          }, 3000); // Increased delay for better UX
        }
        return;
      }
      
      // Success case - process referral if provided
      if (response.user && referralCode) {
        try {
          await processReferralSignup(response.user.id);
        } catch (error) {
          console.error('Referral processing failed:', error);
          // Don't fail registration for referral issues
        }
      }
      
      // Show success message and let user choose when to switch
      setSuccessMessage("Registration successful! You can now sign in.");
      
      // Don't auto-switch - let user decide
      // setTimeout(() => {
      //   setActiveTab("login");
      // }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      let formattedPhone = data.phoneNumber;
      if (!formattedPhone.startsWith('+91')) {
        formattedPhone = '+91' + formattedPhone.replace(/^\+?91/, '');
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });

      if (error) throw error;

      setPhoneNumber(formattedPhone);
      setShowOTPDialog(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOTP = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Phone number verified successfully.",
      });
      setShowOTPDialog(false);
      navigate('/');

    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const processReferralSignup = async (newUserId: string) => {
    if (!referralCode) return;

    try {
      // const { data, error } = await supabase.rpc('process_referral_signup', {
      //   referral_code_input: referralCode,
      //   new_user_id: newUserId
      // });

      // if (error) {
      //   console.error('Error processing referral:', error);
      //   return;
      // }

      // if (data) {
      //   toast({
      //     title: "Referral Success!",
      //     description: "You've received a ₹50 discount coupon for your first purchase!",
      //   });
      // }
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  };

  if (user && !loading) {
    return <Navigate to="/" />;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 ${getContainerPadding()}`}>
      <div className={`${getCardWidth()} w-full space-y-8 bg-white p-8 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto`}>
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className={`mt-6 ${getTitleSize()} font-extrabold text-gray-900`}>
            {platform.isMobile ? 'Welcome Back' : 'Spark Academy'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {platform.isMobile ? 'Sign in to continue' : 'Your journey to academic success starts here'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => updateActiveTab(value as "login" | "register" | "phone")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>

          {authError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>{authError}</AlertTitle>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
              <Check className="h-4 w-4" />
              <AlertTitle>{successMessage}</AlertTitle>
            </Alert>
          )}

          <TabsContent value="login" className="mt-6 space-y-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your-email@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full gradient-primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
              <Separator className="relative">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
                  Or continue with
                </span>
              </Separator>

              <Button
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your-email@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Username
                          <Badge className="ml-2 bg-gray-100 text-gray-500 hover:bg-gray-100">Optional</Badge>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full Name
                          <Badge className="ml-2 bg-gray-100 text-gray-500 hover:bg-gray-100">Optional</Badge>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <ReferralInput
                  onReferralValidated={setReferralCode}
                  initialCode={referralCode || ''}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />
                
                <FormField
                  control={registerForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am registering as a:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                            field.value === 'student' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}>
                            <RadioGroupItem value="student" id="student" className="sr-only" />
                            <Label htmlFor="student" className="cursor-pointer flex flex-col items-center justify-center w-full">
                              <User className="h-6 w-6 mb-2 text-purple-700" />
                              <span className="font-medium">Student</span>
                            </Label>
                          </div>
                          
                          <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                            field.value === 'teacher' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}>
                            <RadioGroupItem value="teacher" id="teacher" className="sr-only" />
                            <Label htmlFor="teacher" className="cursor-pointer flex flex-col items-center justify-center w-full">
                              <UserCog className="h-6 w-6 mb-2 text-purple-700" />
                              <span className="font-medium">Teacher</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 gradient-primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : (
                    <>
                      Create account
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Success message with manual tab switch */}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-800">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">{successMessage}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => updateActiveTab("login")}
                >
                  Go to Sign In
                </Button>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <Separator className="relative">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
                  Or continue with
                </span>
              </Separator>

              <Button
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="phone" className="mt-6">
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                            <img 
                              src="/lovable-uploads/5f8332a7-0fd5-4cf0-ba9e-7f701f8b6385.png" 
                              alt="India flag" 
                              className="h-4 w-6 mr-2" 
                            />
                            +91
                          </div>
                          <Input
                            type="tel"
                            placeholder="Enter your mobile number"
                            className="pl-20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full gradient-primary flex items-center gap-2" 
                  disabled={isSubmitting}
                >
                  <Phone className="h-4 w-4" />
                  {isSubmitting ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
          <DialogContent className="sm:max-w-md">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Enter verification code</h2>
              <p className="text-sm text-gray-500">
                We've sent a code to {phoneNumber}
              </p>
              <InputOTP
                value={otp}
                onChange={(value) => setOtp(value)}
                maxLength={6}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, i) => (
                      <InputOTPSlot key={i} {...slot} index={i} />
                    ))}
                  </InputOTPGroup>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowOTPDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={verifyOTP} 
                  disabled={isSubmitting || otp.length !== 6}
                  className="gradient-primary"
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auth;
