import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../UI/Form';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatform } from '../../contexts/PlatformContext';
import { PlatformWrapper, WebOnly, MobileOnly } from '../Platform/PlatformWrapper';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../UI/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../UI/Tabs';
import { Separator } from '../UI/Separator';
import { Check, Phone, X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

// Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['student', 'teacher', 'parent']),
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, 'Invalid phone number'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Consolidated AuthDialog - Works on both web and mobile
 * Uses platform detection to show appropriate features
 */
const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const { platform, isPlatform } = usePlatform();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "phone">(() => {
    // Try to get the last active tab from localStorage
    const savedTab = localStorage.getItem('authActiveTab');
    return (savedTab as "login" | "register" | "phone") || "login";
  });

  const { login, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to update activeTab and save to localStorage
  const updateActiveTab = (tab: "login" | "register" | "phone") => {
    setActiveTab(tab);
    localStorage.setItem('authActiveTab', tab);
  };

  // Forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
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
    defaultValues: { phoneNumber: '' },
  });

  // Reset forms when tab changes
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
      setAuthError(null);
      setSuccessMessage(null);
    }
  }, [activeTab, loginForm, registerForm, phoneForm]);

  // Platform-specific styling
  const getDialogSize = () => {
    if (platform.isMobile) {
      return platform.isIOS ? 'max-w-sm' : 'max-w-md';
    }
    return 'sm:max-w-md';
  };

  const getPadding = () => {
    if (platform.isMobile) {
      return platform.isIOS ? 'p-4' : 'p-6';
    }
    return 'p-6';
  };

  // Handlers
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);
    try {
      await login(data.email, data.password);
      onOpenChange(false);
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
      if (!data.email || !data.password || !data.role) {
        setAuthError("Please fill in all required fields");
        return;
      }

      const response = await signUp(data.email, data.password, {
        username: data.username || '',
        full_name: data.fullName || '',
        role: data.role as any,
      });
      
      if (!response) {
        setAuthError("Registration failed. Please try again.");
        return;
      }
      
      if (response.error) {
        setAuthError(response.error);
        return;
      }
      
      setSuccessMessage("Registration successful! You can now sign in.");
      
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

      // Platform-specific phone handling
      if (platform.isMobile) {
        // Use native phone capabilities on mobile
        toast({
          title: "Mobile OTP",
          description: "Using native phone capabilities",
        });
      } else {
        // Web fallback
        toast({
          title: "Web OTP",
          description: "Sending OTP via web service",
        });
      }

      setPhoneNumber(formattedPhone);
      setShowOTPDialog(true);
      
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${getDialogSize()} max-h-[90vh] overflow-y-auto`}>
        {/* Platform-specific close button */}
        <MobileOnly>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </MobileOnly>
        
        <DialogHeader className={getPadding()}>
          <DialogTitle className="text-center">
            {platform.isMobile ? 'Welcome Back' : 'Sign In to Your Account'}
          </DialogTitle>
        </DialogHeader>
        
        <div className={getPadding()}>
          <Tabs value={activeTab} onValueChange={(value) => updateActiveTab(value as "login" | "register" | "phone")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
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
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
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
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="mt-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Choose a username"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="parent">Parent</option>
                          </select>
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
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>

              {/* Success message */}
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
            </TabsContent>

            {/* Phone Tab - Mobile Only */}
            <MobileOnly>
              <TabsContent value="phone" className="mt-6">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
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
            </MobileOnly>
          </Tabs>

          {/* Platform-specific features */}
          <div className="mt-4 space-y-4">
            <Separator className="relative">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
                Or continue with
              </span>
            </Separator>

            {/* Google Sign In - Available on all platforms */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                toast({
                  title: "Google Sign In",
                  description: `Signing in with Google on ${platform.platform}`,
                });
              }}
              disabled={isSubmitting}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Platform-specific additional options */}
            <WebOnly>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Web Feature",
                    description: "This feature is only available on web",
                  });
                }}
              >
                Web-Only Feature
              </Button>
            </WebOnly>

            <MobileOnly>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Mobile Feature",
                    description: "This feature is only available on mobile",
                  });
                }}
              >
                Mobile-Only Feature
              </Button>
            </MobileOnly>
          </div>
        </div>

        {/* Error display */}
        {authError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <span className="text-sm text-red-800">{authError}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
