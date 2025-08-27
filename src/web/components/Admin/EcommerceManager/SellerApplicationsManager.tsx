import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Textarea } from '@/components/UI/textarea';
import { Label } from '@/components/UI/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: any;
  business_registration_number: string | null;
  status: string;
  rejected_reason: string | null;
  applied_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const statusColors = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500'
};

export function SellerApplicationsManager() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewingApplication, setViewingApplication] = useState<SellerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['seller-applications', selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('seller_applications')
        .select('*')
        .order('applied_at', { ascending: false });
      
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SellerApplication[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const { error } = await supabase
        .from('seller_applications')
        .update({ 
          status, 
          rejected_reason: reason || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;

      // If approved, add seller role to user
      if (status === 'approved') {
        const application = applications?.find(app => app.id === id);
        if (application) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: application.user_id, 
              role: 'seller'
            });
          // Ignore error if role already exists
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-applications'] });
      toast({ title: 'Application status updated successfully' });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
    },
    onError: (error) => {
      toast({ title: 'Error updating application status', description: error.message, variant: 'destructive' });
    }
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (application: SellerApplication) => {
    setViewingApplication(application);
    setIsRejectDialogOpen(true);
  };

  const submitRejection = () => {
    if (viewingApplication) {
      updateStatusMutation.mutate({ 
        id: viewingApplication.id, 
        status: 'rejected', 
        reason: rejectionReason 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <Badge 
        variant="secondary" 
        className={`${statusColors[status as keyof typeof statusColors]} text-white`}
      >
        {statusText}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Seller Applications</h2>
        <div className="flex gap-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['seller-applications'] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {applications?.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{application.business_name}</h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applied on {format(new Date(application.applied_at), 'PPp')}
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Email:</strong> {application.business_email}</p>
                    <p><strong>Phone:</strong> {application.business_phone}</p>
                    {application.business_registration_number && (
                      <p><strong>Registration:</strong> {application.business_registration_number}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Application Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Business Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Business Name:</strong> {application.business_name}
                            </div>
                            <div>
                              <strong>Email:</strong> {application.business_email}
                            </div>
                            <div>
                              <strong>Phone:</strong> {application.business_phone}
                            </div>
                            <div>
                              <strong>Registration:</strong> {application.business_registration_number || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Business Address</h4>
                          <div className="text-sm">
                            <p>{application.business_address.street}</p>
                            <p>
                              {application.business_address.city}, {application.business_address.state} - {application.business_address.postalCode}
                            </p>
                            <p>{application.business_address.country}</p>
                          </div>
                        </div>
                        
                        {application.rejected_reason && (
                          <div>
                            <h4 className="font-medium mb-2">Rejection Reason</h4>
                            <p className="text-sm text-red-600">{application.rejected_reason}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {application.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(application.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(application)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {application.status !== 'pending' && application.reviewed_at && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Reviewed on {format(new Date(application.reviewed_at), 'PPp')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {applications?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No applications found for the selected status.
        </div>
      )}

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Rejection *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this application..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={submitRejection}
                disabled={!rejectionReason.trim()}
              >
                Reject Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}