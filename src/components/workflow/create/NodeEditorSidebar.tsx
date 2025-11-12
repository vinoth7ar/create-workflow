import { HierarchicalSelect } from '@/components/ui/hierarchical-select';
import { useState, useEffect } from 'react';
import { ChevronDoubleUp, DragReorder, TrashIcon } from 'src/assets';
import { HierarchicalOption, NODE_TYPES } from 'src/models/singleView/nodeTypes';

// Tag Component for displaying selected items
const Tag = ({
  label,
  onRemove,
  testId,
}: {
  label: string;
  onRemove: () => void;
  testId: string;
}) => (
  <div
    className='inline-flex items-center gap-1 px-3 py-1 bg-[#8276A1] text-white rounded-full text-sm'
    data-testid={testId}
  >
    <span>{label}</span>
    <button
      onClick={onRemove}
      className='hover:bg-[#8276A1] rounded-full p-0.5 px-1 transition-colors text-white'
      data-testid={`${testId}-remove`}
    >
      ×
    </button>
  </div>
);

const businessEventOptions: HierarchicalOption[] = [
  {
    value: 'pmf-stage',
    label: 'PMF: Stage',
    children: [
      { value: 'pmf-stage-flume', label: 'Stage FLUME' },
      { value: 'pmf-stage-validate', label: 'Stage and validate PMF' },
    ],
  },
  {
    value: 'oasis',
    label: 'OASIS',
    children: [
      { value: 'oasis-request', label: 'OASIS Request' },
      { value: 'oasis-response', label: 'OASIS Response' },
    ],
  },
];

const conditionOptions: HierarchicalOption[] = [
  {
    value: 'all-of',
    label: 'All Of',
  },
  {
    value: 'one-of',
    label: 'One Of',
  },
  {
    value: 'none',
    label: 'None',
  },
];

const entityOptions: HierarchicalOption[] = [
  {
    value: 'loan',
    label: 'Loan',
    children: [
      { value: 'loan-commitment', label: 'Loan Commitment' },
      { value: 'loan-application', label: 'Loan Application' },
    ],
  },
  {
    value: 'borrower',
    label: 'Borrower',
    children: [
      { value: 'borrower-profile', label: 'Borrower Profile' },
      { value: 'borrower-documents', label: 'Borrower Documents' },
    ],
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
    ],
  },
  {
    value: 'borrower',
    label: 'Borrower',
    children: [
      { value: 'borrower-profile', label: 'Borrower Profile' },
      { value: 'borrower-documents', label: 'Borrower Documents' },
      { value: 'borrower-credit', label: 'Borrower Credit' },
    ],
  },
  {
    value: 'entities',
    label: 'Entities',
    children: [
      { value: 'name-name', label: 'name_name description' },
      { value: 'entity-1', label: 'Entity 1 description' },
      { value: 'entity-2', label: 'Entity 2 description' },
    ],
  },
];

interface NodeEditorSidebarProps {
  selectedNode: any | null;
  edges: any[];
  businessEvent: string;
  businessEventName: string;
  condition: string;
  description: string;
  automaticTrigger: boolean;
  externalTrigger: boolean;
  focalEntity: string;
  createdEntities: string[];
  modifiedEntities: string[];
  onBusinessEventChange: (value: string, label: string) => void;
  onBusinessEventNameChange: (value: string) => void;
  onConditionChange: (value: string, label?: string) => void;
  onDescriptionChange: (value: string) => void;
  onAutomaticTriggerChange: (checked: boolean) => void;
  onExternalTriggerChange: (checked: boolean) => void;
  onFocalEntityChange: (value: string, label?: string) => void;
  onCreatedEntitiesChange: (values: string[]) => void;
  onModifiedEntitiesChange: (values: string[]) => void;
  onCreateNew: () => void;
  onDelete: () => void;
  onDone: () => void;
}

enum WizardStep {
  TRANSITION_PANEL = 0,
  DETAILS = 1,
}

const TOTAL_STEPS = 2;

export const NodeEditorSidebar = ({
  selectedNode,
  edges,
  businessEvent,
  businessEventName,
  condition,
  description,
  automaticTrigger,
  externalTrigger,
  focalEntity,
  createdEntities,
  modifiedEntities,
  onBusinessEventChange,
  onBusinessEventNameChange,
  onConditionChange,
  onDescriptionChange,
  onAutomaticTriggerChange,
  onExternalTriggerChange,
  onFocalEntityChange,
  onCreatedEntitiesChange,
  onModifiedEntitiesChange,
  onCreateNew,
  onDelete,
  onDone,
}: NodeEditorSidebarProps) => {
  const [currentStep, setCurrentStep] = useState(WizardStep.TRANSITION_PANEL);

  // Reset wizard step when selectedNode changes
  useEffect(() => {
    setCurrentStep(WizardStep.TRANSITION_PANEL);
  }, [selectedNode?.id]);

  if (!selectedNode) return null;

  const isTransitionBlock = selectedNode.type === NODE_TYPES.EVENT;
  const isStateNode = selectedNode.type === NODE_TYPES.STATUS;

  // Check if there's a node connected after the current node
  const hasConnectedNodeAfter = edges.some((edge) => edge.source === selectedNode.id);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step, close sidebar
      setCurrentStep(WizardStep.TRANSITION_PANEL);
      onDone();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  // Determine button label: "Next" if not on last step OR on last step with connected nodes, otherwise "Done"
  const buttonLabel = isLastStep || (isLastStep && hasConnectedNodeAfter) ? 'Next' : 'Done';

  return (
    <div className='w-[21rem] bg-gray-800 text-white flex flex-col shadow-2xl'>
      <div className='p-4 border-b border-gray-600 flex items-center justify-between'>
        <ChevronDoubleUp />
        <DragReorder />

        <button className='text-gray-400 hover:text-red-500 transition-color' onClick={onDelete}>
          <TrashIcon />
        </button>
      </div>

      <div className='flex-1 p-6 space-y-6 overflow-y-auto'>
        {isTransitionBlock && (
          <>
            {currentStep === WizardStep.TRANSITION_PANEL && (
              <>
                <div>
                  <label className='text-sm font-medium text-white mb-3 block'>
                    Business Event(s) and/or Subworkflow(s)
                  </label>
                  <HierarchicalSelect
                    options={businessEventOptions}
                    value={businessEvent}
                    onChange={(value: string, label: string | undefined) => {
                      onBusinessEventChange(value, label || value);
                      onBusinessEventNameChange(label || value);
                    }}
                    placeholder="Select business event(s) and/or subworkflow(s)"
                    onCreateNew={onCreateNew}
                    data-testid='select-business-event'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-white mb-3 block'>Condition</label>
                  <HierarchicalSelect
                    options={conditionOptions}
                    value={condition}
                    onChange={(value: string, label?: string) => onConditionChange(value, label)}
                    placeholder='Select condition'
                    data-testid='select-condition'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-white mb-2 block'>Trigger</label>
                  <div className='flex items-center gap-3 text-sm'>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={automaticTrigger}
                        onChange={(e) => onAutomaticTriggerChange(e.target.checked)}
                        className='w-4 h-4'
                        data-testid='checkbox-automatic-trigger'
                      />
                      <span className='text-white'>Automatic</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={externalTrigger}
                        onChange={(e) => onExternalTriggerChange(e.target.checked)}
                        className='w-4 h-4'
                        data-testid='checkbox-external-trigger'
                      />
                      <span className='text-white'>External</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === WizardStep.DETAILS && (
              <>
                <div>
                  <label className='text-sm font-medium text-white mb-2 block'>
                    Business Event Name
                  </label>
                  <p className='bg-white rounded px-4 py-3 text-sm text-gray-500 font-semibold cursor-not-allowed'>
                    {businessEventName}
                  </p>
                </div>

                <div>
                  <label className='text-sm font-medium text-white mb-2 block'>Focal Entity</label>
                  <HierarchicalSelect
                    options={entityOptions}
                    value={focalEntity}
                    onChange={(value: string, label?: string) => onFocalEntityChange(value, label)}
                    placeholder='Select focal entity'
                    data-testid='select-focal-entity'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-white mb-2 block'>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder='Enter event description'
                    rows={4}
                    className='w-full bg-white border border-gray-600 rounded px-4 py-3 text-black placeholder:text-gray-500'
                    data-testid='textarea-description'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-white mb-2 block'>
                    Created Entities
                  </label>
                  <HierarchicalSelect
                    options={multiSelectEntityOptions}
                    value={createdEntities}
                    onChange={onCreatedEntitiesChange}
                    placeholder='Select created entities'
                    onCreateNew={onCreateNew}
                    multiple={true}
                    className='your-custom-class'
                    data-testid='select-created-entities'
                  />
                  <button
                    onClick={onCreateNew}
                    className='text-sm mt-2 underline text-[#00A9E6] hover:text-[#0891b2] transition-colors'
                    data-testid='button-advanced-select-created'
                  >
                    Advanced Select
                  </button>
                </div>

                <div>
                  <label className='text-sm font-medium text-white mb-2 block'>
                    Modified Entities
                  </label>
                  <HierarchicalSelect
                    options={multiSelectEntityOptions}
                    value={modifiedEntities}
                    onChange={onModifiedEntitiesChange}
                    placeholder='Select modified entities'
                    onCreateNew={onCreateNew}
                    multiple={true}
                    data-testid='select-modified-entities'
                  />
                  <button
                    onClick={onCreateNew}
                    className='text-sm mt-2 underline text-[#00A9E6] hover:text-[#0891b2] transition-colors'
                    data-testid='button-advanced-select-modified'
                  >
                    Advanced Select
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {isStateNode && (
          <div>
            <label className='text-sm font-medium text-white mb-3 block'>State</label>
            <div>
              <input
                type='text'
                value={businessEventName}
                onChange={(e) => {
                  onBusinessEventNameChange(e.target.value);
                }}
                placeholder='Enter state name'
                className='w-full bg-white border border-gray-600 rounded px-4 py-3 text-black'
                data-testid='input-state-name'
              />
            </div>
          </div>
        )}

        <div className='p-6'>
          {isTransitionBlock ? (
            <div className={`flex gap-3 ${isFirstStep ? 'justify-between' : 'justify-end'}`}>
              {isFirstStep && (
                <div className='flex gap-3 justify-center'>
                  {isFirstStep && (
                    <div className='flex gap-2 items-center border-r border-gray-500 pr-3 text-white'>
                      <button onClick={handlePrevious} data-testid='button-previous'>
                        <span>Previous</span>
                      </button>
                    </div>
                  )}
                  <button
                    disabled={!businessEventName}
                    onClick={handleNext}
                    className='px-6 py-2 border border-gray-500 rounded-full text-white hover:bg-gray-700 transition-colors'
                    data-testid={buttonLabel === 'Next' ? 'button-next' : 'button-done'}
                  >
                    {buttonLabel}
                  </button>
                </div>
              ) : (
                <div className='flex gap-3 justify-end'>
                  <button
                    onClick={onDone}
                    className='px-6 py-2 rounded-full text-white bg-tertiary-500 hover:bg-tertiary-600 transition-colors'
                    data-testid='button-done'
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex gap-3 justify-end'>
              <button
                onClick={onDone}
                className='px-6 py-2 rounded-full text-white bg-tertiary-500 hover:bg-tertiary-600 transition-colors'
                data-testid='button-done'
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeEditorSidebar;
