import { Handle, Position } from '@xyflow/react';
import { NODE_TYPES } from '@/models/singleView/nodeTypes';

type EventNodeEditProps = {
  data: {
    label: string;
    description?: string;
    isConnecting?: boolean;
    connectionSourceType?: string;
  };
  selected: boolean;
  id: string;
};

const EventNodeEdit = ({ data, selected, id }: EventNodeEditProps) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('addConnectedNode', {
        detail: { sourceId: id, nodeType: NODE_TYPES.STATUS },
      })
    );
  };

  // Determine if this node is a valid target during connection
  const isValidTarget =
    data.isConnecting &&
    (data.connectionSourceType === NODE_TYPES.STATUS ||
      data.connectionSourceType === NODE_TYPES.START);

  return (
    <div className='group relative'>
      <div
        className={`w-[250px] h-24 border border-neutral-800 bg-primary-100 p-3 ${
          selected ? 'ring-4 ring-yellow-200' : 'border-gray-300'
        }`}
      >
        {/* Target handle - receives connections from State and Start nodes */}
        <Handle
          type='target'
          position={Position.Left}
          className={`w-3 h-3 transition-all ${
            isValidTarget
              ? 'bg-green-500 border-green-600'
              : data.isConnecting
                ? 'bg-gray-300 border-gray-400 opacity-50'
                : 'bg-gray-400 border-gray-500'
          }`}
        />
        <div className='text-xs font-medium text-gray-800 text-center px-1'>Transition Block</div>
        {data.label ? (
          <div className='w-full font-medium bg-white border border-neutral-600 p-1'>
            {data.label}
          </div>
        ) : (
          <p className='text-gray-500'>Add events and/or Subworkflows using the action panel</p>
        )}
      </div>

      {/* Source handle - connects to State and Start nodes */}
      <Handle
        type='source'
        position={Position.Right}
        className='w-2 h-2 bg-gray-400 border-gray-500'
      />

      <button
        className='absolute -right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center transition-all shadow-md'
        onClick={handlePlusClick}
        title='Add State'
      >
        <span className='text-sm font-bold'>+</span>
      </button>
    </div>
  );
};

export default EventNodeEdit;
