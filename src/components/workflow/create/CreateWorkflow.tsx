import { useState, useCallback, useMemo, useEffect } from 'react';
import { addEdge, useNodesState, useEdgesState, Connection, Edge, Node } from '@xyflow/react';
import { StateNode, EventNode } from './nodes';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { NodeEditorSidebar } from './NodeEditorSidebar';

export const CreateWorkflow = () => {
  // ==================== STATE MANAGEMENT ====================
  const [workflowName, setWorkflowName] = useState('Hypo Loan Position');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [autoPositioning, setAutoPositioning] = useState(true);
  const [highlightedElements, setHighlightedElements] = useState<{nodeId?: string, nodeIds?: string[], edgeIds: string[]}>({ edgeIds: [] });
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Connection state for dynamic handle styling
  const [connectionNodeId, setConnectionNodeId] = useState<string | null>(null);

  // Get current node data with defaults - derive from nodes array to stay in sync
  const currentNode = selectedNode ? nodes.find(n => n.id === selectedNode.id) : null;
  const currentNodeData = currentNode ? {
    businessEvent: (currentNode.data.businessEvent as string) || '',
    condition: (currentNode.data.condition as string) || '',
    automaticTrigger: (currentNode.data.automaticTrigger as boolean) || false,
    externalTrigger: (currentNode.data.externalTrigger as boolean) || false,
    focalEntity: (currentNode.data.focalEntity as string) || '',
    createdEntities: (currentNode.data.createdEntities as string[]) || [],
    modifiedEntities: (currentNode.data.modifiedEntities as string[]) || [],
  } : {
    businessEvent: '',
    condition: '',
    automaticTrigger: false,
    externalTrigger: false,
    focalEntity: '',
    createdEntities: [] as string[],
    modifiedEntities: [] as string[],
  };

  // Update node data helper
  const updateNodeData = useCallback((nodeId: string, updates: Record<string, any>) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [setNodes]);

  // ==================== HELPER FUNCTIONS ====================
  const generateUniqueId = useCallback((nodeType: string, existingNodes: Node[]) => {
    const baseName = nodeType === 'state' ? 'Stage' : 'Action Block';
    const existingLabels = existingNodes.map(n => n.data.label?.toString() || '');
    
    if (!existingLabels.includes(baseName)) {
      return { id: `${nodeType}-${Date.now()}`, label: baseName };
    }
    
    let counter = 1;
    while (existingLabels.includes(`${baseName}${counter}`)) {
      counter++;
    }
    
    return { id: `${nodeType}-${Date.now()}`, label: `${baseName}${counter}` };
  }, []);

  const addConnectedNode = useCallback((sourceId: string, nodeType: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    if (!sourceNode) return;

    const { id, label } = generateUniqueId(nodeType, nodes);
    
    const newPosition = autoPositioning ? {
      x: sourceNode.position.x + 250,
      y: sourceNode.position.y,
    } : {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 100,
    };

    const newNode: Node = {
      id,
      type: nodeType,
      position: newPosition,
      data: { 
        label,
        description: nodeType === 'event' ? 'Add business event or subworkflow using the action panel.' : ''
      },
    };

    setNodes((nds) => nds.concat(newNode));
    
    if (autoPositioning) {
      const newEdge = {
        id: `edge-${sourceId}-${newNode.id}`,
        source: sourceId,
        target: newNode.id,
        style: { strokeWidth: 2, stroke: '#94a3b8' },
        markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8' }
      };
      setEdges((eds) => eds.concat(newEdge));
    }
  }, [nodes, setNodes, setEdges, autoPositioning, generateUniqueId]);

  const autoArrangeNodes = useCallback(() => {
    if (!autoPositioning || nodes.length === 0) return;
    
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });
    
    edges.forEach(edge => {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    const levels: string[][] = [];
    const queue: string[] = [];
    const visited = new Set<string>();
    
    nodes.forEach(node => {
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
      
      queue.forEach(nodeId => {
        if (!visited.has(nodeId)) {
          visited.add(nodeId);
          currentLevel.push(nodeId);
          
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
    
    const unvisited = nodes.filter(n => !visited.has(n.id));
    if (unvisited.length > 0) {
      levels.push(unvisited.map(n => n.id));
    }
    
    const updatedNodes = nodes.map(node => {
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
      
      const baseX = 150;
      const baseY = 200;
      
      const newPosition = {
        x: baseX + levelIndex * nodeSpacing,
        y: baseY + (positionInLevel * verticalSpacing) - ((levelWidth - 1) * verticalSpacing / 2)
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

  // Enhance nodes with connection state for dynamic handle styling
  const nodesWithConnectionState = useMemo(() => 
    nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isConnecting: connectionNodeId !== null,
        connectionNodeId,
        connectionSourceType: connectionNodeId ? nodes.find(n => n.id === connectionNodeId)?.type : null
      }
    })),
    [nodes, connectionNodeId]
  );

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

    const { id, label } = generateUniqueId(type, nodes);

    let position;
    if (nodes.length === 0 || !autoPositioning) {
      position = autoPositioning ? { x: 150, y: 200 } : { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 100 
      };
    } else {
      const lastNode = nodes.reduce((rightmost, node) => 
        node.position.x > rightmost.position.x ? node : rightmost
      );
      position = {
        x: lastNode.position.x + 250,
        y: lastNode.position.y,
      };
    }

    const newNode: Node = {
      id,
      type,
      position,
      data: { 
        label,
        description: type === 'event' ? 'Add business event or subworkflow using the action panel.' : ''
      },
    };

    setNodes((nds) => {
      const updatedNodes = nds.concat(newNode);
      
      if (autoPositioning && nodes.length > 0) {
        const lastNode = nodes.reduce((rightmost, node) => 
          node.position.x > rightmost.position.x ? node : rightmost
        );
        
        const newEdge = {
          id: `edge-${lastNode.id}-${newNode.id}`,
          source: lastNode.id,
          target: newNode.id,
          style: { strokeWidth: 2, stroke: '#94a3b8' },
          markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8' }
        };
        setEdges((eds) => eds.concat(newEdge));
      }
      
      return updatedNodes;
    });
  }, [setNodes, setEdges, nodes, autoPositioning, generateUniqueId]);

  // ==================== NODE/EDGE INTERACTIONS ====================
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    
    const connectedEdgeIds = edges
      .filter(edge => edge.source === node.id || edge.target === node.id)
      .map(edge => edge.id);
    
    setHighlightedElements({ nodeId: node.id, nodeIds: [node.id], edgeIds: connectedEdgeIds });
  }, [edges]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
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
      markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8' }
    }, eds));
    setConnectionNodeId(null);
  }, [setEdges]);

  const onConnectStart = useCallback((_: any, { nodeId }: { nodeId: string | null }) => {
    setConnectionNodeId(nodeId);
  }, []);

  const onConnectEnd = useCallback(() => {
    setConnectionNodeId(null);
  }, []);

  // ==================== EVENT HANDLERS ====================
  const handleSaveDraft = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target
      })),
      autoPositioning
    };
    console.log('=== SAVE DRAFT ===');
    console.log(JSON.stringify(workflowData, null, 2));
  };

  const handlePublishDraft = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target
      })),
      status: 'published'
    };
    console.log('=== PUBLISH DRAFT ===');
    console.log(JSON.stringify(workflowData, null, 2));
    alert('Workflow published successfully! Check console for output.');
  };

  const handleNodeDelete = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const handleBusinessEventChange = useCallback((value: string, label?: string) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { 
        businessEvent: value, 
        label: label || value // Use human-readable label for display
      });
    }
  }, [selectedNode, updateNodeData]);

  const handleConditionChange = useCallback((value: string, label?: string) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { 
        condition: value, 
        description: label || value // Use human-readable label
      });
    }
  }, [selectedNode, updateNodeData]);

  const handleAutomaticTriggerChange = useCallback((checked: boolean) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { automaticTrigger: checked });
    }
  }, [selectedNode, updateNodeData]);

  const handleExternalTriggerChange = useCallback((checked: boolean) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { externalTrigger: checked });
    }
  }, [selectedNode, updateNodeData]);

  const handleFocalEntityChange = useCallback((value: string, label?: string) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { focalEntity: value });
    }
  }, [selectedNode, updateNodeData]);

  const handleCreatedEntitiesChange = useCallback((values: string[]) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { createdEntities: values });
    }
  }, [selectedNode, updateNodeData]);

  const handleModifiedEntitiesChange = useCallback((values: string[]) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { modifiedEntities: values });
    }
  }, [selectedNode, updateNodeData]);

  const handleCreateNew = useCallback(() => {
    // Placeholder for creating new entities/events
    console.log('Create new requested');
    // TODO: Implement entity/event creation dialog
  }, []);

  // ==================== EFFECTS & EVENT LISTENERS ====================
  useEffect(() => {
    const handleAddConnectedNode = (event: CustomEvent) => {
      const { sourceId, nodeType } = event.detail;
      addConnectedNode(sourceId, nodeType);
    };

    window.addEventListener('addConnectedNode', handleAddConnectedNode as EventListener);
    return () => {
      window.removeEventListener('addConnectedNode', handleAddConnectedNode as EventListener);
    };
  }, [addConnectedNode]);

  useEffect(() => {
    if (autoPositioning && nodes.length > 1) {
      const timer = setTimeout(() => autoArrangeNodes(), 100);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, autoPositioning, autoArrangeNodes]);

  // ==================== RENDER ====================
  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        workflowName={workflowName}
        workflowDescription={workflowDescription}
        autoPositioning={autoPositioning}
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
        businessEvent={currentNodeData.businessEvent}
        condition={currentNodeData.condition}
        automaticTrigger={currentNodeData.automaticTrigger}
        externalTrigger={currentNodeData.externalTrigger}
        focalEntity={currentNodeData.focalEntity}
        createdEntities={currentNodeData.createdEntities}
        modifiedEntities={currentNodeData.modifiedEntities}
        onBusinessEventChange={handleBusinessEventChange}
        onConditionChange={handleConditionChange}
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
