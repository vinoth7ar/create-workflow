import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { NodeValidationGroup } from '../hooks/useValidationFeedback';

interface ValidationErrorBannerProps {
  currentGroup: NodeValidationGroup | null;
  currentIndex: number;
  totalErrors: number;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  onNavigateToIndex: (index: number) => void;
  onDismiss: () => void;
  errorMessage: string | null;
}

export const ValidationErrorBanner = ({
  currentGroup,
  currentIndex,
  totalErrors,
  onNavigateNext,
  onNavigatePrevious,
  onNavigateToIndex,
  onDismiss,
  errorMessage,
}: ValidationErrorBannerProps) => {
  if (!currentGroup || !errorMessage) return null;

  const hasErrors = currentGroup.errors.length > 0;
  const hasWarnings = currentGroup.warnings.length > 0;
  const bgColor = hasErrors ? 'bg-red-50 dark:bg-red-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20';
  const textColor = hasErrors ? 'text-red-900 dark:text-red-100' : 'text-yellow-900 dark:text-yellow-100';
  const borderColor = hasErrors ? 'border-red-200 dark:border-red-800' : 'border-yellow-200 dark:border-yellow-800';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${bgColor} ${borderColor} border-b px-4 py-3 shadow-md`}
      data-testid="validation-error-banner"
    >
      <div className="flex items-center justify-between gap-4 max-w-full">
        {/* Error Message & Navigation */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Navigation Buttons */}
          {totalErrors > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${textColor} hover:bg-white/50 dark:hover:bg-black/50`}
                onClick={onNavigatePrevious}
                data-testid="button-previous-error"
                aria-label="Previous error"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${textColor} hover:bg-white/50 dark:hover:bg-black/50`}
                onClick={onNavigateNext}
                data-testid="button-next-error"
                aria-label="Next error"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Error Message */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`text-sm font-medium ${textColor} truncate`} data-testid="text-error-message">
              {errorMessage}
            </span>

            {/* Info Icon with Popup */}
            {(currentGroup.errors.length > 1 || currentGroup.warnings.length > 0) && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 ${textColor} hover:bg-white/50 dark:hover:bg-black/50 flex-shrink-0`}
                    data-testid="button-info-icon"
                    aria-label="View all issues"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-96 max-h-96 overflow-y-auto"
                  data-testid="popup-all-errors"
                >
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">All Issues for {currentGroup.nodeName}</h4>
                    
                    {currentGroup.errors.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                          Errors ({currentGroup.errors.length})
                        </p>
                        <ul className="space-y-1 text-xs">
                          {currentGroup.errors.map((error, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              • {error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentGroup.warnings.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                          Warnings ({currentGroup.warnings.length})
                        </p>
                        <ul className="space-y-1 text-xs">
                          {currentGroup.warnings.map((warning, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              • {warning.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        </div>

        {/* Progress & Dismiss */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Progress Indicator */}
          {totalErrors > 1 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalErrors, 10) }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToIndex(idx)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? hasErrors
                        ? 'bg-red-600 dark:bg-red-400'
                        : 'bg-yellow-600 dark:bg-yellow-400'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  data-testid={`dot-error-${idx}`}
                  aria-label={`Go to error ${idx + 1}`}
                />
              ))}
              {totalErrors > 10 && (
                <span className={`text-xs ${textColor} ml-1`}>+{totalErrors - 10}</span>
              )}
            </div>
          )}

          {/* Error Count */}
          <span className={`text-xs font-medium ${textColor} whitespace-nowrap`} data-testid="text-error-count">
            Error {currentIndex + 1} of {totalErrors}
          </span>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${textColor} hover:bg-white/50 dark:hover:bg-black/50`}
            onClick={onDismiss}
            data-testid="button-dismiss-banner"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
