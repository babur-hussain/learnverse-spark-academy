
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Switch } from '@/components/UI/switch';
import { Edit, Trash2, MoveUp, MoveDown, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { FeaturedSubjectDialog } from './FeaturedSubjectsDialog';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from '@/components/UI/alert-dialog';
import { useUserRole } from '@/hooks/use-user-role';

interface SubjectData {
  title: string;
  description: string;
}

interface FeaturedSubject {
  id: string;
  subject_id: string;
  subject: SubjectData;
  is_active: boolean;
  order_index: number;
  promotional_text: string | null;
  cta_text: string | null;
}

export function FeaturedSubjectsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useUserRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<FeaturedSubject | undefined>(undefined);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: featuredSubjects, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-featured-subjects'],
    queryFn: async () => {
      try {
        if (!isAdmin) {
          throw new Error('Unauthorized access');
        }

        const { data, error } = await supabase
          .from('featured_subjects')
          .select(`
            id,
            subject_id,
            subject:subjects(title, description),
            is_active,
            order_index,
            promotional_text,
            cta_text
          `)
          .order('order_index');
        
        if (error) throw error;
        return data as FeaturedSubject[];
      } catch (err: any) {
        console.error('Error fetching featured subjects:', err);
        throw new Error(err.message || 'Failed to fetch featured subjects');
      }
    },
    enabled: isAdmin,
  });

  const toggleStatus = async (id: string, value: boolean) => {
    try {
      setProcessingId(id);
      
      const { error } = await supabase
        .from('featured_subjects')
        .update({ is_active: value })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Subject is now ${value ? 'active' : 'inactive'}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-featured-subjects'] });
      queryClient.invalidateQueries({ queryKey: ['featured-subjects'] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const updateOrder = async (id: string, direction: 'up' | 'down') => {
    if (!featuredSubjects) return;
    
    try {
      setProcessingId(id);
      const currentIndex = featuredSubjects.findIndex(sub => sub.id === id);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= featuredSubjects.length) return;
      
      // Get the two subjects we're swapping
      const currentSubject = featuredSubjects[currentIndex];
      const targetSubject = featuredSubjects[newIndex];
      
      // Swap their order indices
      const { error: error1 } = await supabase
        .from('featured_subjects')
        .update({ order_index: targetSubject.order_index })
        .eq('id', currentSubject.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('featured_subjects')
        .update({ order_index: currentSubject.order_index })
        .eq('id', targetSubject.id);
        
      if (error2) throw error2;
      
      toast({
        title: "Order updated",
        description: "The subject order has been updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-featured-subjects'] });
      queryClient.invalidateQueries({ queryKey: ['featured-subjects'] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleEdit = (subject: FeaturedSubject) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessingId(id);
      
      const { error } = await supabase
        .from('featured_subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Featured subject removed successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-featured-subjects'] });
      queryClient.invalidateQueries({ queryKey: ['featured-subjects'] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleAdd = () => {
    setSelectedSubject(undefined);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-featured-subjects'] });
    queryClient.invalidateQueries({ queryKey: ['featured-subjects'] });
  };

  if (!isAdmin) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p>You don't have permission to manage featured subjects.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Error Loading Featured Subjects</h3>
        <p>{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading featured subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Featured Subjects</h2>
        <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
          Add Featured Subject
        </Button>
      </div>
      
      {featuredSubjects?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>CTA Text</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {featuredSubjects.map((featured) => (
              <TableRow key={featured.id}>
                <TableCell className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateOrder(featured.id, 'up')}
                    disabled={featured === featuredSubjects[0] || !!processingId}
                  >
                    {processingId === featured.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoveUp className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateOrder(featured.id, 'down')}
                    disabled={featured === featuredSubjects[featuredSubjects.length - 1] || !!processingId}
                  >
                    {processingId === featured.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoveDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{featured.subject?.title}</TableCell>
                <TableCell>
                  <Switch
                    checked={featured.is_active}
                    onCheckedChange={(checked) => toggleStatus(featured.id, checked)}
                    disabled={processingId === featured.id}
                  />
                </TableCell>
                <TableCell>{featured.cta_text || 'Learn More'}</TableCell>
                <TableCell className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(featured)}
                    disabled={!!processingId}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!!processingId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Featured Subject</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove "{featured.subject?.title}" from featured subjects? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={processingId === featured.id}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(featured.id)}
                          disabled={processingId === featured.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {processingId === featured.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Removing...
                            </>
                          ) : 'Remove'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No featured subjects found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add some featured subjects to display on the homepage.</p>
          <Button onClick={handleAdd}>Add Featured Subject</Button>
        </div>
      )}

      <FeaturedSubjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        featuredSubject={selectedSubject}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
