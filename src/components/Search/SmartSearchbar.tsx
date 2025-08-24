import React, { useState, useRef } from 'react';
import { Search, File, ArrowUp, Paperclip, X, Loader2, AlertCircle } from 'lucide-react';
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

const SmartSearchbar: React.FC<SmartSearchbarProps> = ({ className }) => {
  const [query, setQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setIsExpanded(true);
    setError(null);
    setResult(null);
    
    try {
      console.log("Starting AI search with query:", query);
      
      const newConversation = [...conversation];
      
      newConversation.push({
        role: 'user',
        content: query,
      });

      const response = await supabase.functions.invoke('deepseek-ai', {
        body: {
          query: query.trim(),
          fileData: fileContent,
          mode,
          followUp: conversation.length > 0 ? conversation : null,
          language: 'en',
        },
      });

      console.log("Supabase function response:", response);

      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(response.error.message || 'Error connecting to AI service');
      }

      if (response.data && response.data.error) {
        console.error("AI service error:", response.data.error);
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
      
      setConversation(newConversation);
      setResult(data);
      setQuery('');
      setUploadedFile(null);
      setFileContent(null);
      
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

    setUploadedFile(file);
    
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string);
      };
      reader.readAsText(file);
      return;
    }
    
    setFileContent(`File: ${file.name} (${file.type})`);
    
    toast({
      title: "File uploaded",
      description: `${file.name} ready for analysis`,
    });
  };

  const handleFollowUpClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setFileContent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                  onClick={handleClearFile}
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
