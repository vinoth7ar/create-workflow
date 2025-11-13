/**
 * MODULAR HOOK: Sidebar Collapse State Management
 * Copy-paste this hook to manage sidebar collapse/expand functionality
 */

import { useState, useCallback } from 'react';

export interface SidebarCollapseState {
  isCollapsed: boolean;
  isDragEnabled: boolean;
  isFocusMode: boolean;
}

export const useSidebarCollapse = () => {
  const [state, setState] = useState<SidebarCollapseState>({
    isCollapsed: false,
    isDragEnabled: true,
    isFocusMode: false,
  });

  const toggleCollapse = useCallback(() => {
    setState((prev) => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  const toggleDragEnabled = useCallback(() => {
    setState((prev) => ({ ...prev, isDragEnabled: !prev.isDragEnabled }));
  }, []);

  const toggleFocusMode = useCallback(() => {
    setState((prev) => ({ ...prev, isFocusMode: !prev.isFocusMode }));
  }, []);

  const setFocusMode = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isFocusMode: value }));
  }, []);

  return {
    isCollapsed: state.isCollapsed,
    isDragEnabled: state.isDragEnabled,
    isFocusMode: state.isFocusMode,
    toggleCollapse,
    toggleDragEnabled,
    toggleFocusMode,
    setFocusMode,
  };
};
