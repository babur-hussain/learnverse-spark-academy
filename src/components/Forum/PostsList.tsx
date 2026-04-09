
import React from 'react';
import { ForumPost, ThreadType, VoteType } from '@/types/forum';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/UI/avatar';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, ThumbsUp, ThumbsDown, AlertTriangle, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PostsListProps {
  posts: ForumPost[];
  threadType: ThreadType;
  onAcceptAnswer?: (postId: string) => Promise<void>;
  onVote?: (postId: string, voteType: VoteType) => Promise<void>;
}

const PostsList = ({ posts, threadType, onAcceptAnswer, onVote }: PostsListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleVote = (postId: string, voteType: VoteType) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to vote',
        variant: 'destructive',
      });
      return;
    }
    
    if (onVote) {
      onVote(postId, voteType);
    }
  };
  
  const handleAcceptAnswer = (postId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to accept answers',
        variant: 'destructive',
      });
      return;
    }
    
    if (onAcceptAnswer) {
      onAcceptAnswer(postId);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No replies yet. Be the first to reply!
      </div>
    );
  }

  const renderPost = (post: ForumPost, depth = 0) => (
    <div key={post.id} className="relative">
      <div 
        className={cn(
          "border rounded-md p-4 mb-4",
          post.isAccepted && "border-green-500 bg-green-50/50 dark:bg-green-950/10",
          depth > 0 ? "ml-6 md:ml-12" : ""
        )}
      >
        {post.isAccepted && threadType === 'question' && (
          <Badge variant="outline" className="absolute -top-2 left-4 bg-background border-green-500 text-green-700">
            <CheckCircle2 size={14} className="mr-1" />
            Accepted Answer
          </Badge>
        )}
        
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            {post.user?.avatarUrl ? (
              <AvatarImage src={post.user.avatarUrl} alt={post.user.fullName || post.user.username || 'User'} />
            ) : (
              <AvatarFallback>{post.user?.fullName?.[0] || post.user?.username?.[0] || 'U'}</AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <span className="font-medium">
                  {post.user?.fullName || post.user?.username || 'Anonymous'}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {formatDistanceToNow(new Date(post.createdAt))} ago
                </span>
              </div>
            </div>
            
            <div className="mt-2 prose prose-sm max-w-none">
              <SanitizedHtml html={post.content} />
            </div>
            
            <div className="mt-4 flex flex-wrap justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    post.votes?.userVote === 'upvote' && "text-green-600 hover:text-green-700"
                  )}
                  onClick={() => handleVote(post.id, 'upvote' as VoteType)}
                >
                  <ThumbsUp size={14} className="mr-1" />
                  <span>{post.votes?.upvotes || 0}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    post.votes?.userVote === 'downvote' && "text-red-600 hover:text-red-700"
                  )}
                  onClick={() => handleVote(post.id, 'downvote' as VoteType)}
                >
                  <ThumbsDown size={14} className="mr-1" />
                  <span>{post.votes?.downvotes || 0}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    post.votes?.userVote === 'helpful' && "text-amber-600 hover:text-amber-700"
                  )}
                  onClick={() => handleVote(post.id, 'helpful' as VoteType)}
                >
                  <Heart size={14} className="mr-1" />
                  <span>{post.votes?.helpfulCount || 0}</span>
                </Button>
              </div>
              
              <div className="flex space-x-2">
                {threadType === 'question' && !post.isAccepted && onAcceptAnswer && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAcceptAnswer(post.id)}
                  >
                    <CheckCircle2 size={14} className="mr-1" />
                    Accept as Answer
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => toast({
                    title: 'Report submitted',
                    description: 'Thank you for helping keep our community safe.',
                  })}
                >
                  <AlertTriangle size={14} className="mr-1" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render nested replies */}
      {post.replies && post.replies.length > 0 && (
        <div>
          {post.replies.map(reply => renderPost(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-1">
      {posts.map(post => renderPost(post))}
    </div>
  );
};

export default PostsList;
