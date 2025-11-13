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

interface HierarchicalMultiSelectProps {
  options: HierarchicalOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onCreateNew?: () => void;
}

export function HierarchicalMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select options',
  className,
  disabled = false,
  onCreateNew,
}: HierarchicalMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState<HierarchicalOption[][]>([options]);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  const currentOptions = navigationStack[navigationStack.length - 1];

  const handleNavigate = (option: HierarchicalOption) => {
    if (option.children && option.children.length > 0) {
      setNavigationStack([...navigationStack, option.children]);
      setBreadcrumb([...breadcrumb, option.label]);
    }
  };

  function getAllTerminalValues(opts: HierarchicalOption[]): string[] {
    const values: string[] = [];
    for (const opt of opts) {
      if (opt.value !== 'create-new' && opt.value !== 'select-all') {
        if (!opt.children || opt.children.length === 0) {
          values.push(opt.value);
        } else {
          values.push(...getAllTerminalValues(opt.children));
        }
      }
    }
    return values;
  }

  const allTerminalValues = getAllTerminalValues(options);
  const isAllSelected =
    allTerminalValues.length > 0 && allTerminalValues.every((v) => value.includes(v));

  const handleToggle = (optionValue: string) => {
    if (optionValue === 'select-all') {
      if (isAllSelected) {
        onChange([]);
      } else {
        onChange(allTerminalValues);
      }
    } else if (optionValue === 'create-new') {
      setOpen(false);
      if (onCreateNew) {
        onCreateNew();
      }
    } else {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
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

  const displayText = value.length > 0 ? `${value.length} selected` : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
          data-testid='hierarchical-multi-select-trigger'
        >
          <span className='truncate'>{displayText}</span>
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
                data-testid='hierarchical-multi-select-back'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-sm text-muted-foreground truncate'>
                {breadcrumb.join(' > ')}
              </span>
            </div>
          )}
          <div className='overflow-y-auto'>
            {currentOptions.map((option) => {
              const isSpecialOption =
                option.value === 'select-all' || option.value === 'create-new';
              const isSelectAll = option.value === 'select-all';
              const isCreateNew = option.value === 'create-new';
              const hasChildren = option.children && option.children.length > 0;

              return (
                <div
                  key={option.value}
                  className='flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors'
                >
                  {hasChildren ? (
                    <button
                      onClick={() => handleNavigate(option)}
                      className='flex items-center justify-between w-full'
                      data-testid={`hierarchical-multi-select-option-${option.value}`}
                    >
                      <span className='text-sm'>{option.label}</span>
                      <ChevronRight className='h-4 w-4 opacity-50' />
                    </button>
                  ) : isCreateNew ? (
                    <button
                      onClick={() => {
                        if (onCreateNew) {
                          onCreateNew();
                          setOpen(false);
                          setNavigationStack([options]);
                          setBreadcrumb([]);
                        }
                      }}
                      className='flex items-center gap-2 cursor-pointer flex-1 text-sm text-primary'
                      data-testid={`hierarchical-multi-select-create-new`}
                    >
                      <span className='text-sm font-medium'>{option.label}</span>
                    </button>
                  ) : (
                    <label className='flex items-center gap-2 cursor-pointer flex-1'>
                      <input
                        type='checkbox'
                        checked={isSelectAll ? isAllSelected : value.includes(option.value)}
                        onChange={() => handleToggle(option.value)}
                        className='w-4 h-4'
                        data-testid={`hierarchical-multi-select-checkbox-${option.value}`}
                      />
                      <span className='text-sm'>{option.label}</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
