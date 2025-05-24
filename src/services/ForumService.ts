
import { supabase } from '@/lib/supabase';
import type { ForumCategory, ForumPost, ForumThread, ThreadType, VoteType, ForumFilter, ForumPoll, ForumCategoryType, ThreadStatus } from '@/types/forum';

export class ForumService {
  // Helper method to get current user ID
  private static async getCurrentUserId(): Promise<string | undefined> {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id;
  }

  static async getCategories(): Promise<ForumCategory[]> {
    try {
      const { data: categories } = await supabase
        .from('forum_categories')
        .select('*')
        .order('display_order');
      
      // Map database model to frontend model with proper type casting
      return (categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || undefined,
        slug: cat.slug,
        parentId: cat.parent_id || undefined,
        type: cat.type as ForumCategoryType, // Explicitly cast to the enum type
        referenceId: cat.reference_id || undefined,
        isActive: cat.is_active,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at || undefined
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getCategoryBySlug(slug: string): Promise<ForumCategory | null> {
    try {
      const { data: category } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (!category) return null;
      
      // Map database model to frontend model with proper type casting
      return {
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        slug: category.slug,
        parentId: category.parent_id || undefined,
        type: category.type as ForumCategoryType, // Explicitly cast to the enum type
        referenceId: category.reference_id || undefined,
        isActive: category.is_active,
        createdAt: category.created_at,
        updatedAt: category.updated_at || undefined
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  static async getThreads(filter?: ForumFilter): Promise<ForumThread[]> {
    try {
      let query = supabase
        .from('forum_threads')
        .select(`
          *,
          category:category_id (id, name, slug, type, is_active),
          user:user_id (id, username, full_name, avatar_url),
          posts:forum_posts (count),
          votes:forum_votes (
            id,
            vote_type,
            user_id
          )
        `)
        .order('is_pinned', { ascending: false });
      
      if (filter?.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (filter?.sortBy === 'active') {
        query = query.order('updated_at', { ascending: false });
      } else {
        // Default sorting
        query = query.order('created_at', { ascending: false });
      }
      
      if (filter?.categoryId) {
        query = query.eq('category_id', filter.categoryId);
      }
      
      if (filter?.search) {
        query = query.or(`title.ilike.%${filter.search}%,content.ilike.%${filter.search}%`);
      }
      
      const { data: threads } = await query;
      
      if (!threads) return [];
      
      const currentUserId = await this.getCurrentUserId();
      
      // Process the threads to add vote counts and map to our frontend model
      const processedThreads = threads.map(thread => {
        const votes = thread.votes || [];
        const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
        const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
        const helpfulCount = votes.filter(v => v.vote_type === 'helpful').length;
        const userVote = currentUserId ? votes.find(v => v.user_id === currentUserId)?.vote_type as VoteType | undefined : undefined;
        
        // Handle possibly null user object
        let user = undefined;
        if (thread.user && typeof thread.user === 'object') {
          const threadUser = thread.user as Record<string, any>;
          if ('id' in threadUser) {
            user = {
              id: threadUser.id ?? '',
              username: threadUser.username ?? '',
              fullName: threadUser.full_name ?? '',
              avatarUrl: threadUser.avatar_url
            };
          }
        }
        
        // Handle possibly null category object with proper typing
        let category;
        if (thread.category && typeof thread.category === 'object') {
          category = {
            id: thread.category.id,
            name: thread.category.name,
            slug: thread.category.slug,
            type: (thread.category.type as ForumCategoryType) || 'general',
            isActive: thread.category.is_active,
            createdAt: thread.created_at // Required by ForumCategory type
          };
        }
        
        return {
          id: thread.id,
          title: thread.title,
          content: thread.content,
          categoryId: thread.category_id,
          userId: thread.user_id,
          isPinned: thread.is_pinned,
          isLocked: thread.is_locked,
          viewCount: thread.view_count,
          threadType: thread.thread_type as ThreadType,
          status: (thread.status as ThreadStatus) || 'open', // Default to 'open' if invalid
          createdAt: thread.created_at,
          updatedAt: thread.updated_at || undefined,
          tags: thread.tags || [],
          
          // Related objects
          category,
          user,
          
          voteCount: upvotes - downvotes,
          replyCount: thread.posts?.[0]?.count || 0
        };
      });
      
      // Handle popular sort (sort by vote count)
      if (filter?.sortBy === 'popular') {
        processedThreads.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
      }
      
      return processedThreads;
    } catch (error) {
      console.error('Error fetching threads:', error);
      return [];
    }
  }

  static async getThread(threadId: string): Promise<ForumThread | null> {
    try {
      const { data: thread } = await supabase
        .from('forum_threads')
        .select(`
          *,
          category:category_id (id, name, slug, type, is_active),
          user:user_id (id, username, full_name, avatar_url),
          votes:forum_votes (
            id,
            vote_type,
            user_id
          ),
          poll:forum_polls (
            id,
            question,
            options,
            allow_multiple,
            closes_at,
            created_at,
            thread_id
          )
        `)
        .eq('id', threadId)
        .single();
      
      if (!thread) return null;
      
      const currentUserId = await this.getCurrentUserId();
      
      // Process votes
      const votes = thread.votes || [];
      const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
      const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
      const helpfulCount = votes.filter(v => v.vote_type === 'helpful').length;
      const userVote = currentUserId ? votes.find(v => v.user_id === currentUserId)?.vote_type as VoteType | undefined : undefined;
      
      // Get poll votes if there is a poll
      let poll: ForumPoll | undefined;
      
      if (thread.poll && thread.poll.length > 0) {
        const pollData = thread.poll[0];
        
        // Get user votes for this poll
        let userVotes: number[] = [];
        
        if (currentUserId) {
          const { data: pollVotes } = await supabase
            .from('forum_poll_votes')
            .select('option_index')
            .eq('poll_id', pollData.id)
            .eq('user_id', currentUserId);
            
          if (pollVotes) {
            userVotes = pollVotes.map(vote => vote.option_index);
          }
        }
        
        // Get vote counts for each option
        // Use count and group by in SQL query instead of groupBy function
        const { data: optionVotes } = await supabase
          .from('forum_poll_votes')
          .select('option_index, count(*)')
          .eq('poll_id', pollData.id)
          .select('option_index, count')
          .order('option_index');
        
        const voteCounts: Record<number, number> = {};
        if (optionVotes && Array.isArray(optionVotes)) {
          optionVotes.forEach(vote => {
            if (vote && typeof vote.count === 'number') {
              voteCounts[vote.option_index] = vote.count;
            }
          });
        }
        
        // Process options with proper typing
        const options = Array.isArray(pollData.options) ? 
          pollData.options.map((option: any, index: number) => ({
            text: typeof option === 'object' && option.text ? option.text : option,
            votes: voteCounts[index] || 0
          })) 
          : [];
        
        poll = {
          id: pollData.id,
          threadId: pollData.thread_id,
          question: pollData.question,
          options,
          allowMultiple: pollData.allow_multiple,
          closesAt: pollData.closes_at,
          userVotes,
          createdAt: pollData.created_at
        };
      }
      
      // Handle possibly null user object
      let user = undefined;
      if (thread.user && typeof thread.user === 'object') {
        const threadUser = thread.user as Record<string, any>;
        if ('id' in threadUser) {
          user = {
            id: threadUser.id ?? '',
            username: threadUser.username ?? '',
            fullName: threadUser.full_name ?? '',
            avatarUrl: threadUser.avatar_url
          };
        }
      }
      
      // Handle possibly null category object with proper typing
      let category;
      if (thread.category && typeof thread.category === 'object') {
        category = {
          id: thread.category.id,
          name: thread.category.name,
          slug: thread.category.slug,
          type: (thread.category.type as ForumCategoryType) || 'general',
          isActive: thread.category.is_active,
          createdAt: thread.created_at // Required by ForumCategory type
        };
      }
      
      // Return formatted thread
      return {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        categoryId: thread.category_id,
        userId: thread.user_id,
        isPinned: thread.is_pinned,
        isLocked: thread.is_locked,
        viewCount: thread.view_count,
        threadType: thread.thread_type as ThreadType,
        status: (thread.status as ThreadStatus) || 'open', // Default to 'open' if invalid
        createdAt: thread.created_at,
        updatedAt: thread.updated_at || undefined,
        tags: thread.tags || [],
        
        // Related objects
        category,
        user,
        voteCount: upvotes - downvotes,
        poll
      };
    } catch (error) {
      console.error('Error fetching thread:', error);
      return null;
    }
  }

  // Alias for getThread to match usage in components
  static getThreadById(threadId: string): Promise<ForumThread | null> {
    return this.getThread(threadId);
  }

  static async getPostsByThreadId(threadId: string): Promise<ForumPost[]> {
    try {
      const { data: posts } = await supabase
        .from('forum_posts')
        .select(`
          *,
          user:user_id (id, username, full_name, avatar_url),
          votes:forum_votes (
            id,
            vote_type,
            user_id
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at');
      
      if (!posts) return [];
      
      const currentUserId = await this.getCurrentUserId();
      
      // Process the posts to add vote counts and structure replies
      const processedPosts = posts.map(post => {
        const votes = post.votes || [];
        const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
        const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
        const helpfulCount = votes.filter(v => v.vote_type === 'helpful').length;
        const userVote = currentUserId ? votes.find(v => v.user_id === currentUserId)?.vote_type as VoteType | undefined : undefined;
        
        // Handle possibly null user object
        let user = undefined;
        if (post.user && typeof post.user === 'object') {
          const postUser = post.user as Record<string, any>;
          if ('id' in postUser) {
            user = {
              id: postUser.id ?? '',
              username: postUser.username ?? '',
              fullName: postUser.full_name ?? '',
              avatarUrl: postUser.avatar_url
            };
          }
        }
        
        return {
          id: post.id,
          threadId: post.thread_id,
          userId: post.user_id,
          content: post.content,
          isAccepted: post.is_accepted,
          parentId: post.parent_id || undefined,
          createdAt: post.created_at,
          updatedAt: post.updated_at || undefined,
          
          user,
          votes: {
            upvotes,
            downvotes,
            helpfulCount,
            userVote
          },
          
          replies: [] // Will be filled in next step
        };
      });
      
      // Build reply tree
      const postMap = new Map<string, ForumPost>();
      const rootPosts: ForumPost[] = [];
      
      processedPosts.forEach(post => {
        postMap.set(post.id, post);
      });
      
      processedPosts.forEach(post => {
        if (post.parentId && postMap.has(post.parentId)) {
          const parentPost = postMap.get(post.parentId);
          if (parentPost?.replies) {
            parentPost.replies.push(post);
          }
        } else {
          rootPosts.push(post);
        }
      });
      
      return rootPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  static async createPost(postData: {
    threadId: string;
    content: string;
    userId: string;
    parentId?: string;
  }): Promise<ForumPost | null> {
    try {
      const { data: post, error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: postData.threadId,
          content: postData.content,
          user_id: postData.userId,
          parent_id: postData.parentId
        })
        .select(`
          *,
          user:user_id (id, username, full_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      if (!post) return null;
      
      // Handle possibly null user object
      let user = undefined;
      if (post.user && typeof post.user === 'object') {
        const postUser = post.user as Record<string, any>;
        if ('id' in postUser) {
          user = {
            id: postUser.id ?? '',
            username: postUser.username ?? '',
            fullName: postUser.full_name ?? '',
            avatarUrl: postUser.avatar_url
          };
        }
      }
      
      return {
        id: post.id,
        threadId: post.thread_id,
        userId: post.user_id,
        content: post.content,
        isAccepted: post.is_accepted,
        parentId: post.parent_id || undefined,
        createdAt: post.created_at,
        updatedAt: post.updated_at || undefined,
        
        user,
        votes: {
          upvotes: 0,
          downvotes: 0,
          helpfulCount: 0,
          userVote: undefined
        },
        
        replies: []
      };
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  static async createThread(threadData: {
    title: string;
    content: string;
    categoryId: string;
    userId: string;
    threadType: ThreadType;
    tags?: string[];
    poll?: {
      question: string;
      options: { text: string }[];
      allowMultiple: boolean;
      closesAt?: string;
    };
  }): Promise<ForumThread | null> {
    try {
      // Insert the thread
      const { data: thread, error } = await supabase
        .from('forum_threads')
        .insert({
          title: threadData.title,
          content: threadData.content,
          category_id: threadData.categoryId,
          user_id: threadData.userId,
          thread_type: threadData.threadType,
          tags: threadData.tags
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!thread) return null;
      
      // If it's a poll, create the poll and options
      if (threadData.threadType === 'poll' && threadData.poll) {
        const pollOptions = threadData.poll.options
          .filter(option => option.text.trim() !== '')
          .map(option => option.text);
          
        const optionsArray = pollOptions.map(text => ({ text }));
        
        // Fixed: add options field to insert query
        const { error: pollError } = await supabase
          .from('forum_polls')
          .insert({
            thread_id: thread.id,
            question: threadData.poll.question,
            options: optionsArray,
            allow_multiple: threadData.poll.allowMultiple,
            closes_at: threadData.poll.closesAt
          });
        
        if (pollError) throw pollError;
      }
      
      return this.getThread(thread.id);
    } catch (error) {
      console.error('Error creating thread:', error);
      return null;
    }
  }

  static async markPostAsAccepted(postId: string): Promise<boolean> {
    try {
      // Get the post to find its thread
      const { data: post } = await supabase
        .from('forum_posts')
        .select('thread_id')
        .eq('id', postId)
        .single();
      
      if (!post) throw new Error('Post not found');
      
      // First, reset any previously accepted answers in this thread
      await supabase
        .from('forum_posts')
        .update({ is_accepted: false })
        .eq('thread_id', post.thread_id);
      
      // Then set this post as accepted
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_accepted: true })
        .eq('id', postId);
      
      return !error;
    } catch (error) {
      console.error('Error accepting answer:', error);
      return false;
    }
  }

  static async voteOnPost(postId: string, voteType: VoteType): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) return false;
      
      // Check if the user has already voted on this post
      const { data: existingVote } = await supabase
        .from('forum_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (existingVote) {
        // If the same vote type, remove the vote
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('forum_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Otherwise update the vote type
          await supabase
            .from('forum_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create a new vote
        await supabase.from('forum_votes').insert({
          post_id: postId,
          user_id: currentUserId,
          vote_type: voteType
        });
      }

      return true;
    } catch (error) {
      console.error('Error voting on post:', error);
      return false;
    }
  }

  static async voteOnPoll(pollId: string, optionIndex: number): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) return false;
      
      // First, get the poll to check if it allows multiple votes
      const { data: poll } = await supabase
        .from('forum_polls')
        .select('allow_multiple, closes_at')
        .eq('id', pollId)
        .single();
      
      if (!poll) throw new Error('Poll not found');
      
      // Check if poll is closed
      if (poll.closes_at && new Date(poll.closes_at) < new Date()) {
        throw new Error('Poll is closed');
      }
      
      // Delete existing votes if not allowing multiple
      if (!poll.allow_multiple) {
        await supabase
          .from('forum_poll_votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', currentUserId);
      }
      
      // Check if user already voted for this option
      const { data: existingVote } = await supabase
        .from('forum_poll_votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', currentUserId)
        .eq('option_index', optionIndex)
        .maybeSingle();
        
      if (existingVote) {
        // Remove the vote if it exists
        await supabase
          .from('forum_poll_votes')
          .delete()
          .eq('id', existingVote.id);
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('forum_poll_votes')
          .insert({
            poll_id: pollId,
            user_id: currentUserId,
            option_index: optionIndex
          });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error voting on poll:', error);
      return false;
    }
  }

  // Alias for voteOnPoll to match usage in components
  static voteInPoll(pollId: string, optionIndex: number): Promise<boolean> {
    return this.voteOnPoll(pollId, optionIndex);
  }

  static async bookmarkThread(threadId: string): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) return false;
      
      // Check if bookmark exists
      const { data: existingBookmark } = await supabase
        .from('forum_bookmarks')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', currentUserId)
        .maybeSingle();
        
      if (existingBookmark) {
        // Remove bookmark
        await supabase
          .from('forum_bookmarks')
          .delete()
          .eq('id', existingBookmark.id);
          
        return true;
      } else {
        // Add bookmark
        await supabase
          .from('forum_bookmarks')
          .insert({
            thread_id: threadId,
            user_id: currentUserId
          });
          
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return false;
    }
  }

  static async isThreadBookmarkedByUser(threadId: string): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) return false;
      
      const { data } = await supabase
        .from('forum_bookmarks')
        .select('id')
        .eq('thread_id', threadId)
        .eq('user_id', currentUserId)
        .maybeSingle();
        
      return !!data;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  static async subscribeToThread(threadId: string): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) return false;
      
      // Check if subscription exists
      const { data: existingSubscription } = await supabase
        .from('forum_subscriptions')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', currentUserId)
        .maybeSingle();
        
      if (existingSubscription) {
        // Remove subscription
        await supabase
          .from('forum_subscriptions')
          .delete()
          .eq('id', existingSubscription.id);
          
        return true;
      } else {
        // Add subscription
        await supabase
          .from('forum_subscriptions')
          .insert({
            thread_id: threadId,
            user_id: currentUserId
          });
          
        return true;
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      return false;
    }
  }

  static async isUserSubscribedToThread(threadId: string): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) return false;
      
      const { data } = await supabase
        .from('forum_subscriptions')
        .select('id')
        .eq('thread_id', threadId)
        .eq('user_id', currentUserId)
        .maybeSingle();
        
      return !!data;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  static async reportThread(threadId: string, reason: string): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) return false;
      
      const { error } = await supabase
        .from('forum_reports')
        .insert({
          thread_id: threadId,
          reporter_id: currentUserId,
          reason: reason,
          status: 'pending'
        });
        
      return !error;
    } catch (error) {
      console.error('Error reporting thread:', error);
      return false;
    }
  }

  static async getBookmarkedThreads(): Promise<ForumThread[]> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) return [];
      
      const { data: bookmarks } = await supabase
        .from('forum_bookmarks')
        .select('thread_id')
        .eq('user_id', currentUserId);
        
      if (!bookmarks || bookmarks.length === 0) return [];
      
      const threadIds = bookmarks.map(b => b.thread_id);
      
      let query = supabase
        .from('forum_threads')
        .select(`
          *,
          category:category_id (id, name, slug, type, is_active),
          user:user_id (id, username, full_name, avatar_url),
          posts:forum_posts (count),
          votes:forum_votes (
            id,
            vote_type,
            user_id
          )
        `)
        .in('id', threadIds)
        .order('created_at', { ascending: false });
        
      const { data: threads } = await query;
      
      if (!threads) return [];
      
      // Process the threads to add vote counts and map to our frontend model
      const processedThreads = threads.map(thread => {
        const votes = thread.votes || [];
        const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
        const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
        const helpfulCount = votes.filter(v => v.vote_type === 'helpful').length;
        const userVote = currentUserId ? votes.find(v => v.user_id === currentUserId)?.vote_type as VoteType | undefined : undefined;
        
        // Handle possibly null user object
        let user = undefined;
        if (thread.user && typeof thread.user === 'object') {
          const threadUser = thread.user as Record<string, any>;
          if ('id' in threadUser) {
            user = {
              id: threadUser.id ?? '',
              username: threadUser.username ?? '',
              fullName: threadUser.full_name ?? '',
              avatarUrl: threadUser.avatar_url
            };
          }
        }
        
        // Handle possibly null category object
        let category;
        if (thread.category && typeof thread.category === 'object') {
          category = {
            id: thread.category.id,
            name: thread.category.name,
            slug: thread.category.slug,
            type: (thread.category.type as ForumCategoryType) || 'general',
            isActive: thread.category.is_active,
            createdAt: thread.created_at // Required by ForumCategory type
          };
        }
        
        return {
          id: thread.id,
          title: thread.title,
          content: thread.content,
          categoryId: thread.category_id,
          userId: thread.user_id,
          isPinned: thread.is_pinned,
          isLocked: thread.is_locked,
          viewCount: thread.view_count,
          threadType: thread.thread_type as ThreadType,
          status: (thread.status as ThreadStatus) || 'open', // Default to 'open' if invalid
          createdAt: thread.created_at,
          updatedAt: thread.updated_at || undefined,
          tags: thread.tags || [],
          
          // Related objects
          category,
          user,
          
          voteCount: upvotes - downvotes,
          replyCount: thread.posts?.[0]?.count || 0
        };
      });
      
      return processedThreads;
    } catch (error) {
      console.error('Error fetching bookmarked threads:', error);
      return [];
    }
  }
}
