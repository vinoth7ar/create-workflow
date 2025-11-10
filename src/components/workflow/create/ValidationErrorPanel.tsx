import { useState } from 'react';
import { AlertCircle, AlertTriangle, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import type { GroupedValidationIssue } from './CreateWorkflow';
import { ValidationErrorSeverity } from '@/utils/workflowValidation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ValidationErrorPanelProps {
  groupedIssues: GroupedValidationIssue[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFocusError: (index: number) => void;
}

export const ValidationErrorPanel = ({
  groupedIssues,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onFocusError,
}: ValidationErrorPanelProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const totalCount = groupedIssues.length;

  if (totalCount === 0) return null;

  const currentIssue = groupedIssues[currentIndex];
  const isError = currentIssue.severity === ValidationErrorSeverity.ERROR;
  const hasMultipleIssues = currentIssue.issues.length > 1;

  return (
    <div className='fixed top-0 left-0 right-0 z-50 shadow-md border-b'>
      <div
        className={`${
          isError
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
        } border-b-2 transition-all duration-300`}
      >
        <div className='max-w-7xl mx-auto px-6 py-3'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              {isError ? (
                <AlertCircle className={`w-5 h-5 ${isError ? 'text-red-600' : 'text-yellow-600'} flex-shrink-0`} />
              ) : (
                <AlertTriangle className={`w-5 h-5 ${isError ? 'text-red-600' : 'text-yellow-600'} flex-shrink-0`} />
              )}
              
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-0.5'>
                  <h3 className={`${isError ? 'text-red-900' : 'text-yellow-900'} font-semibold text-sm`}>
                    {isError ? 'Validation Error' : 'Validation Warning'}
                  </h3>
                  <span className={`px-2 py-0.5 ${isError ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} rounded-full text-xs font-medium`}>
                    {currentIndex + 1} of {totalCount}
                  </span>
                </div>
                
                <div className='flex items-center gap-2'>
                  <p className={`${isError ? 'text-red-800' : 'text-yellow-800'} text-sm font-medium`}>
                    {currentIssue.summary}
                  </p>
                  
                  {hasMultipleIssues && (
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className={`p-1 rounded-full ${isError ? 'hover:bg-red-100 text-red-600' : 'hover:bg-yellow-100 text-yellow-600'} transition-colors`}
                          data-testid='button-info-popup'
                          title='View all issues'
                        >
                          <Info className='w-4 h-4' />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className='w-80 p-0' align='start'>
                        <div className='p-3 border-b bg-gray-50'>
                          <h4 className='font-semibold text-sm text-gray-900'>
                            All Issues for {currentIssue.nodeName || 'Workflow'}
                          </h4>
                        </div>
                        <div className='max-h-64 overflow-y-auto p-3 space-y-2'>
                          {currentIssue.issues.map((issue, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded text-xs ${
                                issue.severity === ValidationErrorSeverity.ERROR
                                  ? 'bg-red-50 border border-red-200'
                                  : 'bg-yellow-50 border border-yellow-200'
                              }`}
                              data-testid={`issue-detail-${index}`}
                            >
                              <div className='flex items-start gap-2'>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                  issue.severity === ValidationErrorSeverity.ERROR
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {issue.severity === ValidationErrorSeverity.ERROR ? 'Error' : 'Warning'}
                                </span>
                                <p className={`flex-1 ${
                                  issue.severity === ValidationErrorSeverity.ERROR
                                    ? 'text-red-800'
                                    : 'text-yellow-800'
                                }`}>
                                  {issue.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {totalCount > 1 && (
                <div className='flex items-center gap-1 bg-white/60 rounded-lg p-1 border border-gray-200'>
                  <button
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className={`p-1.5 rounded ${isError ? 'text-red-600 hover:bg-red-50' : 'text-yellow-600 hover:bg-yellow-50'} disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
                    data-testid='button-previous-error'
                    title='Previous issue'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </button>
                  
                  <div className='px-2 flex gap-1'>
                    {groupedIssues.map((issue, index) => (
                      <button
                        key={index}
                        onClick={() => onFocusError(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentIndex
                            ? (issue.severity === ValidationErrorSeverity.ERROR ? 'bg-red-600 scale-125' : 'bg-yellow-600 scale-125')
                            : (issue.severity === ValidationErrorSeverity.ERROR ? 'bg-red-300 hover:bg-red-400' : 'bg-yellow-300 hover:bg-yellow-400')
                        }`}
                        data-testid={`button-error-dot-${index}`}
                        title={`Go to ${issue.severity === ValidationErrorSeverity.ERROR ? 'error' : 'warning'} ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={onNext}
                    disabled={currentIndex === totalCount - 1}
                    className={`p-1.5 rounded ${isError ? 'text-red-600 hover:bg-red-50' : 'text-yellow-600 hover:bg-yellow-50'} disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
                    data-testid='button-next-error'
                    title='Next issue'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>
              )}
              
              <button
                onClick={onClose}
                className={`p-1.5 rounded ${isError ? 'text-red-600 hover:bg-red-100' : 'text-yellow-600 hover:bg-yellow-100'} transition-all ml-1`}
                data-testid='button-close-validation'
                title='Close'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
