import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';
import { cn } from '@/lib/utils';

export interface HierarchicalOption {
  value: string;
  label: string;
  children?: HierarchicalOption[];
}

interface HierarchicalSelectProps {
  options: HierarchicalOption[];
  value?: string;
  onChange: (value: string, label: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onCreateNew?: () => void;
}

export function HierarchicalSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
  disabled = false,
  onCreateNew,
}: HierarchicalSelectProps) {
  const [open, setOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState<HierarchicalOption[][]>([options]);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  const currentOptions = navigationStack[navigationStack.length - 1];
  const selectedLabel = findLabelByValue(options, value);

  function findLabelByValue(opts: HierarchicalOption[], val?: string): string | undefined {
    if (!val) return undefined;

    for (const opt of opts) {
      if (opt.value === val) return opt.label;
      if (opt.children) {
        const found = findLabelByValue(opt.children, val);
        if (found) return found;
      }
    }
    return undefined;
  }

  const handleSelect = (option: HierarchicalOption) => {
    if (option.children && option.children.length > 0) {
      setNavigationStack([...navigationStack, option.children]);
      setBreadcrumb([...breadcrumb, option.label]);
    } else {
      onChange(option.value, option.label);
      setOpen(false);
      setNavigationStack([options]);
      setBreadcrumb([]);
    }
  };

  const handleBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(navigationStack.slice(0, -1));
      setBreadcrumb(breadcrumb.slice(0, -1));
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setNavigationStack([options]);
      setBreadcrumb([]);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
          data-testid='hierarchical-select-trigger'
        >
          <span className='truncate'>{selectedLabel || placeholder}</span>
          <ChevronRight className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='start'>
        <div className='flex flex-col max-h-[300px]'>
          {breadcrumb.length > 0 && (
            <div className='flex items-center gap-2 px-3 py-2 border-b bg-muted/50'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleBack}
                className='h-6 px-2'
                data-testid='hierarchical-select-back'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-sm text-muted-foreground truncate'>
                {breadcrumb.join(' > ')}
              </span>
            </div>
          )}
          <div className='overflow-y-auto'>
            {currentOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors',
                  value === option.value && 'bg-accent'
                )}
                data-testid={`hierarchical-select-option-${option.value}`}
              >
                <span className='text-sm'>{option.label}</span>
                {option.children && option.children.length > 0 && (
                  <ChevronRight className='h-4 w-4 opacity-50' />
                )}
              </button>
            ))}
            {onCreateNew && (
              <button
                onClick={() => {
                  onCreateNew();
                  setOpen(false);
                  setNavigationStack([options]);
                  setBreadcrumb([]);
                }}
                className='w-full text-left px-3 py-2 border-t hover:bg-accent hover:text-accent-foreground transition-colors text-primary'
                data-testid='hierarchical-select-create-new'
              >
                <span className='text-sm'>+ Create New</span>
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
