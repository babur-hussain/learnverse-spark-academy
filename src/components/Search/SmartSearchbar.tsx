import React, { useState, useRef, useEffect } from 'react';
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
  const [enableStreaming, setEnableStreaming] = useState<boolean>(true);
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

      if (enableStreaming) {
        // Handle streaming response
        await handleStreamingSearch(newConversation);
      } else {
        // Handle regular response
        await handleRegularSearch(newConversation);
      }
      
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

  const handleRegularSearch = async (newConversation: Message[]) => {
    const response = await supabase.functions.invoke('deepseek-ai', {
      body: {
        query: query.trim(),
        fileData: fileContent,
        mode,
        followUp: conversation.length > 0 ? conversation : null,
        language: 'en',
        stream: false,
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
    
    toast({
      title: "Search completed",
      description: "Your question has been processed successfully",
    });
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

  const clearSearch = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setConversation([]);
    setStreamingText('');
    setStreamingProgress(0);
    setIsExpanded(false);
  };

  const renderResult = () => {
    if (isStreaming) {
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
    }

    if (result) {
      return (
        <div className="space-y-4">
          {/* Categories */}
          {result.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Answer */}
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{result.answer}</div>
          </div>

          {/* Follow-up suggestions */}
          {result.followUpSuggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Suggested follow-up questions:</h4>
              <div className="space-y-2">
                {result.followUpSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className="block w-full text-left p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-medium text-gray-600">AI-Powered Learning Assistant</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Learn Smarter with{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LearnVerse AI
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ask any question, upload documents, or get help with concepts. Our AI-powered learning assistant provides instant, accurate answers to help you excel in your studies.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center space-x-2">
          {(['normal', 'explain', 'detailed', 'analyze'] as const).map((modeOption) => (
            <Button
              key={modeOption}
              variant={mode === modeOption ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(modeOption)}
              className={cn(
                mode === modeOption && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
            </Button>
          ))}
        </div>

        {/* Streaming Toggle */}
        <div className="flex items-center justify-center space-x-2">
          <input
            type="checkbox"
            id="streaming-toggle"
            checked={enableStreaming}
            onChange={(e) => setEnableStreaming(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="streaming-toggle" className="text-sm text-gray-600">
            Enable live AI typing (streaming responses)
          </label>
        </div>

        {/* Search Input */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Paperclip className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask any question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          
          <Button
            onClick={handleSearch}
            disabled={isLoading || (!query.trim() && !fileContent)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* File Upload Display */}
        {uploadedFile && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{uploadedFile.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Results */}
        {isExpanded && (
          <div className="min-h-[200px] p-4 border border-gray-200 rounded-lg bg-white">
            {isLoading && !isStreaming ? (
              <div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Processing your question with AI... This may take a few moments</p>
              </div>
            ) : (
              renderResult()
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          Supports PDF, Word docs, images and text files up to 5MB
        </div>

        {/* Clear Button */}
        {isExpanded && (result || error || conversation.length > 0) && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={clearSearch}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear Search
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SmartSearchbar;
