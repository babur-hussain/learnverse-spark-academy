import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GuardianService } from '@/services/GuardianService';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/Layout/MainLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/UI/form';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Checkbox } from '@/components/UI/checkbox';
import { Switch } from '@/components/UI/switch';
import { Loader2, User, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().min(2, { message: "Name is too short" }),
  phone_number: z.string().optional(),
  app_notifications: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const GuardianRegistration: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      phone_number: '',
      app_notifications: true,
      email_notifications: true,
      sms_notifications: false,
      terms_accepted: false,
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const guardianData = {
        user_id: user.id,
        full_name: values.full_name,
        phone_number: values.phone_number || undefined,
        email: user.email || '',
        notification_preferences: {
          app: values.app_notifications,
          email: values.email_notifications,
          sms: values.sms_notifications,
        },
      };
      
      const guardian = await GuardianService.registerGuardian(guardianData);
      
      if (guardian) {
        toast({
          title: "Registration successful",
          description: "Your guardian account has been created",
        });
        navigate('/guardian-portal');
      } else {
        throw new Error("Failed to create guardian profile");
      }
    } catch (error) {
      console.error('Error creating guardian profile:', error);
      toast({
        title: "Registration failed",
        description: "Could not create your guardian account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to register as a guardian</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl">Guardian Registration</CardTitle>
            <CardDescription className="text-center">
              Register as a guardian to monitor your child's academic performance
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used for SMS notifications if enabled
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Notification Preferences</h3>
                  
                  <FormField
                    control={form.control}
                    name="app_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>App Notifications</FormLabel>
                          <FormDescription>
                            Receive alerts in the portal
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Email Notifications</FormLabel>
                          <FormDescription>
                            Receive alerts via email ({user.email})
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sms_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>SMS Notifications</FormLabel>
                          <FormDescription>
                            Receive alerts via text message
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!form.getValues().phone_number}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="terms_accepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Accept terms and conditions</FormLabel>
                        <FormDescription>
                          I agree to the privacy policy and terms of service
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <CardFooter className="px-0 flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register as Guardian
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GuardianRegistration;
