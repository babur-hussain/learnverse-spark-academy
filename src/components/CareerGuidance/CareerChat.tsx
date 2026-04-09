import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Textarea } from '@/components/UI/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { Send, UserCircle, Bot, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CareerGuidanceService } from '@/services/CareerGuidanceService';
import type { ChatMessage, CareerProfile, CareerRoadmap } from '@/types/career';

const CareerChat: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const profileData = await CareerGuidanceService.getCareerProfile(user.id);
        setProfile(profileData);
        
        const history = await CareerGuidanceService.getChatHistory(user.id);
        setChatHistory(history);
        
        const matches = await CareerGuidanceService.getCareerMatches(user.id);
        if (matches.length > 0 && matches[0].id) {
          const roadmapData = await CareerGuidanceService.getCareerRoadmap(matches[0].id);
          setRoadmap(roadmapData);
        }
        
        if (history.length === 0) {
          const welcomeMessage: ChatMessage = {
            is_user: false,
            message: "Hi there! I'm your AI career counselor. I can help answer questions about your career path, suggest next steps, or clarify aspects of your roadmap. How can I assist you today?"
          };
          
          const savedMessage = await CareerGuidanceService.saveChatMessage({
            user_id: user.id,
            is_user: false,
            message: welcomeMessage.message
          });
          
          if (savedMessage) {
            setChatHistory([savedMessage]);
          }
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
        toast({
          title: "Error",
          description: "Failed to load chat data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id, toast]);
  
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id) return;
    
    const userMessage = message.trim();
    setMessage('');
    setSending(true);
    
    try {
      const savedUserMessage = await CareerGuidanceService.saveChatMessage({
        user_id: user.id,
        is_user: true,
        message: userMessage
      });
      
      if (savedUserMessage) {
        setChatHistory(prev => [...prev, savedUserMessage]);
      }
      
      const aiResponse = await CareerGuidanceService.chatWithAI(
        userMessage,
        chatHistory,
        profile,
        roadmap
      );
      
      if (!aiResponse) {
        throw new Error("Failed to get a response from the AI.");
      }
      
      const savedAiMessage = await CareerGuidanceService.saveChatMessage({
        user_id: user.id,
        is_user: false,
        message: aiResponse
      });
      
      if (savedAiMessage) {
        setChatHistory(prev => [...prev, savedAiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card className="border-learn-purple/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-learn-purple">
            <Bot className="mr-2 h-5 w-5" /> Career AI Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-4 space-y-4 mb-4">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.is_user ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.is_user
                        ? 'bg-learn-purple text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {!msg.is_user && (
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                          <AvatarFallback className="bg-learn-purple text-white">AI</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs opacity-75">
                        {msg.is_user ? 'You' : 'AI Assistant'}
                      </span>
                      {user && msg.is_user && (
                        <Avatar className="h-6 w-6 ml-2">
                          <AvatarImage src={user.user_metadata?.avatar_url || user.avatar_url || ''} alt="User" />
                          <AvatarFallback>
                            <UserCircle className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {msg.message}
                    </div>
                    {msg.timestamp && (
                      <div className="text-xs opacity-50 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
            
            <div className="flex items-end gap-2 mt-auto">
              <Textarea
                placeholder="Type your question here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none"
                rows={3}
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="bg-learn-purple hover:bg-learn-purple/90"
              >
                {sending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {chatHistory.length > 10 && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToBottom}
            className="flex items-center"
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Scroll to bottom
          </Button>
        </div>
      )}
    </div>
  );
};

export default CareerChat;
