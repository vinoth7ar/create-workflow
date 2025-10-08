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

  const isTransitionBlock = selectedNode.type === 'eventNode';
  const isStateNode = selectedNode.type === 'stateNode';

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
        {isTransitionBlock && (
          <>
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
                <option value="">Select business events and/or subworkflows</option>
                <option value="create-new">+ Create New</option>
                <optgroup label="Applications">
                  <option value="pmf">PMF</option>
                  <option value="lsa">LSA</option>
                  <option value="cpa">CPA</option>
                  <option value="application-c-i">Application C-I</option>
                </optgroup>
                <optgroup label="Events">
                  <option value="stage-flume">Stage FLUME stages commitment data in PMF database</option>
                  <option value="event-generic">Event description</option>
                </optgroup>
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
                <option value="">Select condition</option>
                <option value="all-of">All Of (All events occur to transition states)</option>
                <option value="one-of">One Of (One event must occur to transition states)</option>
                <option value="none">None (Neither option above applies)</option>
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

            <div>
              <label className="text-sm font-medium text-white mb-3 block">Focal Entity</label>
              <select 
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white"
                data-testid="select-focal-entity"
              >
                <option value="">Select focal entity</option>
                <option value="create-new">+ Create New</option>
                <option value="loan-commitment">Loan Commitment description</option>
                <option value="name-name">name_name description</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-3 block">Created Entities</label>
              <select 
                multiple
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white h-24"
                data-testid="select-created-entities"
              >
                <option value="select-all">Select All</option>
                <option value="create-new">+ Create New</option>
                <option value="entity-1">Entity 1 description</option>
                <option value="entity-2">Entity 2 description</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-3 block">Modified Entities</label>
              <select 
                multiple
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white h-24"
                data-testid="select-modified-entities"
              >
                <option value="select-all">Select All</option>
                <option value="create-new">+ Create New</option>
                <option value="entity-1">Entity 1 description</option>
                <option value="entity-2">Entity 2 description</option>
              </select>
            </div>
          </>
        )}

        {isStateNode && (
          <div>
            <label className="text-sm font-medium text-white mb-3 block">State Name</label>
            <input
              type="text"
              value={String(selectedNode.data.label || '')}
              onChange={(e) => {
                onBusinessEventChange(e.target.value);
              }}
              placeholder="Enter state name"
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white"
              data-testid="input-state-name"
            />
          </div>
        )}
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
