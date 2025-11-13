import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * MODULAR COMPONENT: Focus Button
 * Displays a button to toggle focus mode (hide all sidebars and center graph).
 * Can be copy-pasted to other repos for similar functionality.
 */
interface FocusButtonProps {
  isFocusMode: boolean;
  onToggleFocus: () => void;
}

export const FocusButton = ({ isFocusMode, onToggleFocus }: FocusButtonProps) => {
  return (
    <button
      onClick={onToggleFocus}
      className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all
        ${isFocusMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}
        text-white`}
      title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
      data-testid='button-focus-mode'
    >
      {isFocusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
    </button>
  );
};
