
import React from 'react';
import { Textarea } from '@/components/UI/textarea';
import { Button } from '@/components/UI/button';
import { Bold, Italic, List, ListOrdered, Link } from 'lucide-react';

// This is a simple implementation. In a real application, you would use a full-featured
// rich text editor like TipTap, CKEditor, or React-Quill.

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const handleButtonClick = (tag: string) => {
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = '';
    if (tag === 'b') {
      newText = `<b>${selectedText}</b>`;
    } else if (tag === 'i') {
      newText = `<i>${selectedText}</i>`;
    } else if (tag === 'ul') {
      newText = `\n<ul>\n  <li>${selectedText || 'List item'}</li>\n</ul>`;
    } else if (tag === 'ol') {
      newText = `\n<ol>\n  <li>${selectedText || 'List item'}</li>\n</ol>`;
    } else if (tag === 'a') {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        newText = `<a href="${url}">${selectedText || url}</a>`;
      } else {
        return;
      }
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center px-2 py-1 bg-muted border-b">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleButtonClick('b')}
          title="Bold"
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleButtonClick('i')}
          title="Italic"
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleButtonClick('ul')}
          title="Bullet List"
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleButtonClick('ol')}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleButtonClick('a')}
          title="Insert Link"
        >
          <Link size={16} />
        </Button>
      </div>

      <Textarea
        id="rich-text-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] p-3 border-0 focus-visible:ring-0 rounded-none"
      />
    </div>
  );
};

export default RichTextEditor;
