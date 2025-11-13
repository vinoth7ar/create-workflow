/**
 * MODULAR COMPONENT: Collapsible Button Panel
 * Copy-paste this component to add sidebar controls with 3 buttons:
 * 1. Expand/Collapse sidebar
 * 2. Toggle drag and drop
 * 3. Focus mode for graph
 */

import { ChevronLeft, ChevronRight, Move, Maximize2 } from 'lucide-react';

interface CollapsibleButtonPanelProps {
  isCollapsed: boolean;
  isDragEnabled: boolean;
  isFocusMode: boolean;
  onToggleCollapse: () => void;
  onToggleDrag: () => void;
  onToggleFocus: () => void;
}

export const CollapsibleButtonPanel = ({
  isCollapsed,
  isDragEnabled,
  isFocusMode,
  onToggleCollapse,
  onToggleDrag,
  onToggleFocus,
}: CollapsibleButtonPanelProps) => {
  return (
    <div
      className={`
        fixed top-1/2 -translate-y-1/2 z-50
        flex flex-col gap-2 bg-white border border-gray-300 rounded-r-lg shadow-lg p-2
        transition-all duration-300 ease-in-out
      `}
      style={{
        left: isCollapsed ? '0' : '20rem',
      }}
      data-testid='collapsible-button-panel'
    >
      {/* Button 1: Expand/Collapse Sidebar */}
      <button
        onClick={onToggleCollapse}
        className={`
          p-2 rounded-md transition-all duration-200
          ${
            isCollapsed
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        data-testid='button-toggle-collapse'
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Button 2: Toggle Drag and Drop */}
      <button
        onClick={onToggleDrag}
        className={`
          p-2 rounded-md transition-all duration-200
          ${
            isDragEnabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
          }
        `}
        title={isDragEnabled ? 'Disable Drag & Drop' : 'Enable Drag & Drop'}
        data-testid='button-toggle-drag'
      >
        <Move size={20} />
      </button>

      {/* Button 3: Focus Mode for Graph */}
      <button
        onClick={onToggleFocus}
        className={`
          p-2 rounded-md transition-all duration-200
          ${
            isFocusMode
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
        title={isFocusMode ? 'Exit Focus Mode' : 'Focus on Graph'}
        data-testid='button-toggle-focus'
      >
        <Maximize2 size={20} />
      </button>
    </div>
  );
};
