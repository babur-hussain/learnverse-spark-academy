
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import RichTextEditor from './RichTextEditor';
import { Paperclip, Send } from 'lucide-react';

interface PostFormProps {
  onSubmit: (content: string) => Promise<void>;
}

const PostForm = ({ onSubmit }: PostFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Write your reply here..."
      />
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={() => {}}
        >
          <Paperclip size={16} className="mr-1" />
          Attach Files
        </Button>
        
        <Button
          type="button"
          disabled={!content.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Posting...' : (
            <>
              <Send size={16} className="mr-1" />
              Post Reply
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PostForm;
