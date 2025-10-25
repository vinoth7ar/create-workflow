import { Handle, Position } from '@xyflow/react';
import { FlowNode, NODE_TYPES } from '@/models/singleView/nodeTypes';

type EventNodeProps = {
  data: { 
    label: string; 
    description?: string;
    isConnecting?: boolean;
    connectionSourceType?: string;
  };
  selected: boolean;
  id: string;
};

const EventNode = ({ data, selected, id }: EventNodeProps) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('addConnectedNode', {
        detail: { sourceId: id, nodeType: NODE_TYPES.STATE },
      })
    );
  };

  // Determine if this node is a valid target during connection
  const isValidTarget = data.isConnecting && 
    (data.connectionSourceType === NODE_TYPES.STATE || data.connectionSourceType === NODE_TYPES.START);

  return (
    <div className='group relative'>
      <div
        className={`w-15 h-20 inline-flex flex-col items-center justify-center gap-2 border border-[var(--Neutral-800)] bg-[var(--Primary-100)] p-3 ${
          selected
            ? 'border-blue-500 bg-white ring-4 ring-[lightblue] shadow-md'
            : 'border-gray-300'
        }`}
      >
        {/* Target handle - receives connections from State and Start nodes */}
        <Handle 
          type='target' 
          position={Position.Left} 
          className={`w-3 h-3 transition-all ${
            isValidTarget
              ? '!bg-green-500 !border-green-600'
              : data.isConnecting
              ? '!bg-gray-300 !border-gray-400 opacity-50'
              : '!bg-gray-400 !border-gray-500'
          }`}
          isValidConnection={(connection) => {
            const sourceNode = connection.sourceNode as FlowNode | undefined;
            return sourceNode?.type === NODE_TYPES.STATE || sourceNode?.type === NODE_TYPES.START;
          }}
        />
        <div className='text-xs font-medium text-gray-800'>{data.label}</div>
        {data.description && <div className='text-xs text-gray-500 mt-1'>{data.description}</div>}
        
        {/* Source handle - connects to State and Start nodes */}
        <Handle 
          type='source' 
          position={Position.Right} 
          className='w-2 h-2 !bg-gray-400 !border-gray-500'
          isValidConnection={(connection) => {
            const targetNode = connection.targetNode as FlowNode | undefined;
            return targetNode?.type === NODE_TYPES.STATE || targetNode?.type === NODE_TYPES.START;
          }}
        />
      </div>
      <button
        className='absolute -right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-500 shadow-md'
        onClick={handlePlusClick}
        title='Add State'
      >
        <span className='text-sm font-bold'>+</span>
      </button>
    </div>
  );
};

export default EventNode;
