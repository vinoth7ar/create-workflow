import { Handle, Position } from '@xyflow/react';
import { NODE_TYPES } from '@/models/singleView/nodeTypes';

type StatusNodeEditProps = {
  data: {
    label: string;
    description?: string;
    isConnecting?: boolean;
    connectionSourceType?: string;
  };
  selected: boolean;
  id: string;
};

const StatusNodeEdit = ({ data, selected, id }: StatusNodeEditProps) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('addConnectedNode', {
        detail: { sourceId: id, nodeType: NODE_TYPES.EVENT },
      })
    );
  };

  // Determine if this node is a valid target during connection
  const isValidTarget = data.isConnecting && data.connectionSourceType === NODE_TYPES.EVENT;

  return (
    <div className='group relative'>
      <div
        className={`w-24 h-24 rounded-full border flex items-center justify-center shadow-sm transition-all ${
          selected
            ? 'border-gray-800 bg-white ring-4 ring-yellow-200 shadow-md'
            : 'border-gray-400 bg-gray-50'
        }`}
      >
        {/* Target handle - receives connections from Event nodes */}
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
        <div className='text-xs font-medium text-gray-800 text-center px-1'>{data.label}</div>

        {/* Source handle - connects to Event nodes */}
        <Handle
          type='source'
          position={Position.Right}
          className='w-2 h-2 bg-gray-400 border-gray-500'
        />
      </div>
      <button
        className='absolute -right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center transition-all shadow-md'
        onClick={handlePlusClick}
        title='Add Transition Block'
      >
        <span className='text-sm font-bold'>+</span>
      </button>
    </div>
  );
};

export default StatusNodeEdit;
