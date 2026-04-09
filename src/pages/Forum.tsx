
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { ScrollArea } from '@/components/UI/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ForumService } from '@/services/ForumService';
import { ForumCategory, ForumThread, ForumFilter } from '@/types/forum';
import { useAuth } from '@/contexts/AuthContext';
import ForumCategoriesList from '@/components/Forum/ForumCategoriesList';
import ForumThreadsList from '@/components/Forum/ForumThreadsList';
import { Plus, Search, BookmarkCheck } from 'lucide-react';

const Forum = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [bookmarkedThreads, setBookmarkedThreads] = useState<ForumThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ForumFilter>({
    sortBy: 'newest',
  });

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const fetchedCategories = await ForumService.getCategories();
      setCategories(fetchedCategories);
      
      if (categorySlug) {
        const category = await ForumService.getCategoryBySlug(categorySlug);
        if (category) {
          setCurrentCategory(category);
          loadThreads(category.id);
        } else {
          toast({
            title: 'Category not found',
            description: 'The category you are looking for does not exist.',
            variant: 'destructive',
          });
          navigate('/forum');
        }
      } else {
        setCurrentCategory(null);
        loadThreads();
      }
      setLoading(false);
    };

    loadCategories();
  }, [categorySlug, navigate, toast]);

  const loadThreads = async (categoryId?: string) => {
    setLoading(true);
    const updatedFilter: ForumFilter = { ...filter };
    
    if (categoryId) {
      updatedFilter.categoryId = categoryId;
    }
    
    if (searchQuery) {
      updatedFilter.search = searchQuery;
    }
    
    const fetchedThreads = await ForumService.getThreads(updatedFilter);
    setThreads(fetchedThreads);
    setLoading(false);
  };

  const loadBookmarkedThreads = async () => {
    setLoading(true);
    const fetchedThreads = await ForumService.getBookmarkedThreads();
    setBookmarkedThreads(fetchedThreads);
    setLoading(false);
  };

  const handleCreateThread = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a thread',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentCategory) {
      navigate(`/forum/thread/create?category=${currentCategory.id}`);
    } else {
      navigate('/forum/thread/create');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadThreads(currentCategory?.id);
  };

  const handleSortChange = (value: string) => {
    const updatedFilter = { ...filter, sortBy: value as 'newest' | 'popular' | 'active' };
    setFilter(updatedFilter);
    loadThreads(currentCategory?.id);
  };

  const handleTabChange = (value: string) => {
    if (value === 'bookmarks') {
      loadBookmarkedThreads();
    } else {
      loadThreads(currentCategory?.id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {currentCategory ? currentCategory.name : 'Discussion Forums'}
          </h1>
          <Button onClick={handleCreateThread} className="flex items-center space-x-2">
            <Plus size={16} />
            <span>New Thread</span>
          </Button>
        </div>

        {currentCategory && (
          <div className="text-sm text-muted-foreground">
            <a href="/forum" className="hover:underline">Forums</a>
            <span className="mx-2">/</span>
            <span>{currentCategory.name}</span>
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <ScrollArea className="h-[400px]">
                    <ForumCategoriesList 
                      categories={categories}
                      currentCategory={currentCategory}
                    />
                  </ScrollArea>
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="mb-4">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      placeholder="Search threads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" variant="outline">
                      <Search size={18} />
                    </Button>
                  </form>
                </div>

                <Tabs defaultValue="threads" onValueChange={handleTabChange}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="threads">Threads</TabsTrigger>
                    {user && <TabsTrigger value="bookmarks" className="flex items-center gap-1">
                      <BookmarkCheck size={16} />
                      <span>Bookmarked</span>
                    </TabsTrigger>}
                  </TabsList>

                  <TabsContent value="threads">
                    <div className="mb-4 flex justify-end">
                      <Tabs defaultValue={filter.sortBy} onValueChange={handleSortChange}>
                        <TabsList>
                          <TabsTrigger value="newest">Newest</TabsTrigger>
                          <TabsTrigger value="popular">Popular</TabsTrigger>
                          <TabsTrigger value="active">Active</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <ForumThreadsList 
                      threads={threads}
                      loading={loading}
                      emptyMessage={
                        searchQuery ? 
                          "No threads found matching your search" : 
                          currentCategory ? 
                            `No threads in ${currentCategory.name} yet` : 
                            "No threads found"
                      }
                    />
                  </TabsContent>

                  <TabsContent value="bookmarks">
                    <ForumThreadsList 
                      threads={bookmarkedThreads}
                      loading={loading}
                      emptyMessage="You haven't bookmarked any threads yet"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Forum;
