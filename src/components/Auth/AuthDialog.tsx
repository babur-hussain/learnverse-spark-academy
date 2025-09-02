import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import { PlatformWrapper, WebOnly, MobileOnly } from '@/components/Platform/PlatformWrapper';
import { Button } from '@/components/UI/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/UI/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/UI/form';
import { Input } from '@/components/UI/input';
import { BookOpen, X, User, UserCog, Check, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { Label } from '@/components/UI/label';
import { Separator } from '@/components/UI/separator';
import { Alert, AlertTitle } from '@/components/UI/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/UI/input-otp';
import { ReferralInput } from './ReferralInput';

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

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const { platform, isPlatform } = usePlatform();
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
  const { login, signUp, testConnection } = useAuth();
  
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

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
      setShowOTPDialog(false);
      setOtp('');
    } catch (error) {
      console.error('Error resetting form:', error);
      // Fallback: manually clear forms
      setAuthError(null);
      setSuccessMessage(null);
      setShowOTPDialog(false);
      setOtp('');
    }
  }, [activeTab, loginForm, registerForm, phoneForm]);

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

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);
    
    try {
      // Clear any previous errors
      loginForm.clearErrors();
      
      console.log('Submitting login form with:', { email: data.email, passwordLength: data.password.length });
      
      const result = await login(data.email, data.password);
      
      console.log('Login result:', result);
      
      // Check if login was successful
      if (result && result.success) {
        // Show success message and delay closing
        setSuccessMessage("Login successful! Welcome back!");
        
        // Close dialog after showing success message
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      } else {
        // This shouldn't happen if login is working properly
        setAuthError("Login completed but no success response received. Please try again.");
      }
      
    } catch (error: any) {
      console.error('Login error in AuthDialog:', error);
      
      // Set the error message
      const errorMessage = error.message || "Failed to sign in. Please try again.";
      setAuthError(errorMessage);
      
      // If it's a credential error, focus on the password field
      if (errorMessage.includes('Invalid email or password')) {
        loginForm.setError('password', {
          type: 'manual',
          message: 'Invalid password'
        });
        // Focus on password field for better UX
        setTimeout(() => {
          const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
          if (passwordInput) passwordInput.focus();
        }, 100);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);
    
          try {
        // Clear any previous errors
        registerForm.clearErrors();
        
        const result = await signUp(data.email, data.password, {
          username: data.username,
          full_name: data.fullName,
          role: data.role
        });
        
        if (result?.error) {
          setAuthError(result.error);
          
          // Set specific field errors if available
          if (result.error.includes('email already exists')) {
            registerForm.setError('email', {
              type: 'manual',
              message: 'An account with this email already exists'
            });
          } else if (result.error.includes('Password must be at least')) {
            registerForm.setError('password', {
              type: 'manual',
              message: 'Password must be at least 6 characters'
            });
          } else if (result.error.includes('Invalid email')) {
            registerForm.setError('email', {
              type: 'manual',
              message: 'Please enter a valid email address'
            });
          }
          
          return;
        }
        
        if (result?.user) {
          // Show success message
          setSuccessMessage("Registration successful! Please check your email for verification.");
          
          // Process referral if available
          if (referralCode) {
            await processReferralSignup(result.user.id);
          }
          
          // Switch to login tab after successful registration
          setTimeout(() => {
            setActiveTab("login");
            setSuccessMessage(null);
            setAuthError(null);
          }, 2000);
        }
      
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
      // Clear any previous errors
      phoneForm.clearErrors();
      
      let formattedPhone = data.phoneNumber;
      if (!formattedPhone.startsWith('+91')) {
        formattedPhone = '+91' + data.phoneNumber.replace(/^\+?91/, '');
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
      console.error('Phone OTP error:', error);
      setAuthError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOTP = async () => {
    setIsSubmitting(true);
    setAuthError(null);
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
      onOpenChange(false);

    } catch (error: any) {
      console.error('OTP verification error:', error);
      setAuthError(error.message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setAuthError(error.message || "Google sign-in failed. Please try again.");
    }
  };

  // Prevent dialog from closing on Android when interacting with forms
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if explicitly requested (not due to accidental touches)
    if (!newOpen && platform.isAndroid) {
      // Add a small delay to prevent accidental closes on Android
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={`${getDialogSize()} max-h-[90vh] overflow-y-auto android-dialog-fix`}
        onPointerDownOutside={(e) => {
          // Prevent closing on Android when clicking outside during form interaction
          if (platform.isAndroid) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing on Android when interacting outside
          if (platform.isAndroid) {
            e.preventDefault();
          }
        }}
      >
        {/* Android-specific close button */}
        {platform.isAndroid ? (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-white shadow-md p-1"
            type="button"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        ) : (
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
        
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center">
            {platform.isMobile ? 'Welcome Back' : 'Spark Academy'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {platform.isMobile ? 'Sign in to continue' : 'Your journey to academic success starts here'}
          </DialogDescription>
        </DialogHeader>

        <div className={getPadding()}>
          <Tabs value={activeTab} onValueChange={(value) => updateActiveTab(value as "login" | "register" | "phone")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            {authError && (
              <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50 text-red-800">
                <AlertTitle className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {authError}
                </AlertTitle>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
                <Check className="h-4 w-4" />
                <AlertTitle>{successMessage}</AlertTitle>
              </Alert>
            )}

            <TabsContent value="login" className="mt-6">
              <Form {...loginForm}>
                <form 
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
                  className="space-y-4"
                  onTouchStart={(e) => {
                    // Prevent Android from closing dialog on form interaction
                    if (platform.isAndroid) {
                      e.stopPropagation();
                    }
                  }}
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your-email@example.com" 
                            type="email" 
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                            onFocus={(e) => {
                              // Prevent Android keyboard from closing dialog
                              if (platform.isAndroid) {
                                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }}
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
                            placeholder="••••••••" 
                            name="password"
                            autoComplete="current-password"
                            onFocus={(e) => {
                              // Prevent Android keyboard from closing dialog
                              if (platform.isAndroid) {
                                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }}
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
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                  

                  
                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => {
                        toast({
                          title: "Password Reset",
                          description: "Please contact support to reset your password.",
                        });
                      }}
                    >
                      Forgot your password?
                    </button>
                    
                    <div className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        className="text-learn-purple hover:text-purple-700 font-medium transition-colors"
                        onClick={() => updateActiveTab("register")}
                      >
                        Sign up here
                      </button>
                    </div>
                  </div>
                </form>
              </Form>

              <div className="mt-4 space-y-4">
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
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                {/* Platform-specific features */}
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
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <Form {...registerForm}>
                <form 
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)} 
                  className="space-y-4"
                  onTouchStart={(e) => {
                    if (platform.isAndroid) {
                      e.stopPropagation();
                    }
                  }}
                >
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your-email@example.com" 
                            type="email" 
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                            onFocus={(e) => {
                              if (platform.isAndroid) {
                                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="johndoe" 
                              autoComplete="username"
                              onFocus={(e) => {
                                if (platform.isAndroid) {
                                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }}
                              {...field} 
                            />
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
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              autoComplete="name"
                              onFocus={(e) => {
                                if (platform.isAndroid) {
                                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }}
                              {...field} 
                            />
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
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            name="password"
                            autoComplete="new-password"
                            onFocus={(e) => {
                              if (platform.isAndroid) {
                                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-2" />
                  
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
                            className="grid grid-cols-2 gap-2"
                          >
                            <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer ${
                              field.value === 'student' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                            }`}>
                              <RadioGroupItem value="student" id="dialog-student" className="sr-only" />
                              <Label htmlFor="dialog-student" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                <User className="h-5 w-5 mb-1 text-purple-700" />
                                <span className="font-medium">Student</span>
                              </Label>
                            </div>
                            
                            <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer ${
                              field.value === 'teacher' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                            }`}>
                              <RadioGroupItem value="teacher" id="dialog-teacher" className="sr-only" />
                              <Label htmlFor="dialog-teacher" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                <UserCog className="h-5 w-5 mb-1 text-purple-700" />
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
                    className="w-full gradient-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        type="button"
                        className="text-learn-purple hover:text-purple-700 font-medium transition-colors"
                        onClick={() => updateActiveTab("login")}
                      >
                        Sign in here
                      </button>
                    </div>
                  </div>
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

              <div className="mt-4 space-y-4">
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
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="mt-6">
              <Form {...phoneForm}>
                <form 
                  onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} 
                  className="space-y-4"
                  onTouchStart={(e) => {
                    if (platform.isAndroid) {
                      e.stopPropagation();
                    }
                  }}
                >
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
                              autoComplete="tel"
                              inputMode="numeric"
                              onFocus={(e) => {
                                if (platform.isAndroid) {
                                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }}
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
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Prefer email?{' '}
                      <button
                        type="button"
                        className="text-learn-purple hover:text-purple-700 font-medium transition-colors"
                        onClick={() => updateActiveTab("login")}
                      >
                        Sign in with email
                      </button>
                    </div>
                  </div>
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
                
                {authError && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                    <AlertTitle className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {authError}
                    </AlertTitle>
                  </Alert>
                )}
                
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
                
                <div className="text-center text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    className="text-learn-purple hover:text-purple-700 font-medium transition-colors"
                    onClick={() => {
                      setOtp('');
                      setShowOTPDialog(false);
                      setActiveTab("phone");
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
                
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
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
