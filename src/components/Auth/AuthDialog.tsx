
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, UserRole } from '@/contexts/AuthContext';
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
import { BookOpen, X, User, UserCog, Check } from 'lucide-react';
import AdminLoginInfo from './AdminLoginInfo';
import { Badge } from '@/components/UI/badge';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { Label } from '@/components/UI/label';
import { Separator } from '@/components/UI/separator';
import { Alert, AlertTitle } from '@/components/UI/alert';

// Define schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).optional(),
  fullName: z.string().optional(),
  role: z.enum(['student', 'teacher']),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { login, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  React.useEffect(() => {
    // Reset form state and error when switching between login and register
    if (activeTab === "login") {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
    setAuthError(null);
    setSuccessMessage(null);
  }, [activeTab]);

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
      const response = await signUp(data.email, data.password, {
        username: data.username,
        full_name: data.fullName,
        role: data.role as UserRole,
      });
      
      if (response && response.error) {
        setAuthError(response.error);
        
        // Switch to login form if account already exists
        if (response.error === "Account already exists") {
          setTimeout(() => {
            setActiveTab("login");
          }, 2000);
        }
      } else {
        // Registration was successful
        setSuccessMessage("Registration successful! You can now sign in.");
        setTimeout(() => {
          setActiveTab("login");
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseAdminCredentials = () => {
    loginForm.setValue('email', ADMIN_EMAIL);
    loginForm.setValue('password', ADMIN_PASSWORD);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center">
            Spark Academy
          </DialogTitle>
          <DialogDescription className="text-center">
            Your journey to academic success starts here
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
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

              <AdminLoginInfo onUseAdminCredentials={handleUseAdminCredentials} />
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
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

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
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
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
