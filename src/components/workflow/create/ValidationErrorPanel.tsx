import { AlertCircle, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ValidationError } from '@/utils/workflowValidation';

interface ValidationErrorPanelProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFocusError: (index: number) => void;
}

export const ValidationErrorPanel = ({
  errors,
  warnings,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onFocusError,
}: ValidationErrorPanelProps) => {
  const allIssues = [...errors, ...warnings];
  const hasErrors = errors.length > 0;
  const totalCount = allIssues.length;

  if (totalCount === 0) return null;

  const currentIssue = allIssues[currentIndex];
  const isError = currentIndex < errors.length;

  return (
    <div className='fixed top-0 left-0 right-0 z-50 shadow-lg border-b-2'>
      <div
        className={`${
          isError
            ? 'bg-gradient-to-r from-red-600 to-red-700'
            : 'bg-gradient-to-r from-yellow-600 to-yellow-700'
        } transition-all duration-300`}
      >
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3 flex-1'>
              {isError ? (
                <AlertCircle className='w-6 h-6 text-white flex-shrink-0' />
              ) : (
                <AlertTriangle className='w-6 h-6 text-white flex-shrink-0' />
              )}
              
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-3 mb-1'>
                  <h3 className='text-white font-bold text-lg'>
                    {isError ? 'Validation Error' : 'Validation Warning'}
                  </h3>
                  <span className='px-2.5 py-0.5 bg-white/20 rounded-full text-white text-xs font-semibold backdrop-blur-sm'>
                    {currentIndex + 1} of {totalCount}
                  </span>
                </div>
                
                <p className='text-white/95 text-sm font-medium'>
                  {currentIssue.message}
                </p>
                
                {currentIssue.nodeName && (
                  <p className='text-white/80 text-xs mt-1'>
                    Node: {currentIssue.nodeName}
                  </p>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {totalCount > 1 && (
                <div className='flex items-center gap-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm'>
                  <button
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className='p-1.5 rounded text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                    data-testid='button-previous-error'
                    title='Previous error'
                  >
                    <ChevronLeft className='w-5 h-5' />
                  </button>
                  
                  <div className='px-2 flex gap-1'>
                    {allIssues.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => onFocusError(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? 'bg-white scale-125'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                        data-testid={`button-error-dot-${index}`}
                        title={`Go to ${index < errors.length ? 'error' : 'warning'} ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={onNext}
                    disabled={currentIndex === totalCount - 1}
                    className='p-1.5 rounded text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                    data-testid='button-next-error'
                    title='Next error'
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>
                </div>
              )}
              
              <button
                onClick={onClose}
                className='p-1.5 rounded text-white hover:bg-white/20 transition-all ml-2'
                data-testid='button-close-validation'
                title='Close'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {hasErrors && currentIndex >= errors.length && (
            <div className='mt-3 pt-3 border-t border-white/20'>
              <p className='text-white/90 text-xs'>
                ✓ All {errors.length} error{errors.length !== 1 ? 's' : ''} fixed! 
                {warnings.length > 0 && (
                  <span className='ml-1'>
                    Review {warnings.length} warning{warnings.length !== 1 ? 's' : ''} (optional).
                  </span>
                )}
              </p>
            </div>
          )}
          
          {hasErrors && currentIndex < errors.length && (
            <div className='mt-3 pt-3 border-t border-white/20'>
              <p className='text-white/90 text-xs'>
                Fix this error to continue. {errors.length - currentIndex - 1} more error{errors.length - currentIndex - 1 !== 1 ? 's' : ''} remaining.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
