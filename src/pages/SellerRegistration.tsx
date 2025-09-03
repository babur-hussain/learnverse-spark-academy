import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/Layout/MainLayout';
import { Store, FileText, MapPin, Phone, Mail } from 'lucide-react';

const SellerRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessRegistrationNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    }
  });

  const registerSellerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('seller_applications')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          business_email: formData.businessEmail,
          business_phone: formData.businessPhone,
          business_address: formData.address,
          business_registration_number: formData.businessRegistrationNumber || null,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description: 'Your seller application has been submitted successfully. We will review it and get back to you soon.'
      });
      navigate('/profile');
    },
    onError: (error) => {
      toast({
        title: 'Application Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerSellerMutation.mutate();
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-muted-foreground mb-4">You need to login to register as a seller.</p>
          <Button onClick={() => navigate('/auth')}>Login</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <Store className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
          <p className="text-muted-foreground">
            Join our marketplace and start selling your products to thousands of customers.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seller Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Business Information</h3>
                </div>

                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessEmail">Business Email *</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone">Business Phone *</Label>
                    <Input
                      id="businessPhone"
                      value={formData.businessPhone}
                      onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessRegistrationNumber">Business Registration Number (Optional)</Label>
                  <Input
                    id="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                    placeholder="GST Number, Company Registration, etc."
                  />
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Business Address</h3>
                </div>

                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, postalCode: e.target.value }
                      })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Benefits */}
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Seller Benefits:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Reach thousands of potential customers</li>
                  <li>• Easy product management dashboard</li>
                  <li>• Order tracking and management tools</li>
                  <li>• Secure payment processing</li>
                  <li>• Marketing and promotional support</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Your application will be reviewed by our team within 24-48 hours. 
                  You will receive an email notification once your application is approved.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerSellerMutation.isPending}
              >
                {registerSellerMutation.isPending ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SellerRegistration;