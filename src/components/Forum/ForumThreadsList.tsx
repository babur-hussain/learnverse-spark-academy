
import React from 'react';
import { Link } from 'react-router-dom';
import { ForumThread } from '@/types/forum';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/UI/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, BookmarkCheck, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/UI/skeleton';

interface ForumThreadsListProps {
  threads: ForumThread[];
  loading: boolean;
  emptyMessage: string;
}

const ForumThreadsList = ({ threads, loading, emptyMessage }: ForumThreadsListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border rounded-md p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div 
          key={thread.id} 
          className={`border rounded-md p-4 ${thread.isPinned ? 'bg-muted/50' : ''} transition-colors hover:bg-muted/30`}
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              {thread.user?.avatarUrl ? (
                <AvatarImage src={thread.user.avatarUrl} alt={thread.user.fullName || thread.user.username || 'User'} />
              ) : (
                <AvatarFallback>{thread.user?.fullName?.[0] || thread.user?.username?.[0] || 'U'}</AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap justify-between gap-2">
                <Link 
                  to={`/forum/thread/${thread.id}`}
                  className="text-lg font-medium hover:underline"
                >
                  {thread.title}
                </Link>
                
                <div className="flex items-center text-muted-foreground text-sm gap-4">
                  <div className="flex items-center">
                    <MessageSquare size={14} className="mr-1" />
                    <span>{thread.replyCount || 0}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <ThumbsUp size={14} className="mr-1" />
                    <span>{thread.voteCount || 0}</span>
                  </div>
                  
                  {thread.isPinned && (
                    <div className="text-primary" title="Pinned thread">
                      <BookmarkCheck size={14} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <span>Posted {formatDistanceToNow(new Date(thread.createdAt))} ago</span>
                {thread.user && (
                  <span> by {thread.user.fullName || thread.user.username || 'Unknown'}</span>
                )}
                {thread.category && (
                  <span> in <Link to={`/forum/category/${thread.category.slug}`} className="hover:underline">{thread.category.name}</Link></span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {thread.threadType === 'question' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Question
                  </span>
                )}
                
                {thread.threadType === 'poll' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <BarChart size={12} className="mr-1" />
                    Poll
                  </span>
                )}
                
                {thread.tags?.map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ForumThreadsList;
