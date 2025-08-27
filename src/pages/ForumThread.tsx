
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Separator } from '@/components/UI/separator';
import { useToast } from '@/hooks/use-toast';
import { ForumService } from '@/services/ForumService';
import { ForumThread, ForumPost, ForumPoll, VoteType } from '@/types/forum';
import { useAuth } from '@/contexts/AuthContext';
import ThreadView from '@/components/Forum/ThreadView';
import PostsList from '@/components/Forum/PostsList';
import PostForm from '@/components/Forum/PostForm';
import { Bookmark, BookmarkCheck, Star, MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ForumThreadPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const loadThread = async () => {
      if (!threadId) return;

      setLoading(true);
      const fetchedThread = await ForumService.getThread(threadId);
      
      if (fetchedThread) {
        setThread(fetchedThread);
        
        const fetchedPosts = await ForumService.getPostsByThreadId(threadId);
        setPosts(fetchedPosts);
        
        const bookmarked = await ForumService.isThreadBookmarkedByUser(threadId);
        setIsBookmarked(bookmarked);
        
        const subscribed = await ForumService.isUserSubscribedToThread(threadId);
        setIsSubscribed(subscribed);
      } else {
        toast({
          title: 'Thread not found',
          description: 'The thread you are looking for does not exist.',
          variant: 'destructive',
        });
        navigate('/forum');
      }
      
      setLoading(false);
    };

    loadThread();
  }, [threadId, toast, navigate]);

  const handlePostSubmit = async (content: string) => {
    if (!user || !threadId) return;
    
    const post = {
      threadId,
      userId: user.id,
      content,
    };
    
    const newPost = await ForumService.createPost(post);
    if (newPost) {
      const fetchedPosts = await ForumService.getPostsByThreadId(threadId);
      setPosts(fetchedPosts);
      
      toast({
        title: 'Reply posted',
        description: 'Your reply has been added to the thread.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to post your reply.',
        variant: 'destructive',
      });
    }
  };

  const handleBookmark = async () => {
    if (!user || !threadId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to bookmark threads',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await ForumService.bookmarkThread(threadId);
    if (result) {
      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Thread bookmarked',
        description: isBookmarked 
          ? 'This thread has been removed from your bookmarks' 
          : 'This thread has been added to your bookmarks',
      });
    }
  };

  const handleSubscribe = async () => {
    if (!user || !threadId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to subscribe to threads',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await ForumService.subscribeToThread(threadId);
    if (result) {
      setIsSubscribed(!isSubscribed);
      toast({
        title: isSubscribed ? 'Unsubscribed' : 'Subscribed',
        description: isSubscribed 
          ? 'You will no longer receive notifications for this thread' 
          : 'You will receive notifications when there are new replies',
      });
    }
  };

  const handleReport = async () => {
    if (!user || !threadId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to report threads',
        variant: 'destructive',
      });
      return;
    }
    
    const reportReason = 'Inappropriate content';
    
    const result = await ForumService.reportThread(threadId, reportReason);
    if (result) {
      toast({
        title: 'Thread reported',
        description: 'Thank you for helping to keep our community safe. Our moderators will review this thread.',
      });
    }
  };

  const handleAcceptAnswer = async (postId: string) => {
    if (!user || !threadId || thread?.threadType !== 'question') return;
    
    if (user.id !== thread.userId) {
      toast({
        title: 'Not allowed',
        description: 'Only the question author can mark an answer as accepted',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await ForumService.markPostAsAccepted(postId);
    if (result) {
      const fetchedPosts = await ForumService.getPostsByThreadId(threadId);
      setPosts(fetchedPosts);
      
      toast({
        title: 'Answer accepted',
        description: 'You have marked this answer as accepted.',
      });
    }
  };

  const handleVoteOnPost = async (postId: string, voteType: VoteType) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to vote',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await ForumService.voteOnPost(postId, voteType);
    if (result) {
      const fetchedPosts = await ForumService.getPostsByThreadId(threadId!);
      setPosts(fetchedPosts);
    }
  };

  const handleVoteInPoll = async (pollId: string, optionIndex: number) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to vote in polls',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await ForumService.voteOnPoll(pollId, optionIndex);
    if (result) {
      const fetchedThread = await ForumService.getThread(threadId!);
      if (fetchedThread) {
        setThread(fetchedThread);
      }
      
      toast({
        title: 'Vote recorded',
        description: 'Your vote has been recorded.',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-4xl">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Thread not found</h2>
          <p className="text-muted-foreground mb-6">The thread you are looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link to="/forum">Back to Forums</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="text-sm breadcrumbs">
          <Link to="/forum" className="hover:underline">Forums</Link>
          {thread.category && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/forum/category/${thread.category.slug}`} className="hover:underline">
                {thread.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="font-medium">{thread.title}</span>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {thread.threadType === 'question' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Question
                    </span>
                  )}
                  {thread.threadType === 'poll' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Poll
                    </span>
                  )}
                  <span>Posted {formatDistanceToNow(new Date(thread.createdAt))} ago</span>
                  {thread.user && <span>by {thread.user.fullName || thread.user.username}</span>}
                </div>
                <CardTitle className="text-2xl">{thread.title}</CardTitle>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  title={isBookmarked ? "Remove bookmark" : "Bookmark this thread"}
                  onClick={handleBookmark}
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  title={isSubscribed ? "Unsubscribe from this thread" : "Subscribe to this thread"}
                  onClick={handleSubscribe}
                >
                  <Star size={18} className={isSubscribed ? "text-yellow-500" : ""} />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  title="Report this thread"
                  onClick={handleReport}
                >
                  <AlertTriangle size={18} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <ThreadView 
              thread={thread} 
              onVotePoll={handleVoteInPoll}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare size={16} className="mr-1" />
              <span>{posts.length} {posts.length === 1 ? 'reply' : 'replies'}</span>
            </div>
          </CardFooter>
        </Card>
        
        <Separator />
        
        <h2 className="text-xl font-semibold">Replies</h2>
        
        <PostsList 
          posts={posts} 
          threadType={thread.threadType}
          onAcceptAnswer={handleAcceptAnswer}
          onVote={handleVoteOnPost}
        />
        
        {!thread.isLocked && user && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Add your reply</h3>
            <PostForm onSubmit={handlePostSubmit} />
          </div>
        )}
        
        {thread.isLocked && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-center text-muted-foreground">This thread is locked. New replies are not allowed.</p>
          </div>
        )}
        
        {!user && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-center">
              Please <Link to="/auth" className="font-medium text-primary hover:underline">sign in</Link> to reply to this thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumThreadPage;
