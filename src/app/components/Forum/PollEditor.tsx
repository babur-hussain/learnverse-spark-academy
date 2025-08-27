
import React from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Trash2, Plus } from 'lucide-react';

interface PollOption {
  text: string;
}

interface PollEditorProps {
  options: PollOption[];
  setOptions: React.Dispatch<React.SetStateAction<PollOption[]>>;
}

const PollEditor = ({ options, setOptions }: PollEditorProps) => {
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Poll Options</label>
      
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={option.text}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveOption(index)}
            disabled={options.length <= 2}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddOption}
        className="mt-2"
      >
        <Plus size={16} className="mr-1" />
        Add Option
      </Button>
    </div>
  );
};

export default PollEditor;
