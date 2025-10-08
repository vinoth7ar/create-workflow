import { Handle, Position } from '@xyflow/react';

interface NodeData {
  label: string;
  description?: string;
}

interface StateNodeProps {
  data: NodeData;
  selected: boolean;
  id: string;
}

export const StateNode = ({ data, selected, id }: StateNodeProps) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('addConnectedNode', { 
      detail: { sourceId: id, nodeType: 'event' } 
    }));
  };

  return (
    <div className="group relative">
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm transition-all ${
        selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300 shadow-md' : 'border-gray-400 bg-gray-50'
      }`}>
        <Handle type="target" position={Position.Left} className="w-2 h-2" />
        <div className="text-xs font-medium text-gray-800 text-center px-1">{data.label}</div>
        <Handle type="source" position={Position.Right} className="w-2 h-2" />
      </div>
      <button 
        className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-500 shadow-md"
        onClick={handlePlusClick}
        title="Add Transition Block"
      >
        <span className="text-sm font-bold">+</span>
      </button>
    </div>
  );
};
