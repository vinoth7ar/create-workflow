import { Handle, Position } from '@xyflow/react';
import { NODE_TYPES } from '@/models/singleView/nodeTypes';

type StartNodeEditProps = {
  data: { label: string; showGhostEdge: boolean };
  id: string;
};

const StartNodeEdit: React.FC<StartNodeEditProps> = ({ id, data }) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('addConnectedNode', {
        detail: { sourceId: id, nodeType: NODE_TYPES.EVENT },
      })
    );
  };

  return (
    <div className='flex items-center'>
      <div className='relative w-24 h-24 bg-[#DEEECD] rounded-full border border-gray-400 flex items-center justify-center'>
        <div className='text-xs font-semibold text-gray-800 text-center px-1'>{data.label}</div>
        {/* No target handle bc Start Node can only be a source node */}
        <Handle
          type='source'
          position={Position.Right}
          className='absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-gray-400'
        />
      </div>
      {/* show a ghost edge (edge w/o a target node) at the start node, ghost edge will disappear once a new node is connected */}
      {data.showGhostEdge && <span className='w-20 border-b border-gray-400' />}
      <button
        className={`w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center transition-all shadow-md ${
          data.showGhostEdge
            ? 'hover:bg-gray-500'
            : 'opacity-0 hover:opacity-100 hover:bg-gray-500'
        }`}
        onClick={handlePlusClick}
        title='Add Transition Block'
      >
        <span className='text-sm font-bold'>+</span>
      </button>
    </div>
  );
};

export default StartNodeEdit;
