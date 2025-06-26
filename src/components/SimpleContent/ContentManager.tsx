
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/UI/card';

interface Content {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export const ContentManager: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { toast } = useToast();

  // Fetch content on component mount
  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contents:', error);
        toast({
          title: 'Error fetching content',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setContents(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Validation error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contents')
        .insert([{ title, content }])
        .select();

      if (error) {
        console.error('Error creating content:', error);
        toast({
          title: 'Error creating content',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Content saved',
        description: 'Your content has been saved successfully',
      });
      
      // Reset form
      setTitle('');
      setContent('');
      
      // Refresh content list
      fetchContents();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Simple Content Manager</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Content</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content"
                rows={5}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Content'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content List</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contents.length > 0 ? (
            <div className="space-y-4">
              {contents.map((item) => (
                <Card key={item.id} className="p-4">
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{item.content}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No content available yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManager;
