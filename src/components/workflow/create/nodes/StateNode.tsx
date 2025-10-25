import { Handle, Position } from '@xyflow/react';
import { FlowNode, NODE_TYPES } from '@/models/singleView/nodeTypes';

type StateNodeProps = {
  data: { label: string; description: string };
  selected: boolean;
  id: string;
};

const StateNode = ({ data, selected, id }: StateNodeProps) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('addConnectedNode', {
        detail: { sourceId: id, nodeType: NODE_TYPES.EVENT },
      })
    );
  };

  return (
    <div className='group relative'>
      <div
        className={`w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-sm transition-all ${
          selected
            ? 'border-blue-500 bg-white ring-4 ring-[lightblue] shadow-md'
            : 'border-gray-400 bg-gray-50'
        }`}
      >
        <Handle
          type='target'
          position={Position.Left}
          className='w-2 h-2'
          isValidConnection={(connection) => {
            const sourceNode = connection.sourceNode as FlowNode | undefined;
            return sourceNode?.type === NODE_TYPES.EVENT;
          }}
        />
        <div className='text-xs font-medium text-gray-800 text-center px-1'>{data.label}</div>
        <Handle
          type='source'
          position={Position.Right}
          className='w-2 h-2'
          isValidConnection={(connection) => {
            const targetNode = connection.targetNode as FlowNode | undefined;
            return targetNode?.type === NODE_TYPES.EVENT;
          }}
        />
      </div>
      <button
        className='absolute -right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-500 shadow-md'
        onClick={handlePlusClick}
        title='Add Transition Block'
      >
        <span className='text-sm font-bold'>+</span>
      </button>
    </div>
  );
};

export default StateNode;
