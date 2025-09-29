import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ==================== TYPES & INTERFACES ====================
interface NodeData {
  label: string;
  description?: string;
}

// ==================== CUSTOM NODE COMPONENTS ====================
const StateNode = ({ data, selected, id }: { data: NodeData; selected: boolean; id: string }) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('addConnectedNode', { 
      detail: { sourceId: id, nodeType: 'event' } 
    }));
  };

  return (
    <div className="group relative">
      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-md transition-all ${
        selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-green-400 bg-green-50'
      }`}>
        <Handle type="target" position={Position.Left} className="w-2 h-2" />
        <div className="text-xs font-medium text-gray-800 text-center px-1">{data.label}</div>
        <Handle type="source" position={Position.Right} className="w-2 h-2" />
      </div>
      <button 
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold hover:bg-blue-600 shadow-lg border border-white"
        onClick={handlePlusClick}
        title="Add Event Node"
      >
        +
      </button>
    </div>
  );
};

const EventNode = ({ data, selected, id }: { data: NodeData; selected: boolean; id: string }) => {
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('addConnectedNode', { 
      detail: { sourceId: id, nodeType: 'state' } 
    }));
  };

  return (
    <div className="group relative">
      <div className={`min-w-[80px] px-2 py-4 bg-white border-2 rounded-lg shadow-md transition-all ${
        selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-300'
      }`}>
        <Handle type="target" position={Position.Left} className="w-2 h-2" />
        <div className="font-medium text-gray-800 text-sm">{data.label}</div>
        {data.description && (
          <div className="text-xs text-gray-500 mt-1 truncate">{data.description}</div>
        )}
        <Handle type="source" position={Position.Right} className="w-2 h-2" />
      </div>
      <button 
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold hover:bg-green-600 shadow-lg border border-white"
        onClick={handlePlusClick}
        title="Add State Node"
      >
        +
      </button>
    </div>
  );
};

export const WorkflowEditor = () => {
  // ==================== STATE MANAGEMENT ====================
  const [workflowName, setWorkflowName] = useState('Hypo Loan Position');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [autoPositioning, setAutoPositioning] = useState(true);
  const [highlightedElements, setHighlightedElements] = useState<{nodeId?: string, nodeIds?: string[], edgeIds: string[]}>({ edgeIds: [] });
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Form state for selected node
  const [businessEvent, setBusinessEvent] = useState('Select business events and/or subworkflows');
  const [condition, setCondition] = useState('Select condition');
  const [automaticTrigger, setAutomaticTrigger] = useState(false);
  const [externalTrigger, setExternalTrigger] = useState(false);

  // ==================== HELPER FUNCTIONS ====================
  const addConnectedNode = useCallback((sourceId: string, nodeType: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    if (!sourceNode) return;

    const newPosition = {
      x: sourceNode.position.x + (nodeType === 'state' ? 200 : 250),
      y: sourceNode.position.y,
    };

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: newPosition,
      data: { 
        label: nodeType === 'state' ? 'New State' : 'New Block',
        description: nodeType === 'event' ? 'Add business event or subworkflow using the action panel.' : ''
      },
    };

    setNodes((nds) => nds.concat(newNode));
    
    const newEdge = {
      id: `edge-${sourceId}-${newNode.id}`,
      source: sourceId,
      target: newNode.id,
      style: { strokeWidth: 2, stroke: '#94a3b8' },
      markerEnd: { type: 'arrowclosed', color: '#94a3b8' }
    };
    setEdges((eds) => eds.concat(newEdge));
  }, [nodes, setNodes, setEdges]);

  const autoArrangeNodes = useCallback(() => {
    if (!autoPositioning || nodes.length === 0) return;
    
    // Advanced hierarchical layout algorithm
    // Step 1: Build graph adjacency list from edges
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    // Initialize all nodes
    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });
    
    // Build connections
    edges.forEach(edge => {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    // Step 2: Topological sort to determine hierarchy levels
    const levels: string[][] = [];
    const queue: string[] = [];
    const visited = new Set<string>();
    
    // Start with nodes that have no incoming edges
    nodes.forEach(node => {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push(node.id);
      }
    });
    
    // If no starting nodes, pick the first one
    if (queue.length === 0 && nodes.length > 0) {
      queue.push(nodes[0].id);
    }
    
    // BFS to assign levels
    while (queue.length > 0) {
      const currentLevel: string[] = [];
      const nextQueue: string[] = [];
      
      queue.forEach(nodeId => {
        if (!visited.has(nodeId)) {
          visited.add(nodeId);
          currentLevel.push(nodeId);
          
          // Add connected nodes to next level
          const connections = adjacencyList.get(nodeId) || [];
          connections.forEach(connectedId => {
            if (!visited.has(connectedId)) {
              nextQueue.push(connectedId);
            }
          });
        }
      });
      
      if (currentLevel.length > 0) {
        levels.push(currentLevel);
      }
      
      queue.length = 0;
      queue.push(...nextQueue);
    }
    
    // Add any remaining unvisited nodes
    const unvisited = nodes.filter(n => !visited.has(n.id));
    if (unvisited.length > 0) {
      levels.push(unvisited.map(n => n.id));
    }
    
    // Step 3: Position nodes horizontally with intelligent spacing
    const updatedNodes = nodes.map(node => {
      let levelIndex = 0;
      let positionInLevel = 0;
      
      // Find which level this node belongs to
      for (let i = 0; i < levels.length; i++) {
        const indexInLevel = levels[i].indexOf(node.id);
        if (indexInLevel !== -1) {
          levelIndex = i;
          positionInLevel = indexInLevel;
          break;
        }
      }
      
      const levelWidth = levels[levelIndex]?.length || 1;
      const nodeSpacing = 300; // Horizontal spacing between levels
      const verticalSpacing = 80; // Vertical spacing between nodes in same level
      
      // Intelligent positioning based on node type and count
      const baseX = 150;
      const baseY = 200;
      
      // For horizontal layout: levels spread left to right, nodes in level spread top to bottom
      const newPosition = {
        x: baseX + levelIndex * nodeSpacing,
        y: baseY + (positionInLevel * verticalSpacing) - ((levelWidth - 1) * verticalSpacing / 2) // Center vertically within level
      };
      
      return { ...node, position: newPosition };
    });
    
    setNodes(updatedNodes);
  }, [nodes, edges, autoPositioning, setNodes]);

  // ==================== NODE TYPES ====================
  const nodeTypes = useMemo(() => ({
    state: StateNode,
    event: EventNode,
  }), []);

  // ==================== DRAG AND DROP ====================
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    let position;
    if (nodes.length === 0) {
      position = { x: 200, y: 100 };
    } else {
      const lastNode = nodes.reduce((rightmost, node) => 
        node.position.x > rightmost.position.x ? node : rightmost
      );
      position = {
        x: lastNode.position.x + (type === 'state' ? 200 : 250),
        y: lastNode.position.y,
      };
    }

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: type === 'state' ? 'Start' : 'Action Block',
        description: type === 'event' ? 'Add business event or subworkflow using the action panel.' : ''
      },
    };

    setNodes((nds) => {
      const updatedNodes = nds.concat(newNode);
      
      if (nodes.length > 0) {
        const lastNode = nodes.reduce((rightmost, node) => 
          node.position.x > rightmost.position.x ? node : rightmost
        );
        
        const newEdge = {
          id: `edge-${lastNode.id}-${newNode.id}`,
          source: lastNode.id,
          target: newNode.id,
          style: { strokeWidth: 2, stroke: '#94a3b8' },
          markerEnd: { type: 'arrowclosed', color: '#94a3b8' }
        };
        setEdges((eds) => eds.concat(newEdge));
      }
      
      return updatedNodes;
    });
  }, [setNodes, setEdges, nodes]);

  // ==================== NODE/EDGE INTERACTIONS ====================
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    
    const connectedEdgeIds = edges
      .filter(edge => edge.source === node.id || edge.target === node.id)
      .map(edge => edge.id);
    
    setHighlightedElements({ nodeId: node.id, nodeIds: [node.id], edgeIds: connectedEdgeIds });
  }, [edges]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    // Highlight the edge AND its connected nodes (source and target)
    const connectedNodeIds = [edge.source, edge.target].filter(Boolean);
    setHighlightedElements({ 
      nodeIds: connectedNodeIds, 
      edgeIds: [edge.id] 
    });
    setSelectedNode(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null);
    setHighlightedElements({ edgeIds: [], nodeIds: [] });
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      style: { strokeWidth: 2, stroke: '#94a3b8' },
      markerEnd: { type: 'arrowclosed', color: '#94a3b8' }
    }, eds));
  }, [setEdges]);

  // ==================== EVENT HANDLERS ====================
  const handleSaveDraft = () => {
    console.log('Save Draft clicked');
    console.log('Workflow Data:', {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes,
      edges: edges,
      autoPositioning
    });
  };

  const handlePublishDraft = () => {
    console.log('Publish Draft clicked');
    console.log('Publishing Workflow:', {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes,
      edges: edges,
      status: 'published'
    });
  };

  // ==================== EFFECTS & EVENT LISTENERS ====================
  React.useEffect(() => {
    const handleAddConnectedNode = (event: CustomEvent) => {
      const { sourceId, nodeType } = event.detail;
      addConnectedNode(sourceId, nodeType);
    };

    window.addEventListener('addConnectedNode', handleAddConnectedNode as EventListener);
    return () => {
      window.removeEventListener('addConnectedNode', handleAddConnectedNode as EventListener);
    };
  }, [addConnectedNode]);

  React.useEffect(() => {
    if (autoPositioning && nodes.length > 1) {
      const timer = setTimeout(() => autoArrangeNodes(), 100);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, autoPositioning, autoArrangeNodes]);

  // ==================== RENDER ====================
  return (
    <div className="h-screen flex bg-gray-100">
      {/* ==================== LEFT SIDEBAR ==================== */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <button className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <span className="text-sm">← Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Application</h1>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">
              Workflow Name
            </label>
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">
              Workflow Description
            </label>
            <div className="relative">
              <textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Enter workflow description"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded resize-none"
                rows={4}
                maxLength={240}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {workflowDescription.length}/240
              </div>
            </div>
          </div>
        </div>

        {/* Component Palette */}
        <div className="p-4 flex-1">
          <p className="text-sm text-gray-600 mb-4">
            Drag components below onto the canvas and connect them together to build your workflow.
          </p>

          <div className="space-y-3">
            <div
              className="flex items-center gap-3 p-3 bg-gray-100 rounded border border-gray-300 cursor-move hover:bg-gray-200"
              draggable
              onDragStart={(e) => onDragStart(e, 'event')}
            >
              <div className="w-5 h-4 bg-gray-400 rounded flex items-center justify-center">
                <div className="w-3 h-2 bg-gray-600 rounded-sm"></div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-900">Transition Block</div>
                <div className="text-xs text-gray-500">Includes business events</div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-3 bg-gray-100 rounded border border-gray-300 cursor-move hover:bg-gray-200"
              draggable
              onDragStart={(e) => onDragStart(e, 'state')}
            >
              <div className="w-5 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-900">State</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <span className="text-sm font-bold text-gray-700">Auto-positioning</span>
            <button
              onClick={() => setAutoPositioning(!autoPositioning)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoPositioning ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoPositioning ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-300 flex gap-2">
          <button 
            onClick={handleSaveDraft}
            className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button 
            onClick={handlePublishDraft}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Publish Draft
          </button>
        </div>
      </div>

      {/* ==================== MAIN CANVAS ==================== */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              style: (highlightedElements.nodeId === node.id || highlightedElements.nodeIds?.includes(node.id))
                ? { ...node.style, boxShadow: '0 0 0 2px #3b82f6' }
                : node.style
            }))}
            edges={edges.map(edge => ({
              ...edge,
              style: highlightedElements.edgeIds.includes(edge.id)
                ? { ...edge.style, strokeWidth: 3, stroke: '#3b82f6' }
                : edge.style
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={handleCanvasClick}
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

      {/* ==================== RIGHT SIDEBAR - NODE EDITOR ==================== */}
      {selectedNode && (
        <div className="w-80 bg-gray-800 text-white flex flex-col shadow-2xl">
          <div className="p-4 border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-white">⌃</div>
              <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              🗑
            </button>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <label className="text-sm font-medium text-white mb-3 block">
                Business Event(s) and/or Subworkflow(s)
              </label>
              <select 
                value={businessEvent}
                onChange={(e) => setBusinessEvent(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white"
              >
                <option>Select business events and/or subworkflows</option>
                <option>Stage</option>
                <option>Approve</option>
                <option>Reject</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-3 block">Condition</label>
              <select 
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white"
              >
                <option>Select condition</option>
                <option>None</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-3 block">Trigger</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={automaticTrigger}
                    onChange={(e) => setAutomaticTrigger(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Automatic</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={externalTrigger}
                    onChange={(e) => setExternalTrigger(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-white">External</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-600">
            <button
              onClick={() => {
                console.log('Node updated:', {
                  nodeId: selectedNode.id,
                  businessEvent,
                  condition,
                  automaticTrigger,
                  externalTrigger
                });
                setSelectedNode(null);
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};