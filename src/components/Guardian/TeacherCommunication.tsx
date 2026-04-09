
import React, { useState, useEffect } from 'react';
import { useGuardian } from '@/contexts/GuardianContext';
import { GuardianService } from '@/services/GuardianService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { ScrollArea } from '@/components/UI/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Send, User, MessageSquare, CalendarDays } from 'lucide-react';
import type { ParentTeacherMessage } from '@/types/guardian';
import MeetingsList from './MeetingsList';

const TeacherCommunication: React.FC = () => {
  const { currentStudent } = useGuardian();
  const [messages, setMessages] = useState<ParentTeacherMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const { toast } = useToast();

  // Mock teachers data - in a real app, this would come from an API
  const teachers = [
    { id: "1", name: "Ms. Johnson", avatar_url: null },
    { id: "2", name: "Mr. Smith", avatar_url: null },
    { id: "3", name: "Dr. Patel", avatar_url: null },
  ];
  
  const [selectedTeacher, setSelectedTeacher] = useState(teachers[0]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentStudent?.student_id || !selectedTeacher) return;
      
      setIsLoading(true);
      try {
        const data = await GuardianService.getMessages(
          currentStudent.student_id,
          selectedTeacher.id
        );
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Could not load messages. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [currentStudent, selectedTeacher]);

  const handleSendMessage = async () => {
    if (!currentStudent?.student_id || !newMessage.trim() || !selectedTeacher) return;
    
    try {
      setIsSending(true);
      
      const message = await GuardianService.sendMessage({
        guardian_id: currentStudent.guardian_id,
        teacher_id: selectedTeacher.id,
        student_id: currentStudent.student_id,
        message: newMessage,
        attachments: []
      });
      
      if (message) {
        setMessages(prevMessages => [message, ...prevMessages]);
        setNewMessage('');
        toast({
          title: "Message sent",
          description: "Your message has been sent to the teacher",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!currentStudent) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please select a student to view teacher communications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Teacher Communication
        </CardTitle>
        <CardDescription>Communicate with your child's teachers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="meetings">
              <CalendarDays className="h-4 w-4 mr-2" />
              Meetings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="space-y-4">
            {/* Teacher selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {teachers.map(teacher => (
                <Button
                  key={teacher.id}
                  variant={selectedTeacher.id === teacher.id ? "default" : "outline"}
                  className="flex items-center gap-2 whitespace-nowrap"
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  <Avatar className="h-6 w-6">
                    {teacher.avatar_url ? (
                      <AvatarImage src={teacher.avatar_url} alt={teacher.name} />
                    ) : (
                      <AvatarFallback>
                        {teacher.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {teacher.name}
                </Button>
              ))}
            </div>
            
            {/* Message composer */}
            <div className="mb-6">
              <Textarea
                placeholder={`Write a message to ${selectedTeacher.name}...`}
                className="mb-2 min-h-[100px]"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
            
            {/* Messages list */}
            <ScrollArea className="border rounded-md h-[400px] p-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.teacher_id === selectedTeacher.id 
                          ? "bg-muted border border-border ml-8"
                          : "bg-primary/10 border border-primary/20 mr-8"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          {message.teacher_id === selectedTeacher.id ? (
                            message.teacher?.avatar_url ? (
                              <AvatarImage src={message.teacher.avatar_url} alt={message.teacher?.full_name || 'Teacher'} />
                            ) : (
                              <AvatarFallback>
                                {message.teacher?.full_name?.charAt(0) || 'T'}
                              </AvatarFallback>
                            )
                          ) : (
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {message.teacher_id === selectedTeacher.id 
                              ? message.teacher?.full_name || 'Teacher' 
                              : 'You'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>
                      <div className="ml-11">
                        <p className="text-sm">{message.message}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2">
                            {message.attachments.map((attachment, i) => (
                              <div key={i} className="text-xs text-blue-500 underline">
                                {attachment.filename}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="meetings">
            <MeetingsList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeacherCommunication;
