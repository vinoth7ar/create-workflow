interface SidebarProps {
  workflowName: string;
  workflowDescription: string;
  autoPositioning: boolean;
  onWorkflowNameChange: (value: string) => void;
  onWorkflowDescriptionChange: (value: string) => void;
  onAutoPositioningChange: (value: boolean) => void;
  onDragStart: (e: React.DragEvent, nodeType: string) => void;
  onSaveDraft: () => void;
  onPublishDraft: () => void;
}

export const Sidebar = ({
  workflowName,
  workflowDescription,
  autoPositioning,
  onWorkflowNameChange,
  onWorkflowDescriptionChange,
  onAutoPositioningChange,
  onDragStart,
  onSaveDraft,
  onPublishDraft
}: SidebarProps) => {
  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-300">
        <button className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <span className="text-sm">← Back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Application</h1>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">
            Workflow Name
          </label>
          <input
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded"
            data-testid="input-workflow-name"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">
            Workflow Description
          </label>
          <div className="relative">
            <textarea
              value={workflowDescription}
              onChange={(e) => onWorkflowDescriptionChange(e.target.value)}
              placeholder="Enter workflow description"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded resize-none"
              rows={4}
              maxLength={240}
              data-testid="input-workflow-description"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {workflowDescription.length}/240
            </div>
          </div>
        </div>
      </div>

      {/* Component Palette */}
      <div className="p-4 flex-1">
        <p className="text-sm text-gray-600 mb-4">
          Drag components below onto the canvas and connect them together to build your workflow.
        </p>

        <div className="space-y-3">
          <div
            className="flex items-center gap-3 p-3 bg-gray-100 rounded border border-gray-300 cursor-move hover:bg-gray-200"
            draggable
            onDragStart={(e) => onDragStart(e, 'event')}
            data-testid="palette-transition-block"
          >
            <div className="w-5 h-4 bg-gray-400 rounded flex items-center justify-center">
              <div className="w-3 h-2 bg-gray-600 rounded-sm"></div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-gray-900">Transition Block</div>
              <div className="text-xs text-gray-500">Includes business events</div>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-3 bg-gray-100 rounded border border-gray-300 cursor-move hover:bg-gray-200"
            draggable
            onDragStart={(e) => onDragStart(e, 'state')}
            data-testid="palette-state"
          >
            <div className="w-5 h-4 bg-gray-400 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-gray-900">State</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <span className="text-sm font-bold text-gray-700">Auto-positioning</span>
          <button
            onClick={() => onAutoPositioningChange(!autoPositioning)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoPositioning ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            data-testid="toggle-auto-positioning"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoPositioning ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-300 flex gap-2">
        <button 
          onClick={onSaveDraft}
          className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50"
          data-testid="button-save-draft"
        >
          Save Draft
        </button>
        <button 
          onClick={onPublishDraft}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          data-testid="button-publish-draft"
        >
          Publish Draft
        </button>
      </div>
    </div>
  );
};
