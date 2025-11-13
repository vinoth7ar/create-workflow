import { useState, useMemo, useCallback } from 'react';
import { ValidationError, ValidationResult } from '@/utils/workflowValidation';

/**
 * Grouped validation errors by node
 */
export interface NodeValidationGroup {
  nodeId: string | null;
  nodeName: string;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Hook to manage validation error navigation and display
 */
export const useValidationFeedback = (validationResult: ValidationResult | null) => {
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

  // Group errors and warnings by node
  const nodeGroups = useMemo(() => {
    if (!validationResult) return [];

    const allIssues = [...validationResult.errors, ...validationResult.warnings];
    const groupMap = new Map<string | null, NodeValidationGroup>();

    allIssues.forEach((issue) => {
      const key = issue.nodeId || null;
      
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          nodeId: key,
          nodeName: issue.nodeName || 'Workflow',
          errors: [],
          warnings: [],
        });
      }

      const group = groupMap.get(key)!;
      if (issue.severity === 'ERROR') {
        group.errors.push(issue);
      } else if (issue.severity === 'WARNING') {
        group.warnings.push(issue);
      }
    });

    // Convert to array and sort: workflow-level first, then by node name
    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.nodeId === null) return -1;
      if (b.nodeId === null) return 1;
      return a.nodeName.localeCompare(b.nodeName);
    });
  }, [validationResult]);

  // Filter to only nodes with errors (not just warnings)
  const errorGroups = useMemo(() => {
    return nodeGroups.filter((group) => group.errors.length > 0);
  }, [nodeGroups]);

  // Get current error group
  const currentGroup = useMemo(() => {
    if (errorGroups.length === 0) return null;
    const safeIndex = Math.min(currentErrorIndex, errorGroups.length - 1);
    return errorGroups[safeIndex];
  }, [errorGroups, currentErrorIndex]);

  // Get first error message for current group
  const currentErrorMessage = useMemo(() => {
    if (!currentGroup || currentGroup.errors.length === 0) return null;
    return currentGroup.errors[0].message;
  }, [currentGroup]);

  // Navigation helpers
  const goToNext = useCallback(() => {
    if (errorGroups.length === 0) return;
    setCurrentErrorIndex((prev) => (prev + 1) % errorGroups.length);
  }, [errorGroups.length]);

  const goToPrevious = useCallback(() => {
    if (errorGroups.length === 0) return;
    setCurrentErrorIndex((prev) => (prev - 1 + errorGroups.length) % errorGroups.length);
  }, [errorGroups.length]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < errorGroups.length) {
      setCurrentErrorIndex(index);
    }
  }, [errorGroups.length]);

  const reset = useCallback(() => {
    setCurrentErrorIndex(0);
  }, []);

  // Check if node has errors
  const hasNodeErrors = useCallback(
    (nodeId: string) => {
      return nodeGroups.some((group) => group.nodeId === nodeId && group.errors.length > 0);
    },
    [nodeGroups]
  );

  // Check if node has warnings
  const hasNodeWarnings = useCallback(
    (nodeId: string) => {
      return nodeGroups.some((group) => group.nodeId === nodeId && group.warnings.length > 0);
    },
    [nodeGroups]
  );

  return {
    // State
    nodeGroups,
    errorGroups,
    currentGroup,
    currentErrorIndex,
    currentErrorMessage,
    totalErrors: errorGroups.length,
    hasErrors: errorGroups.length > 0,
    hasWarnings: nodeGroups.some((g) => g.warnings.length > 0),

    // Navigation
    goToNext,
    goToPrevious,
    goToIndex,
    reset,

    // Helpers
    hasNodeErrors,
    hasNodeWarnings,
  };
};
