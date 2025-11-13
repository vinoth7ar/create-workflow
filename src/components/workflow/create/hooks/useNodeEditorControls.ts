import { useState, useRef, useCallback } from 'react';

/**
 * MODULAR HOOK: Node Editor Sidebar Controls
 * Manages collapse state, drag positioning, and focus mode for the node editor sidebar.
 * Can be copy-pasted to other repos for similar functionality.
 */
export const useNodeEditorControls = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);

      // If this is the first drag (position is {0, 0}), calculate from the element's current position
      if (position.x === 0 && position.y === 0) {
        const target = e.currentTarget as HTMLElement;
        const sidebar = target.closest('[class*="bg-gray-800"]') as HTMLElement;
        if (sidebar) {
          const rect = sidebar.getBoundingClientRect();
          dragStartPos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          // Set initial position to prevent jump
          setPosition({
            x: rect.left,
            y: rect.top,
          });
          return;
        }
      }

      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position]
  );

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y,
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isCollapsed,
    isFocusMode,
    isDragging,
    position,
    toggleCollapse,
    toggleFocusMode,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
