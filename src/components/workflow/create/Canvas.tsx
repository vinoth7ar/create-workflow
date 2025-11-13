import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Connection, Edge, FlowNode, NODE_TYPES } from '@/models/singleView/nodeTypes';
import './CreateWorkflow.scss';
import { useEffect, useImperativeHandle, forwardRef } from 'react';
// MODULAR IMPORT: Focus mode utility
import { applyFocusMode, getFocusModeClasses } from './utils/focusModeUtils';

interface CanvasProps {
  nodes: FlowNode[];
  edges: Edge[];
  highlightedElements: {
    nodeId?: string;
    nodeIds?: string[];
    edgeIds: string[];
  };
  errorNodeIds?: Set<string>;
  nodeTypes: any;
  autoPositioning: boolean;
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onConnectStart: (event: React.MouseEvent, params: { nodeId: string | null }) => void;
  onConnectEnd: (event: React.MouseEvent) => void;
  onNodeClick: (event: React.MouseEvent, node: FlowNode) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onNodeAdded?: () => void;
  // MODULAR PROPS: New focus mode and drag toggle
  isFocusMode?: boolean;
  isDragEnabled?: boolean;
}

export interface CanvasRef {
  centerView: (nodeId?: string) => void;
  maximizeCanvas: () => void;
}

const FlowCanvas = forwardRef<CanvasRef, CanvasProps>(
  (
    {
      nodes,
      edges,
      highlightedElements,
      errorNodeIds = new Set(),
      nodeTypes,
      autoPositioning,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onConnectStart,
      onConnectEnd,
      onNodeClick,
      onEdgeClick,
      onPaneClick,
      onDrop,
      onDragOver,
      onNodeAdded,
      // MODULAR PROPS: New focus mode and drag toggle
      isFocusMode = false,
      isDragEnabled = true,
    },
    ref
  ) => {
    const { fitView, getNode } = useReactFlow();
    const reactFlowInstance = useReactFlow();

    useImperativeHandle(ref, () => ({
      centerView: (nodeId?: string) => {
        if (nodeId) {
          // Center and zoom on specific node using fitView
          const node = getNode(nodeId);
          if (node) {
            fitView({
              nodes: [node],
              padding: 0.3,
              minZoom: 1.2,
              maxZoom: 1.2,
              duration: 300,
            });
          }
        } else {
          // Fit all nodes in view
          fitView({ padding: 0.2, duration: 300 });
        }
      },
      maximizeCanvas: () => {
        // Maximize the canvas by fitting all nodes with minimal padding for optimal space usage
        fitView({
          padding: 0.1,
          duration: 500,
          minZoom: 0.5,
          maxZoom: 1.5,
        });
      },
    }));

    useEffect(() => {
      if (onNodeAdded) {
        onNodeAdded();
      }
    }, [nodes.length, onNodeAdded]);

    // MODULAR FEATURE: Apply focus mode when toggled
    useEffect(() => {
      if (isFocusMode) {
        applyFocusMode(reactFlowInstance, nodes, edges);
      }
    }, [isFocusMode, reactFlowInstance, nodes, edges]);

    // MODULAR FEATURE: Get CSS classes for focus mode
    const focusClasses = getFocusModeClasses(isFocusMode);
    const isValidConnection = (connection: Connection): boolean => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // Prevent self-connections
      if (connection.source === connection.target) return false;

      // Check if connection already exists (prevent duplicates)
      const connectionExists = edges.some(
        (edge) =>
          (edge.source === connection.source && edge.target === connection.target) ||
          (edge.source === connection.target && edge.target === connection.source)
      );
      if (connectionExists) return false;

      // Valid connection pairs (bidirectional)
      const validPairs = [
        { source: NODE_TYPES.START, target: NODE_TYPES.EVENT },
        { source: NODE_TYPES.EVENT, target: NODE_TYPES.START },
        { source: NODE_TYPES.EVENT, target: NODE_TYPES.STATUS },
        { source: NODE_TYPES.STATUS, target: NODE_TYPES.EVENT },
      ];

      return validPairs.some(
        (pair) => sourceNode.type === pair.source && targetNode.type === pair.target
      );
    };

    return (
      <>
        {/* MODULAR FEATURE: Focus mode overlay */}
        {isFocusMode && <div className={focusClasses.overlay} />}

        <ReactFlow
          nodes={nodes.map((node: any) => {
            const isHighlighted =
              highlightedElements.nodeId === node.id ||
              highlightedElements.nodeIds?.includes(node.id);
            const hasError = errorNodeIds.has(node.id);

            const styleOverrides: any = {
              transition: 'all 0.3s ease',
            };

            if (hasError) {
              // EVENT nodes: rectangular border, STATUS nodes: circular border
              styleOverrides.boxShadow = 'none';
              styleOverrides.border = '4px solid #ef4444';
            } else if (isHighlighted) {
              styleOverrides.boxShadow =
                node.type === NODE_TYPES.STATUS
                  ? 'none'
                  : '0 0 0 3px #3b82f6, 0 0 20px rgba(59, 130, 246, 0.4)';
            }

            return {
              ...node,
              style: {
                ...node.style,
                ...styleOverrides,
              },
            };
          })}
          edges={edges.map((edge) => ({
            ...edge,
            style: highlightedElements.edgeIds.includes(edge.id)
              ? {
                  ...edge.style,
                  strokeWidth: 3,
                  stroke: '#3b82f6',
                  opacity: 1,
                  transition: 'all 0.3s ease',
                }
              : { ...edge.style, transition: 'all 0.3s ease' },
            animated: highlightedElements.edgeIds.includes(edge.id),
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          nodesDraggable={isDragEnabled}
          isValidConnection={isValidConnection}
          connectionLineStyle={{ stroke: '#10b981', strokeWidth: 2 }}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          className={`bg-white ${focusClasses.canvas}`}
        >
          <Background variant={BackgroundVariant.Dots} color='#8ABFC7' gap={15} size={1} />
          <Controls
            position='bottom-left'
            className='bg-white border border-gray-300 rounded shadow-sm'
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        </ReactFlow>
      </>
    );
  }
);

FlowCanvas.displayName = 'FlowCanvas';

export const Canvas = forwardRef<CanvasRef, CanvasProps>((props, ref) => {
  return (
    <div className='flex-1 relative'>
      <ReactFlowProvider>
        <FlowCanvas {...props} ref={ref} />
      </ReactFlowProvider>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
