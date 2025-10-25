import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import { Canvas } from './Canvas';
import { NodeEditorSidebar } from './NodeEditorSidebar';
import StartNode from './nodes/StartNode';
import StateNode from './nodes/StateNode';
import EventNode from './nodes/EventNode';
import './CreateWorkflow.scss';
import { Sidebar } from './Sidebar';
import {
  CreateWorkflowEdge,
  CreateWorkflowNode,
  FlowNode,
  NODE_TYPES,
} from '@/models/singleView/nodeTypes';

const START_POSITION = { x: 150, y: 200 };

export const CreateWorkflow = () => {
  // ===================== STATE MANAGEMENT ====================
  const [workflowName, setWorkflowName] = useState('Hypo Loan Position');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [autoPositioning, setAutoPositioning] = useState(true);
  const [highlightedElements, setHighlightedElements] = useState<{
    nodeId?: string;
    nodeIds?: string[];
    edgeIds: string[];
  }>({ edgeIds: [] });

  // initiate a default, non-removable start node
  const startNodeRef = useRef<CreateWorkflowNode>({
    id: `start-node-${Date.now()}`,
    type: NODE_TYPES.START,
    position: START_POSITION,
    data: {
      label: 'Start',
      showGhostEdge: true,
    },
  });

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([startNodeRef.current]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);

  // Connection state for dynamic handle styling
  const [connectionNodeId, setConnectionNodeId] = useState<string | null>(null);

  // Get current node data with defaults - derive from nodes array to stay in sync
  const currentNode = selectedNode
    ? nodes.find((n: { id: string }) => n.id === selectedNode.id)
    : null;
  const currentNodeData = currentNode
    ? {
        businessEvent: (currentNode.data.businessEvent as string) || '',
        businessEventName: (currentNode.data.businessEventName as string) || '',
        condition: (currentNode.data.condition as string) || '',
        description: (currentNode.data.description as string) || '',
        automaticTrigger: (currentNode.data.automaticTrigger as boolean) || false,
        externalTrigger: (currentNode.data.externalTrigger as boolean) || false,
        focalEntity: (currentNode.data.focalEntity as string) || '',
        createdEntities: (currentNode.data.createdEntities as string[]) || [],
        modifiedEntities: (currentNode.data.modifiedEntities as string[]) || [],
      }
    : {
        businessEvent: '',
        businessEventName: '',
        condition: '',
        description: '',
        automaticTrigger: false,
        externalTrigger: false,
        focalEntity: '',
        createdEntities: [] as string[],
        modifiedEntities: [] as string[],
      };

  // Update node data helper
  const updateNodeData = useCallback(
    (nodeId: string, updates: Record<string, any>) => {
      setNodes((nds: CreateWorkflowNode[]) =>
        nds.map((node: { id: string; data: any }) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
        )
      );
    },
    [setNodes]
  );

  // ==================== HELPER FUNCTIONS ====================
  const generateUniqueId = useCallback((nodeType: string, existingNodes: CreateWorkflowNode[]) => {
    const baseName = nodeType === NODE_TYPES.STATE ? 'Stage' : 'Action Block';
    const existingLabels = existingNodes.map((n) => n.data.label?.toString() || '');

    if (!existingLabels.includes(baseName)) {
      return { id: `${nodeType}-${Date.now()}`, label: baseName };
    }

    let counter = 1;
    while (existingLabels.includes(`${baseName}${counter}`)) {
      counter++;
    }

    return { id: `${nodeType}-${Date.now()}`, label: `${baseName}${counter}` };
  }, []);

  const addConnectedNode = useCallback(
    (sourceId: string, nodeType: string) => {
      const sourceNode = nodes.find((n: { id: string }) => n.id === sourceId);
      if (!sourceNode) return;

      const { id, label } = generateUniqueId(nodeType, nodes);

      const newPosition = autoPositioning
        ? {
            x: sourceNode.position.x + 200,
            y: sourceNode.position.y,
          }
        : {
            x: Math.random() * 400 + 200,
            y: Math.random() * 300 + 100,
          };

      const newNode: CreateWorkflowNode = {
        id,
        type: nodeType,
        position: newPosition,
        data: {
          label,
          description: nodeType === NODE_TYPES.EVENT ? 'Add business event.' : '',
        },
      };

      setNodes((nds: CreateWorkflowNode[]) => [...nds, newNode]);

      if (autoPositioning) {
        const newEdge = {
          id: `edge-${sourceId}-${newNode.id}`,
          source: sourceId,
          target: newNode.id,
          style: { strokeWidth: 2, stroke: '#94a3b8' },
          markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8' },
        };
        setEdges((eds: CreateWorkflowEdge[]) => eds.concat(newEdge));
        // Ghost edge will be hidden by the useEffect that monitors edges
      }
    },
    [nodes, setNodes, setEdges, autoPositioning, generateUniqueId]
  );

  const autoArrangeNodes = useCallback(() => {
    if (!autoPositioning || nodes.length === 0) return;

    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach((node: { id: string }) => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach((edge: { source: string; target: string }) => {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    const levels: string[][] = [[]];
    const queue: string[] = [];
    const visited = new Set<string>();

    nodes.forEach((node: { id: string }) => {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push(node.id);
      }
    });

    if (queue.length === 0 && nodes.length > 0) {
      queue.push(nodes[0].id);
    }

    while (queue.length > 0) {
      const currentLevel: string[] = [];
      const nextQueue: string[] = [];

      queue.forEach((nodeId) => {
        if (!visited.has(nodeId)) {
          visited.add(nodeId);
          currentLevel.push(nodeId);

          const connections = adjacencyList.get(nodeId) || [];
          connections.forEach((connectedId) => {
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

    const unvisited = nodes.filter((n: { id: string }) => !visited.has(n.id));
    if (unvisited.length > 0) {
      levels.push(unvisited.map((n: { id: string }) => n.id));
    }

    const updatedNodes = nodes.map((node: { id: string; type: string }) => {
      // fixate the start node and have new nodes branch off its position
      if (node.type === NODE_TYPES.START) {
        return { ...node, position: START_POSITION };
      }

      let levelIndex = 0;
      let positionInLevel = 0;

      for (let i = 0; i < levels.length; i++) {
        const indexInLevel = levels[i].indexOf(node.id);
        if (indexInLevel !== -1) {
          levelIndex = i;
          positionInLevel = indexInLevel;
          break;
        }
      }

      const levelWidth = levels[levelIndex]?.length || 1;
      const nodeSpacing = 250;
      const verticalSpacing = 80;

      const baseX = START_POSITION.x;
      const baseY = START_POSITION.y;

      const newPosition = {
        x: baseX + levelIndex * nodeSpacing,
        y: baseY + positionInLevel * verticalSpacing - ((levelWidth - 1) * verticalSpacing) / 2,
      };

      return { ...node, position: newPosition };
    });

    setNodes(updatedNodes);
  }, [nodes, edges, autoPositioning, setNodes]);

  // ==================== EVENT HANDLERS ====================
  const handleSaveDraft = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map((n: { id: string; type: string; position: any; data: any }) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e: { id: string; source: string; target: string }) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
      autoPositioning,
    };
    console.log('Save draft:', workflowData);
  };

  const handlePublishDraft = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map((n: { id: string; type: string; position: any; data: any }) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e: { id: string; source: string; target: string }) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
      status: 'published',
    };
    console.log('Publish workflow:', workflowData);
  };

  const handleNodeDelete = () => {
    if (selectedNode) {
      setNodes((nds: CreateWorkflowNode[]) => {
        // when nodes only have a start node and one more node, delete the connected node and reset start node
        if (nds.length === 2) {
          return [{ ...nds[0], data: { ...nds[0].data, showGhostEdge: true } }];
        } else {
          return nds.filter((n: { id: string }) => n.id !== selectedNode.id);
        }
      });
      setEdges((eds: CreateWorkflowEdge[]) =>
        eds.filter(
          (e: { source: string; target: string }) =>
            e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    }
  };

  const handleBusinessEventChange = useCallback(
    (value: string, label: string) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, {
          businessEvent: value,
          label: label || value,
        });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleBusinessEventNameChange = useCallback(
    (value: string) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, {
          businessEventName: value,
          label: value,
        });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleConditionChange = useCallback(
    (value: string, label?: string) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, {
          condition: value,
        });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, {
          description: value,
        });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleAutomaticTriggerChange = useCallback(
    (checked: boolean) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, { automaticTrigger: checked });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleExternalTriggerChange = useCallback(
    (checked: boolean) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, { externalTrigger: checked });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleFocalEntityChange = useCallback(
    (value: string, label?: string) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, { focalEntity: value });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleCreatedEntitiesChange = useCallback(
    (values: string[]) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, { createdEntities: values });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleModifiedEntitiesChange = useCallback(
    (values: string[]) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, { modifiedEntities: values });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleCreateNew = useCallback(() => {
    // Placeholder for creating new entities/events
    // TODO: Implement entity/event creation dialog
  }, []);

  // ==================== NODE/EDGE INTERACTIONS ====================
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      // Start node cannot be highlighted or modified
      if (node.type === NODE_TYPES.START) return;

      setSelectedNode(node);

      const connectedEdgeIds = edges
        .filter((edge: CreateWorkflowEdge) => edge.source === node.id || edge.target === node.id)
        .map((edge: CreateWorkflowEdge) => edge.id);

      setHighlightedElements({
        nodeIds: [node.id],
        edgeIds: connectedEdgeIds,
      });
    },
    [edges]
  );

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: CreateWorkflowEdge) => {
    const connectedNodeIds = [edge.source, edge.target].filter(Boolean);
    setHighlightedElements({
      nodeIds: connectedNodeIds,
      edgeIds: [edge.id],
    });
    setSelectedNode(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null);
    setHighlightedElements({ edgeIds: [], nodeIds: [] });
  }, []);

  const onConnect = useCallback(
    (params: any) => {
      setEdges((eds: CreateWorkflowEdge[]) =>
        addEdge(
          {
            ...params,
            style: { strokeWidth: 2, stroke: '#94a3b8' },
            markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8' },
          },
          eds
        )
      );
      // Ghost edge visibility is managed by the useEffect that monitors edges
      setConnectionNodeId(null);
    },
    [setEdges]
  );

  const onConnectStart = useCallback((_: any, { nodeId }: { nodeId: string | null }) => {
    setConnectionNodeId(nodeId);
  }, []);

  const onConnectEnd = useCallback(() => {
    setConnectionNodeId(null);
  }, []);

  // ==================== DRAG AND DROP ====================
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const { id, label } = generateUniqueId(type, nodes);
      const lastNode = nodes.reduce(
        (rightmost: { position: { x: number } }, node: { position: { x: number } }) =>
          node.position.x > rightmost.position.x ? node : rightmost,
        nodes[0]
      );

      let position;
      if (nodes.length === 0 || !autoPositioning) {
        position = {
          x: Math.random() * 400 + 200,
          y: Math.random() * 300 + 100,
        };
      } else {
        position = {
          x: lastNode.position.x + 150,
          y: lastNode.position.y,
        };
      }

      const newNode: CreateWorkflowNode = {
        id,
        type,
        position,
        data: {
          label,
          description: type === NODE_TYPES.EVENT ? 'Add business event.' : '',
        },
      };

      setNodes((nds: CreateWorkflowNode[]) => [...nds, newNode]);

      if (autoPositioning && nodes.length > 0) {
        const newEdge = {
          id: `edge-${lastNode.id}-${newNode.id}`,
          source: lastNode.id,
          target: newNode.id,
          style: { strokeWidth: 2, stroke: '#94a3b8' },
          markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8' },
        };
        setEdges((eds: CreateWorkflowEdge[]) => eds.concat(newEdge));
        // Ghost edge will be hidden by the useEffect that monitors edges
      }
    },
    [setNodes, setEdges, nodes, autoPositioning, generateUniqueId]
  );

  // ==================== EFFECTS & EVENT LISTENERS ====================
  useEffect(() => {
    const handleAddConnectedNode = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { sourceId, nodeType } = customEvent.detail;
      addConnectedNode(sourceId, nodeType);
    };

    window.addEventListener('addConnectedNode', handleAddConnectedNode as EventListener);
    return () => {
      window.removeEventListener('addConnectedNode', handleAddConnectedNode as EventListener);
    };
  }, [addConnectedNode]);

  // Monitor edge changes to update start node ghost edge visibility
  useEffect(() => {
    const startNodeId = startNodeRef.current.id;
    const hasOutgoingEdges = edges.some((edge: CreateWorkflowEdge) => edge.source === startNodeId);
    const shouldShowGhostEdge = !hasOutgoingEdges;
    
    setNodes((nds: CreateWorkflowNode[]) => {
      const startNode = nds.find((n: CreateWorkflowNode) => n.id === startNodeId);
      
      // Only update if the ghost edge state needs to change
      if (!startNode || startNode.data.showGhostEdge === shouldShowGhostEdge) {
        return nds;
      }
      
      return nds.map((n: CreateWorkflowNode) =>
        n.id === startNodeId
          ? { ...n, data: { ...n.data, showGhostEdge: shouldShowGhostEdge } }
          : n
      );
    });
  }, [edges, setNodes]);

  // Node types configuration
  const nodeTypes = useMemo(
    () => ({
      start: StartNode,
      state: StateNode,
      event: EventNode,
    }),
    []
  );

  // Enhanced nodes with connection state
  const nodesWithConnectionState = useMemo(
    () =>
      nodes.map((node: { data: any }) => ({
        ...node,
        data: {
          ...node.data,
          isConnecting: connectionNodeId !== null,
          connectionNodeId,
          connectionSourceType: connectionNodeId
            ? nodes.find((n: { id: string }) => n.id === connectionNodeId)?.type
            : null,
        },
      })),
    [nodes, connectionNodeId]
  );

  return (
    <div className='h-full overflow-y-auto flex bg-gray-100'>
      <Sidebar
        workflowName={workflowName}
        workflowDescription={workflowDescription}
        autoPositioning={autoPositioning}
        lastNodeType={
          nodes.length > 0
            ? nodes.reduce(
                (prev: { position: { x: number } }, current: { position: { x: number } }) =>
                  prev.position.x > current.position.x ? prev : current
              ).type
            : null
        }
        onWorkflowNameChange={setWorkflowName}
        onWorkflowDescriptionChange={setWorkflowDescription}
        onAutoPositioningChange={setAutoPositioning}
        onDragStart={onDragStart}
        onSaveDraft={handleSaveDraft}
        onPublishDraft={handlePublishDraft}
      />

      <Canvas
        nodes={nodesWithConnectionState}
        edges={edges}
        highlightedElements={highlightedElements}
        nodeTypes={nodeTypes}
        autoPositioning={autoPositioning}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={handleCanvasClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
      />

      <NodeEditorSidebar
        selectedNode={selectedNode}
        edges={edges}
        businessEvent={currentNodeData.businessEvent}
        businessEventName={currentNodeData.businessEventName}
        condition={currentNodeData.condition}
        description={currentNodeData.description}
        automaticTrigger={currentNodeData.automaticTrigger}
        externalTrigger={currentNodeData.externalTrigger}
        focalEntity={currentNodeData.focalEntity}
        createdEntities={currentNodeData.createdEntities}
        modifiedEntities={currentNodeData.modifiedEntities}
        onBusinessEventChange={handleBusinessEventChange}
        onBusinessEventNameChange={handleBusinessEventNameChange}
        onConditionChange={handleConditionChange}
        onDescriptionChange={handleDescriptionChange}
        onAutomaticTriggerChange={handleAutomaticTriggerChange}
        onExternalTriggerChange={handleExternalTriggerChange}
        onFocalEntityChange={handleFocalEntityChange}
        onCreatedEntitiesChange={handleCreatedEntitiesChange}
        onModifiedEntitiesChange={handleModifiedEntitiesChange}
        onCreateNew={handleCreateNew}
        onDelete={handleNodeDelete}
        onDone={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default CreateWorkflow;
