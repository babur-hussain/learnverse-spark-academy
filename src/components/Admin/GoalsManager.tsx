
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/UI/dialog';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/UI/switch';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  exam_code: string;
  icon: string;
  is_popular: boolean;
  active: boolean;
  order_index: number;
}

const GoalsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState<Partial<Goal>>({
    title: '',
    exam_code: '',
    icon: '',
    is_popular: false,
    active: true
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['admin-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data as Goal[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (goal: Partial<Goal>) => {
      // Make sure required fields are present
      if (!goal.title || !goal.exam_code || !goal.icon) {
        throw new Error("Title, exam code, and icon are required fields");
      }

      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update({
            title: goal.title,
            exam_code: goal.exam_code,
            icon: goal.icon,
            is_popular: goal.is_popular,
            active: goal.active
          })
          .eq('id', editingGoal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('goals')
          .insert({
            title: goal.title,
            exam_code: goal.exam_code,
            icon: goal.icon,
            is_popular: goal.is_popular,
            active: goal.active
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
      setIsDialogOpen(false);
      setEditingGoal(null);
      setFormData({
        title: '',
        exam_code: '',
        icon: '',
        is_popular: false,
        active: true
      });
      toast({
        title: editingGoal ? 'Goal Updated' : 'Goal Created',
        description: editingGoal ? 'The goal has been updated successfully.' : 'A new goal has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
      toast({
        title: 'Goal Deleted',
        description: 'The goal has been deleted successfully.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.exam_code || !formData.icon) {
      toast({
        title: 'Validation Error',
        description: 'Title, exam code, and icon are required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    mutation.mutate(formData);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      exam_code: goal.exam_code,
      icon: goal.icon,
      is_popular: goal.is_popular,
      active: goal.active
    });
    setIsDialogOpen(true);
  };

  const breadcrumbItems = [
    { label: 'Admin', href: '/admin' },
    { label: 'Goals Management' }
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <BreadcrumbNav items={breadcrumbItems} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Goals</h2>
        <Button onClick={() => {
          setEditingGoal(null);
          setFormData({
            title: '',
            exam_code: '',
            icon: '',
            is_popular: false,
            active: true
          });
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Exam Code</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Popular</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals?.map((goal) => (
            <TableRow key={goal.id}>
              <TableCell>{goal.title}</TableCell>
              <TableCell>{goal.exam_code}</TableCell>
              <TableCell>{goal.icon}</TableCell>
              <TableCell>
                <Switch 
                  checked={goal.is_popular}
                  onCheckedChange={async (checked) => {
                    const { error } = await supabase
                      .from('goals')
                      .update({ is_popular: checked })
                      .eq('id', goal.id);
                    if (error) {
                      toast({
                        title: 'Error',
                        description: error.message,
                        variant: 'destructive',
                      });
                    } else {
                      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <Switch 
                  checked={goal.active}
                  onCheckedChange={async (checked) => {
                    const { error } = await supabase
                      .from('goals')
                      .update({ active: checked })
                      .eq('id', goal.id);
                    if (error) {
                      toast({
                        title: 'Error',
                        description: error.message,
                        variant: 'destructive',
                      });
                    } else {
                      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(goal)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this goal?')) {
                        deleteMutation.mutate(goal.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Exam Code</label>
              <Input
                value={formData.exam_code}
                onChange={(e) => setFormData(prev => ({ ...prev, exam_code: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                required
                placeholder="target"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_popular: checked }))
                }
              />
              <label htmlFor="is-popular" className="text-sm font-medium">
                Popular Goal
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={formData.active}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, active: checked }))
                }
              />
              <label htmlFor="is-active" className="text-sm font-medium">
                Active
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGoal ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsManager;
