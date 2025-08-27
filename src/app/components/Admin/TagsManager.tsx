
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/table';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/UI/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Tag {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

const TagsManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newTag, setNewTag] = useState({ name: '', type: '' });
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Tag types
  const tagTypes = [
    { id: 'class', name: 'Class' },
    { id: 'exam', name: 'Exam' },
    { id: 'course', name: 'Course' },
    { id: 'semester', name: 'Semester' },
    { id: 'subject', name: 'Subject' },
    { id: 'difficulty', name: 'Difficulty' },
    { id: 'other', name: 'Other' }
  ];

  // Fetch tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('type')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching tags',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as Tag[];
    }
  });

  // Create tag
  const createTag = useMutation({
    mutationFn: async (tag: { name: string; type: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name: tag.name, type: tag.type }])
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Error creating tag',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Tag created',
        description: 'The tag has been created successfully.'
      });
      setNewTag({ name: '', type: '' });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setDialogOpen(false);
    }
  });

  // Update tag
  const updateTag = useMutation({
    mutationFn: async (tag: Tag) => {
      const { data, error } = await supabase
        .from('tags')
        .update({ name: tag.name, type: tag.type })
        .eq('id', tag.id)
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Error updating tag',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Tag updated',
        description: 'The tag has been updated successfully.'
      });
      setEditingTag(null);
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setDialogOpen(false);
    }
  });

  // Delete tag
  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: 'Error deleting tag',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Tag deleted',
        description: 'The tag has been deleted successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });

  // Filter tags based on search query
  const filteredTags = tags.filter(
    tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           tag.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateOrUpdate = () => {
    if (editingTag) {
      updateTag.mutate({
        ...editingTag,
        name: newTag.name,
        type: newTag.type
      });
    } else {
      createTag.mutate(newTag);
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setNewTag({
      name: tag.name,
      type: tag.type
    });
    setDialogOpen(true);
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setEditingTag(null);
      setNewTag({ name: '', type: '' });
    }
    setDialogOpen(open);
  };

  const handleDeleteTag = (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      deleteTag.mutate(tagId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-xl font-semibold">Manage Tags</h2>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTag ? 'Edit Tag' : 'Add New Tag'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Tag Name</label>
                  <Input
                    id="name"
                    placeholder="Enter tag name"
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">Tag Type</label>
                  <Select
                    value={newTag.type}
                    onValueChange={(value) => setNewTag({ ...newTag, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tag type" />
                    </SelectTrigger>
                    <SelectContent>
                      {tagTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateOrUpdate}
                  disabled={!newTag.name.trim() || !newTag.type}
                  className="gradient-primary"
                >
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? (
            <p className="text-muted-foreground">No tags matching your search</p>
          ) : (
            <p className="text-muted-foreground">No tags found. Add your first tag to get started.</p>
          )}
        </div>
      ) : (
        <Table>
          <TableCaption>List of tags for categorizing notes</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>
                  <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-slate-100">
                    {tag.type.charAt(0).toUpperCase() + tag.type.slice(1)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTag(tag)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default TagsManager;
