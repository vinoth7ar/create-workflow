export const NODE_TYPES = {
  START: 'start',
  STATUS: 'status',
  EVENT: 'event',
};

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  style?: any;
  markerEnd?: any;
}

export interface Connection {
  source: string;
  target: string;
}

export interface HierarchicalOption {
  value: string;
  label: string;
  children?: HierarchicalOption[];
}

export interface CreateWorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface CreateWorkflowEdge {
  id: string;
  source: string;
  target: string;
  style?: { strokeWidth: number; stroke: string };
  markerEnd?: { type: string; color: string };
}
