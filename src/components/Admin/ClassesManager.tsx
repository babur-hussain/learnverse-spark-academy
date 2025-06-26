import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ClassesManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [form, setForm] = useState<Partial<Class>>({ name: '', slug: '', order_index: 0, is_active: true });

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newClass: Partial<Class>) => {
      const payload = {
        name: newClass.name ?? '',
        slug: newClass.slug ?? '',
        order_index: typeof newClass.order_index === 'number' ? newClass.order_index : 0,
        is_active: typeof newClass.is_active === 'boolean' ? newClass.is_active : true,
      };
      const { data, error } = await supabase.from('classes').insert([payload]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      setDialogOpen(false);
      setForm({ name: '', slug: '', order_index: 0, is_active: true });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedClass: Partial<Class>) => {
      const { data, error } = await supabase
        .from('classes')
        .update(updatedClass)
        .eq('id', updatedClass.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      setDialogOpen(false);
      setEditClass(null);
      setForm({ name: '', slug: '', order_index: 0, is_active: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
    },
  });

  const handleEdit = (cls: Class) => {
    setEditClass(cls);
    setForm(cls);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editClass) {
      updateMutation.mutate(form);
    } else {
      addMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-xl font-semibold">Manage Classes</h2>
        <Button className="gradient-primary" onClick={() => { setDialogOpen(true); setEditClass(null); setForm({ name: '', slug: '', order_index: 0, is_active: true }); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
          ) : classes.length === 0 ? (
            <TableRow><TableCell colSpan={5}>No classes found.</TableCell></TableRow>
          ) : (
            classes.map((cls: Class) => (
              <TableRow key={cls.id}>
                <TableCell>{cls.name}</TableCell>
                <TableCell>{cls.slug}</TableCell>
                <TableCell>{cls.order_index}</TableCell>
                <TableCell>{cls.is_active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(cls)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
            <h3 className="text-lg font-bold mb-2">{editClass ? 'Edit Class' : 'Add Class'}</h3>
            <div className="space-y-2">
              <Input
                placeholder="Class Name"
                value={form.name || ''}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Slug (for URL)"
                value={form.slug || ''}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                required
              />
              <Input
                type="number"
                placeholder="Order Index"
                value={form.order_index ?? 0}
                onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                />
                Active
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editClass ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClassesManager; 