import type { Node, Edge as ReactFlowEdge } from '@xyflow/react';

// Node type constants
export const NODE_TYPES = {
  START: 'start',
  STATE: 'state',
  EVENT: 'event',
} as const;

// Base node data interface
export interface NodeData {
  label: string;
  description?: string;
  showGhostEdge?: boolean;
  businessEvent?: string;
  businessEventName?: string;
  condition?: string;
  automaticTrigger?: boolean;
  externalTrigger?: boolean;
  focalEntity?: string;
  createdEntities?: string[];
  modifiedEntities?: string[];
  isConnecting?: boolean;
  connectionNodeId?: string | null;
  connectionSourceType?: string | null;
}

// Custom Flow Node type
export interface FlowNode extends Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  sourceNode?: FlowNode;
  targetNode?: FlowNode;
}

// Custom CreateWorkflow Node type
export interface CreateWorkflowNode extends FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

// Custom Edge type
export interface Edge extends ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  style?: any;
  markerEnd?: any;
}

// Custom CreateWorkflow Edge type
export interface CreateWorkflowEdge extends Edge {
  id: string;
  source: string;
  target: string;
  style?: any;
  markerEnd?: any;
}

// Connection type
export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

// Hierarchical Option type for dropdowns
export interface HierarchicalOption {
  value: string;
  label: string;
  children?: HierarchicalOption[];
}
