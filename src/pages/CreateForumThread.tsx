import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Switch } from '@/components/UI/switch';
import { useToast } from '@/hooks/use-toast';
import { ForumService } from '@/services/ForumService';
import { ForumCategory, ThreadType, VoteType } from '@/types/forum';
import { useAuth } from '@/contexts/AuthContext';
import PollEditor from '@/components/Forum/PollEditor';
import RichTextEditor from '@/components/Forum/RichTextEditor';
import { X } from 'lucide-react';

const CreateForumThread = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [threadType, setThreadType] = useState<ThreadType>('discussion');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ text: '' }, { text: '' }]);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [pollDuration, setPollDuration] = useState('7');

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a thread',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    const loadCategories = async () => {
      const fetchedCategories = await ForumService.getCategories();
      setCategories(fetchedCategories);
      
      const categoryFromUrl = searchParams.get('category');
      if (categoryFromUrl) {
        setSelectedCategoryId(categoryFromUrl);
      }
    };

    loadCategories();
  }, [user, toast, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a thread',
        variant: 'destructive',
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your thread',
        variant: 'destructive',
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please enter content for your thread',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedCategoryId) {
      toast({
        title: 'Category required',
        description: 'Please select a category for your thread',
        variant: 'destructive',
      });
      return;
    }
    
    if (threadType === 'poll') {
      if (!pollQuestion.trim()) {
        toast({
          title: 'Poll question required',
          description: 'Please enter a question for your poll',
          variant: 'destructive',
        });
        return;
      }
      
      const validOptions = pollOptions.filter(option => option.text.trim() !== '');
      if (validOptions.length < 2) {
        toast({
          title: 'Poll options required',
          description: 'Please provide at least 2 poll options',
          variant: 'destructive',
        });
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const pollData = threadType === 'poll' ? {
        question: pollQuestion,
        options: pollOptions.filter(option => option.text.trim() !== ''),
        allowMultiple: allowMultipleVotes,
        closesAt: pollDuration !== 'never' ? 
          new Date(Date.now() + parseInt(pollDuration) * 24 * 60 * 60 * 1000).toISOString() : 
          undefined
      } as any : undefined;
      
      const thread = await ForumService.createThread({
        title,
        content,
        categoryId: selectedCategoryId,
        userId: user.id,
        threadType,
        tags: tags.length > 0 ? tags : undefined,
        poll: pollData,
      });
      
      if (thread) {
        toast({
          title: 'Thread created',
          description: 'Your thread has been created successfully',
        });
        navigate(`/forum/thread/${thread.id}`);
      } else {
        throw new Error('Failed to create thread');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create thread. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const tag = tagInput.trim();
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Thread</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                maxLength={100}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Thread Type</Label>
              <RadioGroup 
                value={threadType} 
                onValueChange={(value) => setThreadType(value as ThreadType)}
                className="flex flex-row space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="discussion" id="discussion" />
                  <Label htmlFor="discussion">Discussion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="question" id="question" />
                  <Label htmlFor="question">Question</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poll" id="poll" />
                  <Label htmlFor="poll">Poll</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor 
                value={content} 
                onChange={setContent} 
                placeholder={
                  threadType === 'question' 
                    ? 'Describe your question in detail...' 
                    : 'Write your post content here...'
                }
              />
            </div>
            
            {threadType === 'poll' && (
              <div className="space-y-4 bg-muted p-4 rounded-md">
                <h3 className="font-medium">Poll Options</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="pollQuestion">Poll Question</Label>
                  <Input
                    id="pollQuestion"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Enter your poll question"
                    maxLength={100}
                  />
                </div>
                
                <PollEditor 
                  options={pollOptions}
                  setOptions={setPollOptions}
                />
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowMultiple"
                    checked={allowMultipleVotes}
                    onCheckedChange={setAllowMultipleVotes}
                  />
                  <Label htmlFor="allowMultiple">Allow multiple selections</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pollDuration">Poll Duration</Label>
                  <Select value={pollDuration} onValueChange={setPollDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                      <SelectItem value="never">No end date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags (press Enter)"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="secondary">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div 
                      key={tag}
                      className="inline-flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 focus:outline-none"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to="/forum">Cancel</Link>
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Thread'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateForumThread;
