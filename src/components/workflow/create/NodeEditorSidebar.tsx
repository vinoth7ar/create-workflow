import { Node } from '@xyflow/react';
import { HierarchicalSelect, HierarchicalOption } from '@/components/ui/hierarchical-select';
import { HierarchicalMultiSelect } from '@/components/ui/hierarchical-multi-select';

const businessEventOptions: HierarchicalOption[] = [
  {
    value: 'pmf-stage',
    label: 'PMF: Stage',
    children: [
      { value: 'pmf-stage-flume', label: 'Stage FLUME commitment data in PMF 31/240 database' },
      { value: 'pmf-stage-validate', label: 'Stage and validate PMF data' },
    ]
  },
  {
    value: 'oasis',
    label: 'OASIS',
    children: [
      { value: 'oasis-request', label: 'OASIS Request' },
      { value: 'oasis-response', label: 'OASIS Response' },
    ]
  },
];

const entityOptions: HierarchicalOption[] = [
  {
    value: 'loan',
    label: 'Loan',
    children: [
      { value: 'loan-commitment', label: 'Loan Commitment' },
      { value: 'loan-application', label: 'Loan Application' },
    ]
  },
  {
    value: 'borrower',
    label: 'Borrower',
    children: [
      { value: 'borrower-profile', label: 'Borrower Profile' },
      { value: 'borrower-documents', label: 'Borrower Documents' },
    ]
  },
];

const multiSelectEntityOptions: HierarchicalOption[] = [
  {
    value: 'select-all',
    label: 'Select All',
  },
  {
    value: 'loan',
    label: 'Loan',
    children: [
      { value: 'loan-commitment', label: 'Loan Commitment' },
      { value: 'loan-application', label: 'Loan Application' },
      { value: 'loan-approval', label: 'Loan Approval' },
    ]
  },
  {
    value: 'borrower',
    label: 'Borrower',
    children: [
      { value: 'borrower-profile', label: 'Borrower Profile' },
      { value: 'borrower-documents', label: 'Borrower Documents' },
      { value: 'borrower-credit', label: 'Borrower Credit' },
    ]
  },
  {
    value: 'entities',
    label: 'Entities',
    children: [
      { value: 'name-name', label: 'name_name description' },
      { value: 'entity-1', label: 'Entity 1 description' },
      { value: 'entity-2', label: 'Entity 2 description' },
    ]
  },
];

interface NodeEditorSidebarProps {
  selectedNode: Node | null;
  businessEvent: string;
  condition: string;
  automaticTrigger: boolean;
  externalTrigger: boolean;
  focalEntity: string;
  createdEntities: string[];
  modifiedEntities: string[];
  onBusinessEventChange: (value: string, label?: string) => void;
  onConditionChange: (value: string, label?: string) => void;
  onAutomaticTriggerChange: (checked: boolean) => void;
  onExternalTriggerChange: (checked: boolean) => void;
  onFocalEntityChange: (value: string, label?: string) => void;
  onCreatedEntitiesChange: (values: string[]) => void;
  onModifiedEntitiesChange: (values: string[]) => void;
  onCreateNew?: () => void;
  onDelete: () => void;
  onDone: () => void;
}

export const NodeEditorSidebar = ({
  selectedNode,
  businessEvent,
  condition,
  focalEntity,
  createdEntities,
  modifiedEntities,
  onBusinessEventChange,
  onConditionChange,
  onFocalEntityChange,
  onCreatedEntitiesChange,
  onModifiedEntitiesChange,
  onCreateNew,
  onDelete,
  onDone
}: NodeEditorSidebarProps) => {
  if (!selectedNode) return null;

  const isTransitionBlock = selectedNode.type === 'event';
  const isStateNode = selectedNode.type === 'state';

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
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Business Event Name
              </label>
              <input
                type="text"
                value={businessEvent}
                onChange={(e) => onBusinessEventChange(e.target.value, e.target.value)}
                placeholder="Stage"
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500"
                data-testid="input-business-event-name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Focal Entity</label>
              <HierarchicalSelect
                options={entityOptions}
                value={focalEntity}
                onChange={(value, label) => onFocalEntityChange(value, label)}
                placeholder="Select focal entity"
                onCreateNew={onCreateNew}
                data-testid="select-focal-entity"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Description</label>
              <textarea
                value={condition}
                onChange={(e) => onConditionChange(e.target.value, e.target.value)}
                placeholder="Enter description"
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500 resize-none"
                data-testid="textarea-description"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Created Entities</label>
              <HierarchicalMultiSelect
                options={multiSelectEntityOptions}
                value={createdEntities}
                onChange={onCreatedEntitiesChange}
                placeholder="Select created entities"
                onCreateNew={onCreateNew}
                data-testid="select-created-entities"
              />
              <button
                onClick={onCreateNew}
                className="text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
                data-testid="button-advanced-select-created"
              >
                Advanced Select
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Modified Entities</label>
              <HierarchicalMultiSelect
                options={multiSelectEntityOptions}
                value={modifiedEntities}
                onChange={onModifiedEntitiesChange}
                placeholder="Select modified entities"
                onCreateNew={onCreateNew}
                data-testid="select-modified-entities"
              />
              <button
                onClick={onCreateNew}
                className="text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
                data-testid="button-advanced-select-modified"
              >
                Advanced Select
              </button>
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
        {isTransitionBlock ? (
          <div className="flex gap-3">
            <button
              onClick={onDone}
              className="flex-1 px-6 py-3 border border-gray-500 rounded-full text-white hover:bg-gray-700 transition-colors"
              data-testid="button-previous"
            >
              Previous
            </button>
            <button
              onClick={onDone}
              className="flex-1 px-6 py-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
              data-testid="button-next"
            >
              Next
            </button>
          </div>
        ) : (
          <button
            onClick={onDone}
            className="w-full px-6 py-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
            data-testid="button-done"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};
