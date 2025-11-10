import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ValidationError, ValidationErrorSeverity } from '@/utils/workflowValidation';

interface ValidationErrorPanelProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  onClose: () => void;
  onErrorClick: (nodeId?: string) => void;
}

export const ValidationErrorPanel = ({
  errors,
  warnings,
  onClose,
  onErrorClick,
}: ValidationErrorPanelProps) => {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) return null;

  return (
    <div className='fixed bottom-4 right-4 z-50 w-96 max-h-[500px] bg-white rounded-lg shadow-2xl border-2 border-gray-200 flex flex-col'>
      <div
        className={`px-4 py-3 rounded-t-lg flex items-center justify-between ${
          hasErrors ? 'bg-red-600' : 'bg-yellow-600'
        }`}
      >
        <div className='flex items-center gap-2'>
          {hasErrors ? (
            <AlertCircle className='w-5 h-5 text-white' />
          ) : (
            <AlertTriangle className='w-5 h-5 text-white' />
          )}
          <h3 className='text-white font-semibold'>
            {hasErrors ? 'Validation Errors' : 'Validation Warnings'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className='text-white hover:text-gray-200 transition-colors'
          data-testid='button-close-validation'
        >
          <X className='w-5 h-5' />
        </button>
      </div>

      <div className='overflow-y-auto flex-1 p-4 space-y-3'>
        {hasErrors && (
          <div className='space-y-2'>
            <div className='flex items-center gap-2 mb-2'>
              <AlertCircle className='w-4 h-4 text-red-600' />
              <h4 className='text-sm font-semibold text-red-600'>
                Errors ({errors.length})
              </h4>
            </div>
            {errors.map((error, index) => (
              <div
                key={`error-${index}`}
                onClick={() => error.nodeId && onErrorClick(error.nodeId)}
                className={`p-3 bg-red-50 border border-red-200 rounded text-sm ${
                  error.nodeId ? 'cursor-pointer hover:bg-red-100' : ''
                }`}
                data-testid={`error-item-${index}`}
              >
                <p className='text-red-800 font-medium'>{error.message}</p>
                {error.nodeName && (
                  <p className='text-red-600 text-xs mt-1'>Node: {error.nodeName}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {hasWarnings && (
          <div className='space-y-2'>
            <div className='flex items-center gap-2 mb-2'>
              <AlertTriangle className='w-4 h-4 text-yellow-600' />
              <h4 className='text-sm font-semibold text-yellow-600'>
                Warnings ({warnings.length})
              </h4>
            </div>
            {warnings.map((warning, index) => (
              <div
                key={`warning-${index}`}
                onClick={() => warning.nodeId && onErrorClick(warning.nodeId)}
                className={`p-3 bg-yellow-50 border border-yellow-200 rounded text-sm ${
                  warning.nodeId ? 'cursor-pointer hover:bg-yellow-100' : ''
                }`}
                data-testid={`warning-item-${index}`}
              >
                <p className='text-yellow-800 font-medium'>{warning.message}</p>
                {warning.nodeName && (
                  <p className='text-yellow-600 text-xs mt-1'>Node: {warning.nodeName}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200'>
        <p className='text-xs text-gray-600'>
          {hasErrors
            ? 'Fix all errors before saving or publishing your workflow.'
            : 'These warnings are optional but recommended for best practices.'}
        </p>
      </div>
    </div>
  );
};
