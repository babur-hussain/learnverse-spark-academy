import React, { useState, useRef } from 'react';
import { Search, File, ArrowUp, Paperclip, X, Loader2, AlertCircle, Type } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card } from '@/components/UI/card';
import { Tooltip } from '@/components/UI/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

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
  const [query, setQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [streamingProgress, setStreamingProgress] = useState<number>(0);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [mode, setMode] = useState<'normal' | 'explain' | 'detailed' | 'analyze'>('normal');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      
      const newConversation = [...conversation];
      
      newConversation.push({
        role: 'user',
        content: query,
      });

      // Always use streaming for live generation viewing
      await handleStreamingSearch(newConversation);
      
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
      const response = await supabase.functions.invoke('deepseek-ai', {
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
