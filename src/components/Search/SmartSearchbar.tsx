import React, { useState, useRef } from 'react';
import { Search, File, Mic, ArrowUp, Paperclip, X, Loader2 } from 'lucide-react';
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
    
    try {
      const newConversation = [...conversation];
      
      newConversation.push({
        role: 'user',
        content: query,
      });

      const response = await supabase.functions.invoke('deepseek-ai', {
        body: {
          query,
          fileData: fileContent,
          mode,
          followUp: conversation.length > 0 ? conversation : null,
          language: 'en',
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error processing your request');
      }

      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }

      const data = response.data as SearchResult;
      
      newConversation.push({
        role: 'assistant',
        content: data.answer,
      });
      
      setConversation(newConversation);
      setResult(data);
      setQuery('');
      setUploadedFile(null);
      setFileContent(null);
      
    } catch (error) {
      console.error('Error in AI search:', error);
      setError(error instanceof Error ? error.message : "Something went wrong");
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Something went wrong",
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
      'audio/mp3',
      'audio/mpeg',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, Word document, image, or audio file",
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

  return (
    <div className={cn("w-full max-w-4xl mx-auto px-4", className)}>
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              className="h-12 w-full rounded-full border border-input bg-background pl-10 pr-24 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder-gray-400"
              placeholder="Ask any educational question..."
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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.txt"
              />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading}
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
        
        <div className="absolute right-16 -top-8 flex gap-2">
          <Tooltip content="Normal mode">
            <Button
              variant={mode === 'normal' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('normal')}
              className="h-6 text-xs px-2 rounded-full"
            >
              Normal
            </Button>
          </Tooltip>
          <Tooltip content="Explain like I'm 5">
            <Button
              variant={mode === 'explain' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('explain')}
              className="h-6 text-xs px-2 rounded-full"
            >
              Simple
            </Button>
          </Tooltip>
          <Tooltip content="Detailed academic explanation">
            <Button
              variant={mode === 'detailed' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('detailed')}
              className="h-6 text-xs px-2 rounded-full"
            >
              Detailed
            </Button>
          </Tooltip>
          <Tooltip content="Analyze documents or problems">
            <Button
              variant={mode === 'analyze' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('analyze')}
              className="h-6 text-xs px-2 rounded-full"
            >
              Analyze
            </Button>
          </Tooltip>
        </div>
      </div>

      {isExpanded && (
        <Card className="mt-4 p-5 animate-fade-in dark:bg-card dark:border-border">
          {error ? (
            <div className="text-center p-6">
              <div className="text-destructive font-medium mb-2">Error</div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <p className="text-sm">
                The DeepSeek AI API is currently experiencing an issue. Please try again later or contact support.
              </p>
            </div>
          ) : result ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {result.categories.map((category, i) => (
                  <span 
                    key={i} 
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <div className="text-sm whitespace-pre-line text-foreground">
                {result.answer}
              </div>
              {result.followUpSuggestions && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Follow-up questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.followUpSuggestions.map((suggestion, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleFollowUpClick(suggestion)}
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
              <p className="text-sm text-muted-foreground">Processing your question...</p>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-sm text-muted-foreground">
                Ask a question to get started
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SmartSearchbar;
