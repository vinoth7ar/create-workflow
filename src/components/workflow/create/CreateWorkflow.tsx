import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import { Canvas, CanvasRef } from './Canvas';
import { NodeEditorSidebar } from './NodeEditorSidebar';
import StartNodeEdit from './nodes/StartNodeEdit';
import StatusNodeEdit from './nodes/StatusNodeEdit';
import EventNodeEdit from './nodes/EventNodeEdit';
import './CreateWorkflow.scss';
import { Sidebar } from './Sidebar';
import {
  CreateWorkflowEdge,
  CreateWorkflowNode,
  FlowNode,
  NODE_TYPES,
} from '@/models/singleView/nodeTypes';
import { useNodeEditorControls } from './hooks/useNodeEditorControls';
import { FocusButton } from './components/FocusButton';

const START_POSITION = { x: 150, y: 200 };

export const CreateWorkflow = () => {
  // ==================== STATE MANAGEMENT ====================
  const [workflowName, setWorkflowName] = useState('Hypo Loan Position');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [autoPositioning, setAutoPositioning] = useState(true);
  const [highlightedElements, setHighlightedElements] = useState<{
    nodeId?: string;
    nodeIds?: string[];
    edgeIds: string[];
  }>({ edgeIds: [] });

  // MODULAR HOOK: Node editor sidebar controls
  const {
    isCollapsed,
    isFocusMode,
    isDragging,
    position,
    toggleCollapse,
    toggleFocusMode,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useNodeEditorControls();

  // Mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // initiate a default, none removable start node
  const startNodeRef = useRef<CreateWorkflowNode>({
    id: `start-node-${Date.now()}`,
    type: NODE_TYPES.START,
    position: START_POSITION,
    data: {
      label: 'Start',
      showGhostEdge: true,
    },
  } as CreateWorkflowNode);

  // Canvas ref for centering view
  const canvasRef = useRef<CanvasRef>(null);

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
        nds.map((node: CreateWorkflowNode) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
        )
      );
    },
    [setNodes]
  );

  // ==================== HELPER FUNCTIONS ====================
  const generateUniqueId = useCallback((nodeType: string, existingNodes: CreateWorkflowNode[]) => {
    // Keep label empty for Event Node to show helper text: 'Add event/workflow using action panel'
    if (nodeType === NODE_TYPES.EVENT) return { id: `${nodeType}-${Date.now()}`, label: '' };

    const baseName = nodeType === NODE_TYPES.STATUS ? 'Stage' : '';
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

  // Check if a position collides with existing nodes
  const hasCollision = useCallback(
    (position: { x: number; y: number }, existingNodes: CreateWorkflowNode[]) => {
      const minDistance = 150; // Minimum distance between nodes to avoid overlap

      return existingNodes.some((node) => {
        const dx = Math.abs(node.position.x - position.x);
        const dy = Math.abs(node.position.y - position.y);
        return dx < minDistance && dy < minDistance;
      });
    },
    []
  );

  // Find a non-colliding position for a new node
  const findNonCollidingPosition = useCallback(
    (basePosition: { x: number; y: number }, existingNodes: CreateWorkflowNode[]) => {
      const verticalSpacing = 250;
      const maxAttempts = 20;

      // Try the base position first
      if (!hasCollision(basePosition, existingNodes)) {
        return basePosition;
      }

      // Try alternating above and below with increasing distances
      for (let attempt = 1; attempt < maxAttempts; attempt++) {
        const offset = attempt * verticalSpacing;

        // Try below
        const positionBelow = { ...basePosition, y: basePosition.y + offset };
        if (!hasCollision(positionBelow, existingNodes)) {
          return positionBelow;
        }

        // Try above
        const positionAbove = { ...basePosition, y: basePosition.y - offset };
        if (!hasCollision(positionAbove, existingNodes)) {
          return positionAbove;
        }
      }

      // If all attempts fail, return a position far below
      return { ...basePosition, y: basePosition.y + maxAttempts * verticalSpacing };
    },
    [hasCollision]
  );

  const addConnectedNode = useCallback(
    (sourceId: string, nodeType: string) => {
      const sourceNode = nodes.find((n: { id: string }) => n.id === sourceId);
      if (!sourceNode) return;

      const { id, label } = generateUniqueId(nodeType, nodes);
      // event node is big so we give it extra distance from event node to the target node
      const extraGap = sourceNode.type === NODE_TYPES.EVENT ? 300 : 200;

      // If auto-positioning is off, enable it when adding a node via + button
      const wasAutoPositioningOff = !autoPositioning;
      if (wasAutoPositioningOff) {
        setAutoPositioning(true);
      }

      // const newPosition = autoPositioning
      //   ? {
      //       x: sourceNode.position.x + extraGap,
      //       y: sourceNode.position.y,
      //     }
      // : {
      //       x: Math.random() * 400 + 200,
      //       y: Math.random() * 300 + 100,
      //   };

      // Count how many children this source node already has
      const childrenCount = edges.filter((e: CreateWorkflowEdge) => e.source === sourceId).length;

      const horizontalOffset = 350; // Increased for better spacing, especially for event nodes
      const verticalSpacing = 180;

      // Alternate children above and below the source
      // Pattern: 0, +180, -180, +360, -360, +540, -540...
      // First child (count=0): 0
      // Second child (count=1): +180 below
      // Third child (count=2): -180 above
      // Fourth child (count=3): +360 below
      let verticalOffset = 0;
      if (childrenCount > 0) {
        const isOdd = childrenCount % 2 === 1;
        const halfCount = Math.ceil(childrenCount / 2);
        verticalOffset = isOdd
          ? halfCount * verticalSpacing // Below (positive)
          : -halfCount * verticalSpacing; // Above (negative)
      }

      // Calculate base position
      const basePosition = {
        x: sourceNode.position.x + horizontalOffset,
        y: sourceNode.position.y + verticalOffset,
      };

      // Find a non-colliding position
      const newPosition = findNonCollidingPosition(basePosition, nodes);

      const newNode: any = {
        id,
        type: nodeType,
        position: newPosition,
        data: {
          label,
          description: '',
          _triggerRealign: wasAutoPositioningOff,
        },
      };

      setNodes((nds: CreateWorkflowNode[]) => [...nds, newNode]);

      const newEdge = {
        id: `edge-${sourceId}-${newNode.id}`,
        source: sourceId,
        target: newNode.id,
        style: { strokeWidth: 2, stroke: '#94a3b8' },
        markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8' },
      };

      setEdges((eds: CreateWorkflowEdge[]) => eds.concat(newEdge));

      // Auto-select the new node to open the edit sidebar
      setSelectedNode(newNode);

      // Highlight the new node and its edge
      setHighlightedElements({
        nodeIds: [newNode.id],
        edgeIds: [newEdge.id],
      });

      // Auto-center and zoom on the new node
      setTimeout(() => {
        canvasRef.current?.centerView(newNode.id);
      }, 100);
    },
    [
      nodes,
      setNodes,
      setEdges,
      autoPositioning,
      generateUniqueId,
      setSelectedNode,
      edges,
      setAutoPositioning,
      findNonCollidingPosition,
      setHighlightedElements,
    ]
  );

  const autoArrangeNodes = useCallback(
    (force = false) => {
      if ((!autoPositioning && !force) || nodes.length === 0) return;

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
              // ... more code continues
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

      const updatedNodes = nodes.map((node: CreateWorkflowNode) => {
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
        const nodeSpacing = 300;
        const verticalSpacing = 150;

        const baseX = START_POSITION.x;
        const baseY = START_POSITION.y;

        const newPosition = {
          x: baseX + levelIndex * nodeSpacing,
          y: baseY + positionInLevel * verticalSpacing - ((levelWidth - 1) * verticalSpacing) / 2,
        };

        return { ...node, position: newPosition };
      });

      setNodes(updatedNodes);
    },
    [nodes, edges, autoPositioning, setNodes]
  );

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

      let position;
      if (nodes.length === 0) {
        // First node after START: place to the right of START
        position = {
          x: START_POSITION.x + 150,
          y: START_POSITION.y,
        };
      } else {
        // Find the rightmost node
        const lastNode = nodes.reduce(
          (
            rightmost: { position: { x: number; y: number }; id: string },
            node: { position: { x: number; y: number }; id: string }
          ) => (node.position.x > rightmost.position.x ? node : rightmost),
          nodes[0]
        );

        // Place new node to the right of the last node
        const horizontalOffset = 350;
        const verticalVariation = ((nodes.length % 3) - 1) * 100; // -100, 0, or +100 for variation

        const candidatePosition = {
          x: lastNode.position.x + horizontalOffset,
          y: lastNode.position.y + verticalVariation,
        };

        // Check for collisions and find a non-colliding position if needed
        position = findNonCollidingPosition(candidatePosition, nodes);
      }

      const newNode: any = {
        id,
        type,
        position,
        data: {
          label,
          description: '',
        },
      };

      setNodes((nds: CreateWorkflowNode[]) => [...nds, newNode]);

      // Auto-select and center view on new node
      setSelectedNode(newNode);
      setTimeout(() => {
        canvasRef.current?.centerView(newNode.id);
      }, 50);

      if (autoPositioning && nodes.length > 0) {
        const lastNode = nodes.reduce(
          (
            rightmost: { position: { x: number }; id: string },
            node: { position: { x: number }; id: string }
          ) => (node.position.x > rightmost.position.x ? node : rightmost),
          nodes[0]
        );

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
    [
      setNodes,
      setEdges,
      nodes,
      autoPositioning,
      generateUniqueId,
      setSelectedNode,
      findNonCollidingPosition,
    ]
  );

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
  };

  const handleNodeDelete = () => {
    if (selectedNode) {
      setNodes((nds: CreateWorkflowNode[]) => {
        // when nodes only have a start node and one more node, delete the connected node and reset start node
        if (nds.length === 2) {
          return [startNodeRef.current];
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
        n.id === startNodeId ? { ...n, data: { ...n.data, showGhostEdge: shouldShowGhostEdge } } : n
      );
    });
  }, [edges, setNodes]);

  // Trigger graph realignment when a node with _triggerRealign flag is added
  useEffect(() => {
    const nodeThatTriggeredRealign = nodes.find((n: CreateWorkflowNode) => n.data._triggerRealign);
    if (nodeThatTriggeredRealign && autoPositioning) {
      // Clean up the flag
      setNodes((nds: CreateWorkflowNode[]) =>
        nds.map((n: CreateWorkflowNode) =>
          n.id === nodeThatTriggeredRealign.id
            ? { ...n, data: { ...n.data, _triggerRealign: undefined } }
            : n
        )
      );
      // Run the alignment with latest state
      autoArrangeNodes(true);
    }
  }, [nodes, autoPositioning, autoArrangeNodes, setNodes]);

  // Node types configuration
  const nodeTypes = useMemo(
    () => ({
      start: StartNodeEdit,
      status: StatusNodeEdit,
      event: EventNodeEdit,
    }),
    []
  );

  // Enhanced nodes with connection state
  const nodesWithConnectionState = useMemo(
    () =>
      nodes.map((node: CreateWorkflowNode) => ({
        ...node,
        data: {
          ...node.data,
          isConnecting: connectionNodeId !== null,
          connectionNodeId,
          connectionSourceType: connectionNodeId
            ? nodes.find((n: CreateWorkflowNode) => n.id === connectionNodeId)?.type
            : null,
        },
      })),
    [nodes, connectionNodeId]
  );

  return (
    <>
      <div className='h-screen flex min-h-0 overflow-hidden bg-gray-100'>
        {!isFocusMode && (
          <Sidebar
            workflowName={workflowName}
            workflowDescription={workflowDescription}
            autoPositioning={autoPositioning}
            lastNodeType={
              nodes.length > 0
                ? nodes.reduce((prev: CreateWorkflowNode, current: CreateWorkflowNode) =>
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
        )}
        <Canvas
          ref={canvasRef}
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
          onDone={() => setSelectedNode(null)}
          onDelete={handleNodeDelete}
          isCollapsed={isCollapsed}
          isDragging={isDragging}
          position={position}
          onToggleCollapse={toggleCollapse}
          onDragStart={handleDragStart}
        />
      </div>

      <FocusButton isFocusMode={isFocusMode} onToggleFocus={toggleFocusMode} />
    </>
  );
};

export default CreateWorkflow;
