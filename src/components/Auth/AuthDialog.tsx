import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, User, Phone, X } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePlatform } from "@/contexts/PlatformContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Form schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup" | "phone";
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  open,
  onOpenChange,
  defaultTab = "login"
}) => {
  const { platform } = usePlatform();
  const { signIn, signUp, signInWithPhone } = useAuth();
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form instances
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" }
  });

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" }
  });

  // Reset forms when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      loginForm.reset();
      signupForm.reset();
      phoneForm.reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsLoading(false);
    }
  }, [open, loginForm, signupForm, phoneForm]);

  // Handle form submissions
  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success("Welcome back!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      toast.success("Account created successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      await signInWithPhone(data.phoneNumber);
      toast.success("OTP sent to your phone!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Cross-platform input component with bulletproof Android support
  const CrossPlatformInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & {
      label: string;
      icon?: React.ReactNode;
      error?: string;
      showPasswordToggle?: boolean;
      showPassword?: boolean;
      onTogglePassword?: () => void;
    }
  >(({ 
    label, 
    icon, 
    error, 
    showPasswordToggle, 
    showPassword, 
    onTogglePassword,
    className = "",
    ...props 
  }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!, []);

    // Bulletproof Android input handling
    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      
      if (platform.isAndroid) {
        e.stopPropagation();
        
        // Force focus
        setTimeout(() => {
          input.focus();
          input.click();
        }, 10);
        
        // Keep focus stable
        let attempts = 0;
        const keepFocus = setInterval(() => {
          if (attempts >= 30) { // 3 seconds max
            clearInterval(keepFocus);
            return;
          }
          
          if (document.activeElement !== input) {
            input.focus();
          }
          attempts++;
        }, 100);
        
        // Clear interval when input gets stable focus
        const clearOnStableFocus = () => {
          clearInterval(keepFocus);
          input.removeEventListener('focus', clearOnStableFocus);
        };
        input.addEventListener('focus', clearOnStableFocus);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) props.onFocus(e);
      
      if (platform.isAndroid) {
        // Prevent viewport jumping
        setTimeout(() => {
          e.target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (props.onBlur) props.onBlur(e);
    };

    return (
      <div className="space-y-2">
        <Label 
          htmlFor={props.id} 
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </Label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <Input
            ref={inputRef}
            className={`
              ${icon ? 'pl-10' : 'pl-3'}
              ${showPasswordToggle ? 'pr-10' : 'pr-3'}
              ${platform.isMobile ? 'h-11 text-sm' : 'h-12 text-base'} border-2 transition-all duration-200
              ${isFocused 
                ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg' 
                : error 
                  ? 'border-red-500 ring-2 ring-red-500/20' 
                  : 'border-gray-300 hover:border-gray-400'
              }
              ${platform.isAndroid ? 'touch-manipulation' : ''}
              ${className}
            `}
            style={{
              fontSize: '16px', // Prevent zoom on iOS
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent',
              ...(platform.isAndroid && {
                touchAction: 'manipulation',
                WebkitUserSelect: 'text',
                userSelect: 'text',
              })
            }}
            onClick={handleInputClick}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  });

  CrossPlatformInput.displayName = "CrossPlatformInput";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          w-full mx-auto p-0 gap-0 flex flex-col
          ${platform.isMobile 
            ? 'fixed top-[2vh] left-1/2 transform -translate-x-1/2 max-h-[96vh] w-[98vw] max-w-[98vw]' 
            : 'max-w-md max-h-[85vh]'
          }
        `}
        style={platform.isMobile ? {
          position: 'fixed',
          zIndex: 9999,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          minHeight: '400px',
        } : undefined}
      >
        {/* Header - Fixed */}
        <DialogHeader className={`flex-shrink-0 border-b border-gray-100 space-y-1 ${platform.isMobile ? 'p-4 pb-3' : 'p-6 pb-4'}`}>
          <div className="flex items-center justify-between">
            <DialogTitle className={`font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ${platform.isMobile ? 'text-xl' : 'text-2xl'}`}>
              Welcome to LearnVerse
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex-shrink-0"
            >
              <X size={18} />
            </Button>
          </div>
          <p className={`text-gray-600 dark:text-gray-400 ${platform.isMobile ? 'text-sm' : ''}`}>
            Sign in to your account or create a new one
          </p>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto ${platform.isMobile ? 'px-4 pb-4' : 'px-6 pb-6'}`} style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
            <TabsList className={`grid w-full grid-cols-3 ${platform.isMobile ? 'mb-4' : 'mb-6'}`}>
              <TabsTrigger value="login" className={`${platform.isMobile ? 'text-xs py-2' : 'text-sm'}`}>Login</TabsTrigger>
              <TabsTrigger value="signup" className={`${platform.isMobile ? 'text-xs py-2' : 'text-sm'}`}>Sign Up</TabsTrigger>
              <TabsTrigger value="phone" className={`${platform.isMobile ? 'text-xs py-2' : 'text-sm'}`}>Phone</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className={`${platform.isMobile ? 'text-lg' : 'text-xl'}`}>Sign in to your account</CardTitle>
                  <CardDescription className={`${platform.isMobile ? 'text-sm' : ''}`}>
                    Enter your email and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className={`px-0 ${platform.isMobile ? 'space-y-3' : 'space-y-4'}`}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className={`${platform.isMobile ? 'space-y-3' : 'space-y-4'}`}>
                    <CrossPlatformInput
                      id="login-email"
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      icon={<Mail size={18} />}
                      autoComplete="email"
                      error={loginForm.formState.errors.email?.message}
                      {...loginForm.register("email")}
                    />

                    <CrossPlatformInput
                      id="login-password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      icon={<Lock size={18} />}
                      autoComplete="current-password"
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      error={loginForm.formState.errors.password?.message}
                      {...loginForm.register("password")}
                    />

                    <Button
                      type="submit"
                      className={`w-full ${platform.isMobile ? 'h-11 text-sm' : 'h-12 text-base'} font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200`}
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className={`${platform.isMobile ? 'text-lg' : 'text-xl'}`}>Create your account</CardTitle>
                  <CardDescription className={`${platform.isMobile ? 'text-sm' : ''}`}>
                    Fill in your details to get started with LearnVerse
                  </CardDescription>
                </CardHeader>
                <CardContent className={`px-0 ${platform.isMobile ? 'space-y-3' : 'space-y-4'}`}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className={`${platform.isMobile ? 'space-y-3' : 'space-y-4'}`}>
                    <CrossPlatformInput
                      id="signup-fullname"
                      label="Full Name"
                      type="text"
                      placeholder="Enter your full name"
                      icon={<User size={18} />}
                      autoComplete="name"
                      error={signupForm.formState.errors.fullName?.message}
                      {...signupForm.register("fullName")}
                    />

                    <CrossPlatformInput
                      id="signup-email"
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      icon={<Mail size={18} />}
                      autoComplete="email"
                      error={signupForm.formState.errors.email?.message}
                      {...signupForm.register("email")}
                    />

                    <CrossPlatformInput
                      id="signup-password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      icon={<Lock size={18} />}
                      autoComplete="new-password"
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      error={signupForm.formState.errors.password?.message}
                      {...signupForm.register("password")}
                    />

                    <CrossPlatformInput
                      id="signup-confirm-password"
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      icon={<Lock size={18} />}
                      autoComplete="new-password"
                      showPasswordToggle
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                      error={signupForm.formState.errors.confirmPassword?.message}
                      {...signupForm.register("confirmPassword")}
                    />

                    <Button
                      type="submit"
                      className={`w-full ${platform.isMobile ? 'h-11 text-sm' : 'h-12 text-base'} font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200`}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Phone Tab */}
            <TabsContent value="phone" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className={`${platform.isMobile ? 'text-lg' : 'text-xl'}`}>Sign in with phone</CardTitle>
                  <CardDescription className={`${platform.isMobile ? 'text-sm' : ''}`}>
                    Enter your phone number to receive an OTP
                  </CardDescription>
                </CardHeader>
                <CardContent className={`px-0 ${platform.isMobile ? 'space-y-3' : 'space-y-4'}`}>
                  <form onSubmit={phoneForm.handleSubmit(handlePhoneAuth)} className={`${platform.isMobile ? 'space-y-3' : 'space-y-4'}`}>
                    <CrossPlatformInput
                      id="phone-number"
                      label="Phone Number"
                      type="tel"
                      placeholder="Enter your phone number"
                      icon={<Phone size={18} />}
                      autoComplete="tel"
                      error={phoneForm.formState.errors.phoneNumber?.message}
                      {...phoneForm.register("phoneNumber")}
                    />

                    <Button
                      type="submit"
                      className={`w-full ${platform.isMobile ? 'h-11 text-sm' : 'h-12 text-base'} font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200`}
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Separator className="my-4" />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              By continuing, you agree to our{" "}
              <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;