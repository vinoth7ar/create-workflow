import { ReactFlow, Background, Controls, BackgroundVariant, ReactFlowProvider, Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  highlightedElements: { nodeId?: string; nodeIds?: string[]; edgeIds: string[] };
  nodeTypes: NodeTypes;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export const Canvas = ({
  nodes,
  edges,
  highlightedElements,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onDrop,
  onDragOver
}: CanvasProps) => {
  return (
    <div className="flex-1 relative">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            style: (highlightedElements.nodeId === node.id || highlightedElements.nodeIds?.includes(node.id))
              ? { ...node.style, boxShadow: '0 0 0 3px #3b82f6, 0 0 20px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s ease' }
              : { ...node.style, transition: 'all 0.3s ease' }
          }))}
          edges={edges.map(edge => ({
            ...edge,
            style: highlightedElements.edgeIds.includes(edge.id)
              ? { ...edge.style, strokeWidth: 3, stroke: '#3b82f6', opacity: 1, transition: 'all 0.3s ease' }
              : { ...edge.style, transition: 'all 0.3s ease' },
            animated: highlightedElements.edgeIds.includes(edge.id)
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          className="bg-white"
        >
          <Background variant={BackgroundVariant.Dots} color="#E5E7EB" gap={20} size={1} />
          <Controls 
            position="bottom-left"
            className="bg-white border border-gray-300 rounded shadow-sm"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};
