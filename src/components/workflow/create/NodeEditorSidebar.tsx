import { Node } from '@xyflow/react';

interface NodeEditorSidebarProps {
  selectedNode: Node | null;
  businessEvent: string;
  condition: string;
  automaticTrigger: boolean;
  externalTrigger: boolean;
  onBusinessEventChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onAutomaticTriggerChange: (checked: boolean) => void;
  onExternalTriggerChange: (checked: boolean) => void;
  onDelete: () => void;
  onDone: () => void;
}

export const NodeEditorSidebar = ({
  selectedNode,
  businessEvent,
  condition,
  automaticTrigger,
  externalTrigger,
  onBusinessEventChange,
  onConditionChange,
  onAutomaticTriggerChange,
  onExternalTriggerChange,
  onDelete,
  onDone
}: NodeEditorSidebarProps) => {
  if (!selectedNode) return null;

  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col shadow-2xl">
      <div className="p-4 border-b border-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-white">⌃</div>
          <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <button 
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Delete Node"
          data-testid="button-delete-node"
        >
          🗑
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <label className="text-sm font-medium text-white mb-3 block">
            Business Event(s) and/or Subworkflow(s)
          </label>
          <select 
            value={businessEvent}
            onChange={(e) => onBusinessEventChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white"
            data-testid="select-business-event"
          >
            <option>Select business events and/or subworkflows</option>
            <option>Stage</option>
            <option>Approve</option>
            <option>Reject</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-3 block">Condition</label>
          <select 
            value={condition}
            onChange={(e) => onConditionChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white"
            data-testid="select-condition"
          >
            <option>Select condition</option>
            <option>None</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-3 block">Trigger</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={automaticTrigger}
                onChange={(e) => onAutomaticTriggerChange(e.target.checked)}
                className="w-4 h-4"
                data-testid="checkbox-automatic-trigger"
              />
              <span className="text-white">Automatic</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={externalTrigger}
                onChange={(e) => onExternalTriggerChange(e.target.checked)}
                className="w-4 h-4"
                data-testid="checkbox-external-trigger"
              />
              <span className="text-white">External</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-600">
        <button
          onClick={onDone}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          data-testid="button-done"
        >
          Done
        </button>
      </div>
    </div>
  );
};
