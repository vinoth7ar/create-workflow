import { Handle, Position } from '@xyflow/react';
import { FlowNode, NODE_TYPES } from '@/models/singleView/nodeTypes';

type StartNodeProps = {
  data: { 
    label: string; 
    showGhostEdge: boolean;
    isConnecting?: boolean;
    connectionSourceType?: string;
  };
  selected?: boolean;
  id: string;
};

const StartNode = ({ id, data, selected }: StartNodeProps) => {
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
    <div className="group relative flex items-center">
      <div className='relative w-20 h-20 rounded-full border-2 border-gray-400 bg-gray-50 flex items-center justify-center shadow-sm transition-all'>
        <div className="text-xs font-medium text-gray-800 text-center px-1">{data.label}</div>
        
        {/* Target handle - receives connections from Event nodes */}
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
        />
        
        {/* Source handle - connects to Event nodes */}
        <Handle
          type='source'
          position={Position.Right}
          className='w-2 h-2 !bg-gray-400 !border-gray-500'
        />
      </div>
      
      {/* Ghost edge indicator - shown when start node has no connections */}
      {data.showGhostEdge && (
        <div className="absolute left-full ml-1 flex items-center pointer-events-none">
          <svg width="100" height="2" className="opacity-40">
            <line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
          <div className="w-3 h-3 rounded-full border-2 border-gray-400 bg-gray-200 -ml-1" />
        </div>
      )}
      
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

export default StartNode;
