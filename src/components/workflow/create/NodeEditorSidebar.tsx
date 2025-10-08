import { useState } from 'react';
import { Node } from '@xyflow/react';
import { HierarchicalSelect, HierarchicalOption } from '@/components/ui/hierarchical-select';
import { HierarchicalMultiSelect } from '@/components/ui/hierarchical-multi-select';

const businessEventOptions: HierarchicalOption[] = [
  { value: 'create-new', label: '+ Create New' },
  {
    value: 'applications',
    label: 'Applications',
    children: [
      {
        value: 'pmf',
        label: 'PMF',
        children: [
          { value: 'pmf-stage-flume', label: 'Stage FLUME stages commitment data in PMF database' },
          { value: 'pmf-event-1', label: 'Event description' },
        ]
      },
      {
        value: 'lsa',
        label: 'LSA',
        children: [
          { value: 'lsa-event-1', label: 'LSA event description' },
        ]
      },
      {
        value: 'cpa',
        label: 'CPA',
        children: [
          { value: 'cpa-event-1', label: 'CPA event description' },
        ]
      },
      {
        value: 'application-c-i',
        label: 'Application C-I',
        children: [
          { value: 'c-i-event-1', label: 'C-I event description' },
        ]
      },
    ]
  },
];

const entityOptions: HierarchicalOption[] = [
  { value: 'create-new', label: '+ Create New' },
  {
    value: 'loan-entities',
    label: 'Loan Entities',
    children: [
      { value: 'loan-commitment', label: 'Loan Commitment description' },
      { value: 'loan-application', label: 'Loan Application description' },
    ]
  },
  {
    value: 'other-entities',
    label: 'Other Entities',
    children: [
      { value: 'name-name', label: 'name_name description' },
      { value: 'entity-1', label: 'Entity 1 description' },
      { value: 'entity-2', label: 'Entity 2 description' },
    ]
  },
];

const multiSelectEntityOptions: HierarchicalOption[] = [
  { value: 'select-all', label: 'Select All' },
  { value: 'create-new', label: '+ Create New' },
  {
    value: 'loan-entities',
    label: 'Loan Entities',
    children: [
      { value: 'loan-commitment', label: 'Loan Commitment description' },
      { value: 'loan-application', label: 'Loan Application description' },
    ]
  },
  {
    value: 'other-entities',
    label: 'Other Entities',
    children: [
      { value: 'name-name', label: 'name_name description' },
      { value: 'entity-1', label: 'Entity 1 description' },
      { value: 'entity-2', label: 'Entity 2 description' },
    ]
  },
];

const conditionOptions: HierarchicalOption[] = [
  {
    value: 'all-of',
    label: 'All Of (All events occur to transition states)',
  },
  {
    value: 'one-of',
    label: 'One Of (One event must occur to transition states)',
  },
  {
    value: 'none',
    label: 'None (Neither option above applies)',
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

enum WizardStep {
  BUSINESS_EVENTS = 0,
  CONDITION = 1,
  TRIGGERS = 2,
  ENTITIES = 3
}

const TOTAL_STEPS = 4;

export const NodeEditorSidebar = ({
  selectedNode,
  businessEvent,
  condition,
  automaticTrigger,
  externalTrigger,
  focalEntity,
  createdEntities,
  modifiedEntities,
  onBusinessEventChange,
  onConditionChange,
  onAutomaticTriggerChange,
  onExternalTriggerChange,
  onFocalEntityChange,
  onCreatedEntitiesChange,
  onModifiedEntitiesChange,
  onCreateNew,
  onDelete,
  onDone
}: NodeEditorSidebarProps) => {
  const [currentStep, setCurrentStep] = useState(WizardStep.BUSINESS_EVENTS);

  if (!selectedNode) return null;

  const isTransitionBlock = selectedNode.type === 'event';
  const isStateNode = selectedNode.type === 'state';

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDone = () => {
    setCurrentStep(WizardStep.BUSINESS_EVENTS);
    onDone();
  };


  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

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
            {currentStep === WizardStep.BUSINESS_EVENTS && (
              <div>
                <label className="text-sm font-medium text-white mb-3 block">
                  Business Event(s) and/or Subworkflow(s)
                </label>
                <HierarchicalSelect
                  options={businessEventOptions}
                  value={businessEvent}
                  onChange={(value, label) => onBusinessEventChange(value, label)}
                  placeholder="Select business events and/or subworkflows"
                  onCreateNew={onCreateNew}
                />
              </div>
            )}

            {currentStep === WizardStep.CONDITION && (
              <div>
                <label className="text-sm font-medium text-white mb-3 block">Condition</label>
                <HierarchicalSelect
                  options={conditionOptions}
                  value={condition}
                  onChange={(value, label) => onConditionChange(value, label)}
                  placeholder="Select condition"
                  data-testid="select-condition"
                />
              </div>
            )}

            {currentStep === WizardStep.TRIGGERS && (
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
            )}

            {currentStep === WizardStep.ENTITIES && (
              <>
                <div>
                  <label className="text-sm font-medium text-white mb-3 block">Focal Entity</label>
                  <HierarchicalSelect
                    options={entityOptions}
                    value={focalEntity}
                    onChange={(value, label) => onFocalEntityChange(value, label)}
                    placeholder="Select focal entity"
                    onCreateNew={onCreateNew}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-3 block">Created Entities</label>
                  <HierarchicalMultiSelect
                    options={multiSelectEntityOptions}
                    value={createdEntities}
                    onChange={onCreatedEntitiesChange}
                    placeholder="Select created entities"
                    onCreateNew={onCreateNew}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-3 block">Modified Entities</label>
                  <HierarchicalMultiSelect
                    options={multiSelectEntityOptions}
                    value={modifiedEntities}
                    onChange={onModifiedEntitiesChange}
                    placeholder="Select modified entities"
                    onCreateNew={onCreateNew}
                  />
                </div>
              </>
            )}
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
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-500"
                data-testid="button-previous"
              >
                Previous
              </button>
            )}
            {!isLastStep ? (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                data-testid="button-next"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleDone}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                data-testid="button-done"
              >
                Done
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleDone}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            data-testid="button-done"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};
