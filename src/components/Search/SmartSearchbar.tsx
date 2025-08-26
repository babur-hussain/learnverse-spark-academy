import React, { useState, useRef, useEffect } from 'react';
import { Search, File, ArrowUp, Paperclip, X, Loader2, AlertCircle, Type } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card } from '@/components/UI/card';
import { Tooltip } from '@/components/UI/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { AiChatService, AiChatMessageRow, AiChatSessionRow } from '@/services/AiChatService';

interface SmartSearchbarProps {
  className?: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SearchResult {
  answer: string;
  categories: string[];
  followUpSuggestions: string[];
}

interface StreamingChunk {
  chunk: string;
  isComplete: boolean;
  progress: number;
}

const SmartSearchbar: React.FC<SmartSearchbarProps> = ({ className }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [streamingProgress, setStreamingProgress] = useState<number>(0);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [mode, setMode] = useState<'normal' | 'explain' | 'detailed' | 'analyze'>('normal');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<AiChatSessionRow[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<AiChatMessageRow[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showAllSessions, setShowAllSessions] = useState(false);

  // Load sessions on auth ready
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('currentChatSessionId') : null;
    if (stored) {
      setCurrentSessionId(stored);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const list = await AiChatService.listSessions(user.id);
      setSessions(list);
      const sessionId = currentSessionId || list[0]?.id || null;
      if (!currentSessionId && sessionId) setCurrentSessionId(sessionId);
      if (sessionId) {
        await loadSession(sessionId);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentChatSessionId', currentSessionId);
    }
  }, [currentSessionId]);

  async function ensureSession(): Promise<string | null> {
    if (!user?.id) {
      toast({ title: 'Sign in required', description: 'Please sign in to save chats', variant: 'destructive' });
      return null;
    }
    if (currentSessionId) return currentSessionId;
    const created = await AiChatService.createSession(user.id, 'New chat');
    if (created) {
      setSessions(prev => [created, ...prev]);
      setCurrentSessionId(created.id);
      return created.id;
    }
    return null;
  }

  async function loadSession(sessionId: string) {
    if (!user?.id) return;
    const msgs = await AiChatService.listMessages(sessionId);
    setSessionMessages(msgs);
    // Map to local conversation for continuity
    const mapped: Message[] = msgs.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));
    setConversation(mapped);
    // Set last assistant message as result
    const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
    if (lastAssistant) {
      setResult(processAIResponse(lastAssistant.content));
      setIsExpanded(true);
    }
  }

  async function startNewChat() {
    if (!user?.id) {
      toast({ title: 'Sign in required', description: 'Please sign in to create chats', variant: 'destructive' });
      return;
    }
    const created = await AiChatService.createSession(user.id, 'New chat');
    if (created) {
      setSessions(prev => [created, ...prev]);
      setCurrentSessionId(created.id);
      setConversation([]);
      setSessionMessages([]);
      setResult(null);
      setQuery('');
      setIsExpanded(false);
    }
  }

  async function deleteCurrentChat() {
    if (!currentSessionId) return;
    const ok = await AiChatService.deleteSession(currentSessionId);
    if (ok) {
      const remaining = sessions.filter(s => s.id !== currentSessionId);
      setSessions(remaining);
      const next = remaining[0]?.id || null;
      setCurrentSessionId(next);
      setConversation([]);
      setSessionMessages([]);
      setResult(null);
      if (next) {
        await loadSession(next);
      }
      toast({ title: 'Chat deleted', description: 'The chat has been removed.' });
    } else {
      toast({ title: 'Delete failed', description: 'Could not delete chat', variant: 'destructive' });
    }
  }

  function sanitizeTitle(raw: string): string {
    const title = (raw || '').replace(/^\"|\"$/g, '').replace(/^'|'$/g, '').trim();
    const clipped = title.length > 60 ? title.slice(0, 60) : title;
    if (!clipped) return 'New chat';
    return clipped.charAt(0).toUpperCase() + clipped.slice(1);
  }

  async function generateAutoTitleFromAI(userQuery: string, aiAnswer?: string): Promise<string | null> {
    try {
      const instruction = `Create a short, clear 3-6 word title for this chat. No punctuation, no quotes.\nQuestion: ${userQuery}${aiAnswer ? `\nAnswer: ${aiAnswer}` : ''}`;
      const response = await supabase.functions.invoke('gemini-ai', {
        body: { query: instruction, stream: false, mode: 'normal' },
      });
      if (response.error || !response.data?.answer) return null;
      return sanitizeTitle((response.data.answer as string).split('\n')[0]);
    } catch {
      return null;
    }
  }

  const handleSearch = async () => {
    if (!query.trim() && !fileContent) {
      toast({
        title: "Input required",
        description: "Please enter a question or upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsStreaming(false);
    setIsExpanded(true);
    setError(null);
    setResult(null);
    setStreamingText('');
    setStreamingProgress(0);
    
    try {
      console.log("Starting AI search with query:", query);
      
      // Ensure a session exists
      const sessionId = await ensureSession();
      if (!sessionId) throw new Error('No chat session');

      const newConversation = [...conversation];
      
      newConversation.push({
        role: 'user',
        content: query,
      });

      // Persist user message
      if (user?.id) {
        await AiChatService.saveMessage({ sessionId, userId: user.id, role: 'user', content: query });
      }

      // Always use streaming for live generation viewing
      // TEMPORARILY DISABLED: await handleStreamingSearch(newConversation);
      
      // TEMPORARY: Use simple response for testing
      const response = await supabase.functions.invoke('gemini-ai', {
        body: {
          query: query.trim(),
          fileData: fileContent,
          mode,
          followUp: conversation.length > 0 ? conversation : null,
          language: 'en',
          stream: false,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error connecting to AI service');
      }

      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }

      if (!response.data) {
        throw new Error('No response received from AI service');
      }

      const data = response.data as SearchResult;
      
      if (!data.answer) {
        throw new Error('Invalid response format from AI service');
      }
      
      newConversation.push({
        role: 'assistant',
        content: data.answer,
      });

      // Persist assistant message
      if (user?.id) {
        await AiChatService.saveMessage({ sessionId, userId: user.id, role: 'assistant', content: data.answer });
      }

      // If the session title is default, update it to first question
      const current = sessions.find(s => s.id === sessionId);
      if (current && (current.title === 'New chat' || current.title.trim() === '')) {
        let title = await generateAutoTitleFromAI(query, data.answer);
        if (!title) title = sanitizeTitle(query.split(" ").slice(0, 6).join(" "));
        await supabase.from('ai_chat_sessions').update({ title }).eq('id', sessionId);
        setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, title } : s)));
      }
      
      setConversation(newConversation);
      setResult(data);
      setQuery('');
      setUploadedFile(null);
      setFileContent(null);
      setCurrentSessionId(sessionId);
      
      toast({
        title: "Search completed",
        description: "Your question has been processed successfully",
      });
    } catch (error) {
      console.error('Error in AI search:', error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      setError(errorMessage);
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingSearch = async (newConversation: Message[]) => {
    setIsStreaming(true);
    
    try {
      const response = await supabase.functions.invoke('gemini-ai', {
        body: {
          query: query.trim(),
          fileData: fileContent,
          mode,
          followUp: conversation.length > 0 ? conversation : null,
          language: 'en',
          stream: true,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error connecting to AI service');
      }

      // Handle streaming response
      if (response.data && typeof response.data === 'string') {
        const lines = response.data.split('\n');
        let fullAnswer = '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingChunk = JSON.parse(line.slice(6));
              setStreamingText(data.chunk);
              setStreamingProgress(data.progress);
              
              if (data.isComplete) {
                fullAnswer = data.chunk;
                break;
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', line);
            }
          }
        }

        // Add to conversation
        newConversation.push({
          role: 'assistant',
          content: fullAnswer,
        });

        // Process the complete response
        const processedResult = processAIResponse(fullAnswer);
        setResult(processedResult);
        setConversation(newConversation);
        setQuery('');
        setUploadedFile(null);
        setFileContent(null);
        
        toast({
          title: "Search completed",
          description: "Your question has been processed successfully",
        });
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    } finally {
      setIsStreaming(false);
    }
  };

  const processAIResponse = (answer: string): SearchResult => {
    // Smart categorization based on content analysis
    const categories = [];
    const lowerAnswer = answer.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (lowerAnswer.includes("formula") || lowerAnswer.includes("equation") || lowerQuery.includes("math")) {
      categories.push("Mathematics");
    }
    if (lowerAnswer.includes("concept") || lowerAnswer.includes("theory") || lowerAnswer.includes("principle")) {
      categories.push("Concept");
    }
    if (lowerAnswer.includes("solution") || lowerAnswer.includes("solve") || lowerAnswer.includes("answer")) {
      categories.push("Solution");
    }
    if (lowerQuery.includes("history") || lowerAnswer.includes("historical")) {
      categories.push("History");
    }
    if (lowerQuery.includes("science") || lowerAnswer.includes("scientific")) {
      categories.push("Science");
    }
    if (lowerQuery.includes("literature") || lowerAnswer.includes("literary")) {
      categories.push("Literature");
    }
    if (answer.length > 500) {
      categories.push("Detailed");
    }
    if (lowerAnswer.includes("research") || lowerAnswer.includes("study")) {
      categories.push("Research");
    }
    if (categories.length === 0) {
      categories.push("General");
    }

    // Generate follow-up suggestions
    const followUpSuggestions = [];
    if (mode === "explain") {
      followUpSuggestions.push("Can you provide a practical example?");
      followUpSuggestions.push("How does this relate to real-world applications?");
    } else if (mode === "detailed") {
      followUpSuggestions.push("What are the key takeaways from this?");
      followUpSuggestions.push("Can you summarize the main points?");
    } else if (mode === "analyze") {
      followUpSuggestions.push("What should I focus on studying first?");
      followUpSuggestions.push("Are there any related topics I should explore?");
    } else {
      followUpSuggestions.push(`Can you explain more about ${query.split(" ").slice(0, 3).join(" ")}?`);
      followUpSuggestions.push("What are practical applications of this?");
      followUpSuggestions.push("Can you provide an example?");
    }

    return {
      answer,
      categories,
      followUpSuggestions
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 
      'image/png', 
      'image/gif',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, Word document, image, or text file",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await extractTextFromFile(file);
      setFileContent(text);
      setUploadedFile(file);
      toast({
        title: "File uploaded successfully",
        description: "Your file has been processed and is ready for analysis",
      });
    } catch (error) {
      toast({
        title: "File processing failed",
        description: "Could not extract text from the uploaded file",
        variant: "destructive",
      });
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
      return await file.text();
    } else if (file.type.startsWith('image/')) {
      // For images, we'll just return the filename for now
      // In a real implementation, you'd use OCR or image analysis
      return `Image file: ${file.name}`;
    } else {
      // For PDFs and Word docs, we'll return the filename
      // In a real implementation, you'd extract text content
      return `Document file: ${file.name}`;
    }
  };

  const removeFile = () => {
    setFileContent(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFollowUpClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleModeChange = (newMode: 'normal' | 'explain' | 'detailed' | 'analyze') => {
    setMode(newMode);
    toast({
      title: "Mode changed",
      description: `Now using ${newMode} mode`,
    });
  };

  const handleRetry = () => {
    if (query.trim() || fileContent) {
      handleSearch();
    }
  };

  const renderStreamingResult = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Type className="h-4 w-4 animate-pulse" />
          <span>AI is typing...</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${streamingProgress}%` }}
          />
        </div>
        
        {/* Streaming text */}
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap">
            {streamingText}
            {!streamingText.endsWith('.') && !streamingText.endsWith('!') && !streamingText.endsWith('?') && streamingText && (
              <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto px-2 sm:px-4", className)}>
      <div className="relative">
        <div className="flex flex-wrap gap-2 justify-center mb-4 sm:mb-2 sm:justify-start">
          <Tooltip content="Normal mode - balanced responses">
            <Button
              variant={mode === 'normal' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('normal')}
              className="h-6 text-xs px-2 rounded-full"
              disabled={isLoading}
            >
              Normal
            </Button>
          </Tooltip>
          <Tooltip content="Simple explanations for easy understanding">
            <Button
              variant={mode === 'explain' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('explain')}
              className="h-6 text-xs px-2 rounded-full"
              disabled={isLoading}
            >
              Simple
            </Button>
          </Tooltip>
          <Tooltip content="Comprehensive detailed explanations">
            <Button
              variant={mode === 'detailed' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('detailed')}
              className="h-6 text-xs px-2 rounded-full"
              disabled={isLoading}
            >
              Detailed
            </Button>
          </Tooltip>
          <Tooltip content="Analyze and extract key insights">
            <Button
              variant={mode === 'analyze' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('analyze')}
              className="h-6 text-xs px-2 rounded-full"
              disabled={isLoading}
            >
              Analyze
            </Button>
          </Tooltip>

          {/* Chat controls */}
          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto sm:ml-4">
            <select
              className="h-7 text-xs px-2 border rounded-md bg-background"
              value={currentSessionId || ''}
              onChange={async (e) => {
                const id = e.target.value || null;
                setCurrentSessionId(id);
                if (id) await loadSession(id);
              }}
            >
              <option value="">Select chat</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.title || 'Untitled chat'}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={startNewChat} disabled={isLoading}>
              New chat
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={deleteCurrentChat} disabled={isLoading || !currentSessionId}>
              Delete
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              className="h-12 w-full rounded-full border border-input bg-background pl-10 pr-24 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ask any question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {uploadedFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={removeFile}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
            </div>
          </div>
          
          <Button
            onClick={handleSearch}
            disabled={isLoading || (!query.trim() && !fileContent)}
            className="h-12 px-4 rounded-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Horizontal sessions bar */}
        {sessions.length > 0 && (
          <div className="mt-2 -mx-1 px-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {sessions.slice(0, 12).map((s) => (
              <button
                key={s.id}
                onClick={async () => {
                  setCurrentSessionId(s.id);
                  await loadSession(s.id);
                }}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border inline-flex items-center",
                  currentSessionId === s.id ? "bg-primary/10 border-primary text-primary" : "hover:bg-muted"
                )}
                title={s.title}
              >
                {s.title || 'Untitled chat'}
              </button>
            ))}
            <button
              onClick={() => setShowAllSessions(true)}
              className="text-xs px-3 py-1 rounded-full border inline-flex items-center hover:bg-muted"
            >
              All sessions
            </button>
          </div>
        )}

        {showAllSessions && (
          <Card className="mt-2 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">All sessions</div>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAllSessions(false)}>Close</Button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-2">
                  <button
                    className="text-left text-sm flex-1 truncate hover:underline"
                    title={s.title}
                    onClick={async () => { setCurrentSessionId(s.id); await loadSession(s.id); setShowAllSessions(false); }}
                  >
                    {s.title || 'Untitled chat'}
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={async () => {
                      const ok = await AiChatService.deleteSession(s.id);
                      if (ok) {
                        setSessions(prev => prev.filter(x => x.id !== s.id));
                        if (currentSessionId === s.id) {
                          setCurrentSessionId(null);
                          setConversation([]);
                          setResult(null);
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-xs text-muted-foreground">No sessions yet</div>
              )}
            </div>
          </Card>
        )}

        {uploadedFile && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <File className="h-3 w-3" />
            <span>{uploadedFile.name}</span>
          </div>
        )}
      </div>

      {isExpanded && (
        <Card className="mt-4 p-5 animate-fade-in">
          {error ? (
            <div className="text-center p-6">
              <div className="flex items-center justify-center gap-2 text-destructive font-medium mb-2">
                <AlertCircle className="h-5 w-5" />
                Error Processing Request
              </div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRetry} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : isStreaming ? (
            renderStreamingResult()
          ) : result ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {result.categories.map((category, i) => (
                  <span 
                    key={i} 
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <div className="text-sm whitespace-pre-line text-foreground leading-relaxed">
                {result.answer}
              </div>
              {result.followUpSuggestions && result.followUpSuggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Follow-up questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.followUpSuggestions.map((suggestion, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 hover:bg-primary/10"
                        onClick={() => handleFollowUpClick(suggestion)}
                        disabled={isLoading}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Processing your question with AI...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-sm text-muted-foreground">
                Ask a question to get started with AI-powered learning assistance
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SmartSearchbar;
