
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Plus } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/UI/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AddContentButtonProps {
  subjectId: string | null;
}

export function AddContentButton({ subjectId }: AddContentButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleAddContent = (contentType: string) => {
    if (!subjectId) {
      toast({
        title: "No subject selected",
        description: "Please select a subject first before adding content.",
        variant: "destructive"
      });
      return;
    }
    
    switch(contentType) {
      case 'chapter':
        navigate(`/subjects/${subjectId}/chapters?action=new`);
        break;
      case 'resource':
        navigate(`/subjects/${subjectId}/resources?action=new`);
        break;
      default:
        console.error(`Unknown content type: ${contentType}`);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
        <DropdownMenuItem 
          onClick={() => handleAddContent('chapter')}
          className="cursor-pointer"
        >
          Add Chapter
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleAddContent('resource')}
          className="cursor-pointer"
        >
          Add Resource
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
