import React, { useState, useEffect } from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Switch } from '@/components/UI/switch';
import { Badge } from '@/components/UI/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/UI/alert-dialog';
import { Plus, Edit, Trash2, Upload, Baby, Star, Eye, Users, TrendingUp, BookOpen, Play, Music, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DataTable from '@/components/UI/DataTable';

interface KidsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  age_group: 'infants' | 'preschool';
  icon: string;
  color_gradient: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface KidsContentItem {
  id: string;
  category_id: string;
  title: string;
  description: string;
  content_type: 'video' | 'flashcard' | 'game' | 'rhyme' | 'story' | 'activity';
  thumbnail_url?: string;
  content_url?: string;
  content_data?: any;
  duration_minutes?: number;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: KidsCategory;
}

const KidsManager = () => {
  const [categories, setCategories] = useState<KidsCategory[]>([]);
  const [contentItems, setContentItems] = useState<KidsContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<KidsCategory | null>(null);
  const [selectedContentItem, setSelectedContentItem] = useState<KidsContentItem | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const iconOptions = [
    { value: 'BookOpen', label: 'Book Open', icon: BookOpen },
    { value: 'Play', label: 'Play', icon: Play },
    { value: 'Music', label: 'Music', icon: Music },
    { value: 'Gamepad2', label: 'Game Controller', icon: Gamepad2 },
    { value: 'Baby', label: 'Baby', icon: Baby },
    { value: 'Star', label: 'Star', icon: Star },
  ];

  const colorGradients = [
    'from-pink-400 to-rose-400',
    'from-purple-400 to-pink-400',
    'from-indigo-400 to-purple-400',
    'from-teal-400 to-cyan-400',
    'from-blue-500 to-indigo-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-purple-500 to-pink-500',
  ];

  useEffect(() => {
    fetchCategories();
    fetchContentItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('kids_content_categories')
        .select('*')
        .order('age_group', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories((data as KidsCategory[]) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchContentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('kids_content_items')
        .select(`
          *,
          category:kids_content_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentItems((data as KidsContentItem[]) || []);
    } catch (error) {
      console.error('Error fetching content items:', error);
      toast.error('Failed to fetch content items');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const categoryData = {
      name: formData.get('name') as string,
      slug: (formData.get('slug') as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string,
      age_group: formData.get('age_group') as 'infants' | 'preschool',
      icon: formData.get('icon') as string,
      color_gradient: formData.get('color_gradient') as string,
      order_index: parseInt(formData.get('order_index') as string),
      is_active: formData.get('is_active') === 'on',
    };

    try {
      if (selectedCategory) {
        const { error } = await supabase
          .from('kids_content_categories')
          .update(categoryData)
          .eq('id', selectedCategory.id);
        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('kids_content_categories')
          .insert([categoryData]);
        if (error) throw error;
        toast.success('Category created successfully');
      }
      
      fetchCategories();
      setShowCategoryDialog(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleContentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const contentData = {
      category_id: formData.get('category_id') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      content_type: formData.get('content_type') as string,
      content_url: formData.get('content_url') as string,
      duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes') as string) : null,
      difficulty_level: formData.get('difficulty_level') as string || null,
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
      is_featured: formData.get('is_featured') === 'on',
      is_active: formData.get('is_active') === 'on',
      order_index: parseInt(formData.get('order_index') as string) || 0,
    };

    try {
      if (selectedContentItem) {
        const { error } = await supabase
          .from('kids_content_items')
          .update(contentData)
          .eq('id', selectedContentItem.id);
        if (error) throw error;
        toast.success('Content updated successfully');
      } else {
        const { error } = await supabase
          .from('kids_content_items')
          .insert([contentData]);
        if (error) throw error;
        toast.success('Content created successfully');
      }
      
      fetchContentItems();
      setShowContentDialog(false);
      setSelectedContentItem(null);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'audio') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kids-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('kids-content')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kids_content_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const deleteContentItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kids_content_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Content deleted successfully');
      fetchContentItems();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const categoryColumns = [
    { key: 'name', header: 'Name' },
    { key: 'age_group', header: 'Age Group' },
    { key: 'order_index', header: 'Order' },
    { 
      key: 'is_active', 
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: KidsCategory) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCategory(row);
              setShowCategoryDialog(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this category? This will also delete all content items in this category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteCategory(row.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ];

  const contentColumns = [
    { key: 'title', header: 'Title' },
    { 
      key: 'category', 
      header: 'Category',
      render: (category: any) => category?.name || 'N/A'
    },
    { key: 'content_type', header: 'Type' },
    { 
      key: 'is_featured', 
      header: 'Featured',
      render: (value: boolean) => value ? '⭐' : ''
    },
    { 
      key: 'is_active', 
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: KidsContentItem) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedContentItem(row);
              setShowContentDialog(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Content</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this content item?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteContentItem(row.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Kids Content Manager</h2>
          <p className="text-muted-foreground">Manage educational content for children</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Items</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentItems.filter(item => item.is_featured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentItems.filter(item => item.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="content">Content Items</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Categories</h3>
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedCategory(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCategory ? 'Edit Category' : 'Add Category'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={selectedCategory?.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      name="slug"
                      defaultValue={selectedCategory?.slug}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={selectedCategory?.description}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age_group">Age Group</Label>
                    <Select name="age_group" defaultValue={selectedCategory?.age_group}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infants">Infants & Toddlers (0-3)</SelectItem>
                        <SelectItem value="preschool">Pre-Schoolers (Nursery-KG3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Select name="icon" defaultValue={selectedCategory?.icon}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="color_gradient">Color Gradient</Label>
                    <Select name="color_gradient" defaultValue={selectedCategory?.color_gradient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gradient" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorGradients.map((gradient) => (
                          <SelectItem key={gradient} value={gradient}>
                            <div className={`w-4 h-4 rounded bg-gradient-to-r ${gradient} inline-block mr-2`}></div>
                            {gradient}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="order_index">Order Index</Label>
                    <Input
                      id="order_index"
                      name="order_index"
                      type="number"
                      defaultValue={selectedCategory?.order_index}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      name="is_active"
                      defaultChecked={selectedCategory?.is_active ?? true}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {selectedCategory ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCategoryDialog(false);
                        setSelectedCategory(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable data={categories} columns={categoryColumns} />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Content Items</h3>
            <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedContentItem(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedContentItem ? 'Edit Content' : 'Add Content'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleContentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="category_id">Category</Label>
                    <Select name="category_id" defaultValue={selectedContentItem?.category_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} ({category.age_group})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={selectedContentItem?.title}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={selectedContentItem?.description}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content_type">Content Type</Label>
                    <Select name="content_type" defaultValue={selectedContentItem?.content_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="flashcard">Flashcard</SelectItem>
                        <SelectItem value="game">Game</SelectItem>
                        <SelectItem value="rhyme">Rhyme</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="activity">Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content_url">Content URL</Label>
                    <Input
                      id="content_url"
                      name="content_url"
                      type="url"
                      defaultValue={selectedContentItem?.content_url}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      defaultValue={selectedContentItem?.duration_minutes}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty_level">Difficulty Level</Label>
                    <Select name="difficulty_level" defaultValue={selectedContentItem?.difficulty_level}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      defaultValue={selectedContentItem?.tags?.join(', ')}
                      placeholder="alphabet, colors, animals"
                    />
                  </div>
                  <div>
                    <Label htmlFor="order_index">Order Index</Label>
                    <Input
                      id="order_index"
                      name="order_index"
                      type="number"
                      defaultValue={selectedContentItem?.order_index || 0}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      name="is_featured"
                      defaultChecked={selectedContentItem?.is_featured}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      name="is_active"
                      defaultChecked={selectedContentItem?.is_active ?? true}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {selectedContentItem ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowContentDialog(false);
                        setSelectedContentItem(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable data={contentItems} columns={contentColumns} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KidsManager;