import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/UI/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/UI/popover";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  // Runtime guards to ensure options and selected are always arrays
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];
  const [open, setOpen] = React.useState(false);

  // Debug: log the options and safeOptions on every render
  React.useEffect(() => {
    console.log('MultiSelect render:', { options, safeOptions });
  }, [options, safeOptions]);

  const handleUnselect = (value: string) => {
    onChange(safeSelected.filter((item) => item !== value));
  };

  const handleSelect = (value: string) => {
    if (safeSelected.includes(value)) {
      onChange(safeSelected.filter((item) => item !== value));
    } else {
      onChange([...safeSelected, value]);
    }
  };

  const selectedLabels = safeSelected.map(
    (value) => safeOptions.find((option) => option.value === value)?.label || value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {safeSelected.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedLabels.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {label}
                <button
                  type="button"
                  className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    const value = safeOptions.find((option) => option.label === label)?.value;
                    if (value) handleUnselect(value);
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {Array.isArray(safeOptions) && safeOptions.length > 0 ? (
              safeOptions.map((option) => {
                const isSelected = safeSelected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={cn(
                          "border mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-primary opacity-50"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                );
              })
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">No options available</div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
