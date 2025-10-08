import { Handle, Position } from '@xyflow/react';

interface NodeData {
  label: string;
  description?: string;
  isConnecting?: boolean;
  connectionNodeId?: string | null;
  connectionSourceType?: string | null;
}

interface EventNodeProps {
  data: NodeData;
  selected: boolean;
  id: string;
}

export const EventNode = ({ data, selected, id }: EventNodeProps) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('addConnectedNode', { 
      detail: { sourceId: id, nodeType: 'state' } 
    }));
  };

  const isValidTarget = data.isConnecting && 
    data.connectionNodeId !== id && 
    data.connectionSourceType === 'state';
  
  const isValidSource = data.isConnecting && 
    data.connectionNodeId === id;

  const handleClassName = data.isConnecting
    ? isValidTarget || isValidSource
      ? "w-3 h-3 !bg-green-500 border-2 border-white hover:!bg-green-600 transition-colors"
      : "w-3 h-3 !bg-gray-400 border-2 border-white transition-colors cursor-not-allowed"
    : "w-3 h-3 !bg-gray-400 border-2 border-white hover:!bg-green-500 transition-colors";

  return (
    <div className="group relative">
      <div className={`min-w-[90px] max-w-[120px] px-3 py-2 bg-white border-2 rounded shadow-sm transition-all ${
        selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300 shadow-md' : 'border-gray-300'
      }`}>
        <Handle 
          type="target" 
          position={Position.Left} 
          className={handleClassName}
        />
        <div className="text-xs font-medium text-gray-800">{data.label}</div>
        {data.description && (
          <div className="text-xs text-gray-500 mt-1">{data.description}</div>
        )}
        <Handle 
          type="source" 
          position={Position.Right} 
          className={handleClassName}
        />
      </div>
      <button 
        className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-500 shadow-md"
        onClick={handlePlusClick}
        title="Add State"
      >
        <span className="text-sm font-bold">+</span>
      </button>
    </div>
  );
};
