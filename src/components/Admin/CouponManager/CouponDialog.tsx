
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Textarea } from '@/components/UI/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Plus, Edit } from 'lucide-react';

interface Coupon {
  id?: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount?: number;
  usage_limit?: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applicable_to: 'all' | 'courses' | 'notes';
}

interface CouponDialogProps {
  coupon?: Coupon;
  onSuccess: () => void;
}

export const CouponDialog: React.FC<CouponDialogProps> = ({ coupon, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Coupon>({
    code: coupon?.code || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value || 0,
    minimum_amount: coupon?.minimum_amount || 0,
    usage_limit: coupon?.usage_limit || undefined,
    valid_from: coupon?.valid_from || new Date().toISOString().slice(0, 16),
    valid_until: coupon?.valid_until || '',
    is_active: coupon?.is_active ?? true,
    applicable_to: coupon?.applicable_to || 'all'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null
      };

      if (coupon?.id) {
        const { error } = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', coupon.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coupon updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([payload]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coupon created successfully.",
        });
      }

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save coupon.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={coupon ? "outline" : "default"} size="sm">
          {coupon ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
          {coupon ? '' : 'Add Coupon'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
                required
              />
            </div>
            <div>
              <Label htmlFor="applicable_to">Applicable To</Label>
              <Select value={formData.applicable_to} onValueChange={(value: 'all' | 'courses' | 'notes') => setFormData({ ...formData, applicable_to: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="courses">Courses Only</SelectItem>
                  <SelectItem value="notes">Notes Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_type">Discount Type</Label>
              <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discount_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discount_value">
                Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                min="0"
                max={formData.discount_type === 'percentage' ? "100" : undefined}
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimum_amount">Minimum Amount (₹)</Label>
              <Input
                id="minimum_amount"
                type="number"
                value={formData.minimum_amount || ''}
                onChange={(e) => setFormData({ ...formData, minimum_amount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_from">Valid From</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="valid_until">Valid Until (optional)</Label>
              <Input
                id="valid_until"
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : coupon ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
