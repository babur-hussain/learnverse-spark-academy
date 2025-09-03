
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { ScrollArea } from '@/components/UI/scroll-area';
import { 
  Send, 
  UserCircle2, 
  Trash2, 
  Ban, 
  AlarmClock,
  Smile,
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LiveChatPanelProps {
  sessionId: string;
  isActive: boolean;
  isModerator?: boolean;
}

type ChatMessage = {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  created_at: string;
  is_highlighted: boolean;
  parent_id?: string;
  user?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
};

const ChatMessage: React.FC<{
  message: ChatMessage;
  isModerator: boolean;
  onDelete: (id: string) => void;
  onHighlight: (id: string) => void;
}> = ({ message, isModerator, onDelete, onHighlight }) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div 
      className={`p-3 rounded-md mb-2 relative ${
        message.is_highlighted 
          ? 'bg-amber-50 border-l-4 border-amber-500 dark:bg-amber-900/30 dark:border-amber-500' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start">
        {message.user?.avatar_url ? (
          <img 
            src={message.user.avatar_url} 
            alt={message.user.username || 'User'} 
            className="w-8 h-8 rounded-full mr-2 object-cover"
          />
        ) : (
          <UserCircle2 className="w-8 h-8 mr-2 text-gray-400" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="font-medium text-sm">
              {message.user?.full_name || message.user?.username || 'Anonymous user'}
            </span>
            {isModerator && (
              <Badge variant="outline" className="ml-2 text-xs">Instructor</Badge>
            )}
          </div>
          <p className="text-sm break-words">{message.message}</p>
        </div>
      </div>
      
      {isModerator && showActions && (
        <div className="absolute top-1 right-1 bg-white dark:bg-gray-800 rounded shadow-sm p-1 flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            title="Highlight message" 
            onClick={() => onHighlight(message.id)}
          >
            <AlertCircle className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-red-500" 
            title="Delete message" 
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            title="Ban user"
          >
            <Ban className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            title="Timeout user"
          >
            <AlarmClock className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    user_id: 'user-1',
    session_id: 'session-1',
    message: 'Hello, is the class starting soon?',
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    is_highlighted: false,
    user: {
      full_name: 'Rahul Singh',
      username: 'rahuls',
      avatar_url: 'https://i.pravatar.cc/150?u=rahul'
    }
  },
  {
    id: '2',
    user_id: 'user-2',
    session_id: 'session-1',
    message: 'Yes, the instructor will start in about 5 minutes!',
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    is_highlighted: false,
    user: {
      full_name: 'Aisha Patel',
      username: 'aisha',
      avatar_url: 'https://i.pravatar.cc/150?u=aisha'
    }
  },
  {
    id: '3',
    user_id: 'instructor-1',
    session_id: 'session-1',
    message: 'Hi everyone! I\'ll be starting the live class shortly. Please get your notebooks ready.',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    is_highlighted: true,
    user: {
      full_name: 'Dr. Meenakshi Kumar',
      username: 'drkumar',
      avatar_url: 'https://i.pravatar.cc/150?u=drkumar'
    }
  },
  {
    id: '4',
    user_id: 'user-3',
    session_id: 'session-1',
    message: 'Will we be covering the topics from chapter 4 today?',
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    is_highlighted: false,
    user: {
      full_name: 'Vikram Joshi',
      username: 'vikramj',
      avatar_url: 'https://i.pravatar.cc/150?u=vikram'
    }
  },
  {
    id: '5',
    user_id: 'instructor-1',
    session_id: 'session-1',
    message: 'Yes, we will be covering sections 4.1 through 4.3 today, and there will be practice problems at the end.',
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    is_highlighted: false,
    user: {
      full_name: 'Dr. Meenakshi Kumar',
      username: 'drkumar',
      avatar_url: 'https://i.pravatar.cc/150?u=drkumar'
    }
  },
  {
    id: '6',
    user_id: 'user-4',
    session_id: 'session-1',
    message: 'I\'m having trouble understanding the concept we covered last class. Can we do a quick revision?',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    is_highlighted: false,
    user: {
      full_name: 'Arjun Reddy',
      username: 'arjunr',
      avatar_url: 'https://i.pravatar.cc/150?u=arjun'
    }
  },
  {
    id: '7',
    user_id: 'instructor-1',
    session_id: 'session-1',
    message: 'Of course, Arjun! We\'ll start with a 5-minute review of the previous concepts.',
    created_at: new Date(Date.now() - 3 * 60000).toISOString(), 
    is_highlighted: false,
    user: {
      full_name: 'Dr. Meenakshi Kumar',
      username: 'drkumar',
      avatar_url: 'https://i.pravatar.cc/150?u=drkumar'
    }
  }
];

const LiveChatPanel: React.FC<LiveChatPanelProps> = ({ 
  sessionId, 
  isActive = true, 
  isModerator = false 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // In a real implementation, you would fetch messages from your database
  useEffect(() => {
    // For demo purposes, we're using mock data
    // But in a real app, you would fetch messages from your API
    setIsLoading(true);
    
    const fetchMessages = async () => {
      try {
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Messages already loaded from mock data
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        toast({
          title: 'Error loading chat',
          description: 'Could not load chat messages. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('live_chat')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_chat_messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        // In a real app, you would add the new message to your state
        // For demo purposes, we'll just log it
        console.log('New message:', payload.new);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, toast]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, you would save the message to your database
      // For demo purposes, we're just updating the local state
      
      const newMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        session_id: sessionId,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        is_highlighted: false,
        user: {
          full_name: user.user_metadata?.full_name,
          username: user.user_metadata?.username,
          avatar_url: user.user_metadata?.avatar_url
        }
      };
      
      // Add to local state
      setMessages(prev => [...prev, newMsg]);
      
      // Reset input
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: 'Your message could not be sent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    // In a real implementation, you would delete the message from your database
    // For demo purposes, we're just updating the local state
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    toast({
      title: 'Message deleted',
      description: 'The message has been removed from the chat.',
    });
  };
  
  const handleHighlightMessage = async (messageId: string) => {
    // In a real implementation, you would update the message in your database
    // For demo purposes, we're just updating the local state
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_highlighted: !msg.is_highlighted } 
          : msg
      )
    );
    
    toast({
      title: 'Message highlighted',
      description: 'The message has been highlighted in the chat.',
    });
  };
  
  // Emoji reactions
  const emojis = [
    { icon: <ThumbsUp className="h-4 w-4" />, label: '👍' },
    { icon: <Heart className="h-4 w-4" />, label: '❤️' },
    { icon: <Laugh className="h-4 w-4" />, label: '😂' },
    { icon: <Frown className="h-4 w-4" />, label: '😢' },
  ];
  
  const handleAddEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };
  
  return (
    <Card className="h-[70vh] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Live Chat</CardTitle>
        <CardDescription>
          {isActive ? 'Chat with instructors and other students' : 'Chat is disabled when stream is not active'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                No messages yet. Be the first to say hello!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map(message => (
                <ChatMessage 
                  key={message.id}
                  message={message}
                  isModerator={isModerator}
                  onDelete={handleDeleteMessage}
                  onHighlight={handleHighlightMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0">
        <form onSubmit={handleSendMessage} className="w-full space-y-2">
          <div className="flex gap-1 flex-wrap">
            {emojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                type="button"
                className="h-8 px-2 text-lg"
                title={`React with ${emoji.label}`}
                onClick={() => handleAddEmoji(emoji.label)}
              >
                {emoji.icon}
              </Button>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder={isActive ? "Type your message..." : "Chat is disabled"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isActive || isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!isActive || !newMessage.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default LiveChatPanel;
