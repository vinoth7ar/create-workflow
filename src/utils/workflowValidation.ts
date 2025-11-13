import { CreateWorkflowNode, CreateWorkflowEdge, NODE_TYPES } from '@/models/singleView/nodeTypes';

export enum ValidationErrorType {
  // Workflow level
  EMPTY_WORKFLOW_NAME = 'EMPTY_WORKFLOW_NAME',
  EMPTY_WORKFLOW = 'EMPTY_WORKFLOW',

  // EVENT node level
  MISSING_BUSINESS_EVENT = 'MISSING_BUSINESS_EVENT',
  MISSING_CONDITION = 'MISSING_CONDITION',
  MISSING_TRIGGER = 'MISSING_TRIGGER',
  MISSING_BUSINESS_EVENT_NAME = 'MISSING_BUSINESS_EVENT_NAME',
  MISSING_FOCAL_ENTITY = 'MISSING_FOCAL_ENTITY',
  MISSING_DESCRIPTION = 'MISSING_DESCRIPTION',
  EMPTY_CREATED_ENTITIES = 'EMPTY_CREATED_ENTITIES',
  EMPTY_MODIFIED_ENTITIES = 'EMPTY_MODIFIED_ENTITIES',

  // STATUS node level
  MISSING_STATE_NAME = 'MISSING_STATE_NAME',

  // Connection/Edge level
  DEAD_END_NODE = 'DEAD_END_NODE',
  UNCONNECTED_NODE = 'UNCONNECTED_NODE',
  START_NOT_CONNECTED = 'START_NOT_CONNECTED',

  // Advanced
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',
  UNREACHABLE_NODE = 'UNREACHABLE_NODE',
}

export enum ValidationMode {
  SAVE = 'SAVE',
  PUBLISH = 'PUBLISH',
}

export enum ValidationErrorSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export interface ValidationError {
  type: ValidationErrorType;
  severity: ValidationErrorSeverity;
  message: string;
  nodeId?: string;
  nodeName?: string;
  fieldName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const getNodeName = (node: CreateWorkflowNode): string => {
  if (node.type === NODE_TYPES.START) return 'Start';
  if (node.type === NODE_TYPES.STATUS)
    return node.data.businessEventName || node.data.label || 'Unnamed State';
  if (node.type === NODE_TYPES.EVENT)
    return node.data.businessEventName || node.data.label || 'Unnamed Transition Block';
  return 'Unnamed Node';
};

const validateWorkflowMetadata = (
  workflowName: string,
  workflowDescription: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!workflowName || workflowName.trim() === '') {
    errors.push({
      type: ValidationErrorType.EMPTY_WORKFLOW_NAME,
      severity: ValidationErrorSeverity.ERROR,
      message: 'Workflow name is required',
    });
  }

  return errors;
};

const validateEmptyWorkflow = (nodes: CreateWorkflowNode[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  const nonStartNodes = nodes.filter((node) => node.type !== NODE_TYPES.START);

  if (nonStartNodes.length === 0) {
    errors.push({
      type: ValidationErrorType.EMPTY_WORKFLOW,
      severity: ValidationErrorSeverity.ERROR,
      message: 'Workflow is empty. Add at least one node to create a meaningful workflow.',
    });
  }

  return errors;
};

const validateEventNode = (
  node: CreateWorkflowNode,
  mode: ValidationMode = ValidationMode.SAVE
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const nodeName = getNodeName(node);
  const isPublish = mode === ValidationMode.PUBLISH;

  if (!node.data.businessEvent || node.data.businessEvent.trim() === '') {
    errors.push({
      type: ValidationErrorType.MISSING_BUSINESS_EVENT,
      severity: ValidationErrorSeverity.ERROR,
      message: `${nodeName}: Business Event is required`,
      nodeId: node.id,
      nodeName,
      fieldName: 'businessEvent',
    });
  }

  if (!node.data.condition || node.data.condition.trim() === '') {
    errors.push({
      type: ValidationErrorType.MISSING_CONDITION,
      severity: ValidationErrorSeverity.ERROR,
      message: `${nodeName}: Condition is required`,
      nodeId: node.id,
      nodeName,
      fieldName: 'condition',
    });
  }

  if (!node.data.automaticTrigger && !node.data.externalTrigger) {
    errors.push({
      type: ValidationErrorType.MISSING_TRIGGER,
      severity: ValidationErrorSeverity.ERROR,
      message: `${nodeName}: At least one trigger (Automatic or External) must be selected`,
      nodeId: node.id,
      nodeName,
      fieldName: 'trigger',
    });
  }

  if (!node.data.businessEventName || node.data.businessEventName.trim() === '') {
    errors.push({
      type: ValidationErrorType.MISSING_BUSINESS_EVENT_NAME,
      severity: ValidationErrorSeverity.ERROR,
      message: `${nodeName}: Business Event Name is required`,
      nodeId: node.id,
      nodeName,
      fieldName: 'businessEventName',
    });
  }

  if (!node.data.focalEntity || node.data.focalEntity.trim() === '') {
    errors.push({
      type: ValidationErrorType.MISSING_FOCAL_ENTITY,
      severity: ValidationErrorSeverity.ERROR,
      message: `${nodeName}: Focal Entity is required`,
      nodeId: node.id,
      nodeName,
      fieldName: 'focalEntity',
    });
  }

  if (!node.data.description || node.data.description.trim() === '') {
    errors.push({
      type: ValidationErrorType.MISSING_DESCRIPTION,
      severity: isPublish ? ValidationErrorSeverity.ERROR : ValidationErrorSeverity.WARNING,
      message: isPublish
        ? `${nodeName}: Description is required for publishing`
        : `${nodeName}: Description is recommended for better documentation`,
      nodeId: node.id,
      nodeName,
      fieldName: 'description',
    });
  }

  if (!node.data.createdEntities || node.data.createdEntities.length === 0) {
    errors.push({
      type: ValidationErrorType.EMPTY_CREATED_ENTITIES,
      severity: isPublish ? ValidationErrorSeverity.ERROR : ValidationErrorSeverity.WARNING,
      message: isPublish
        ? `${nodeName}: Created Entities are required for publishing`
        : `${nodeName}: Consider adding Created Entities for clarity`,
      nodeId: node.id,
      nodeName,
      fieldName: 'createdEntities',
    });
  }

  if (!node.data.modifiedEntities || node.data.modifiedEntities.length === 0) {
    errors.push({
      type: ValidationErrorType.EMPTY_MODIFIED_ENTITIES,
      severity: isPublish ? ValidationErrorSeverity.ERROR : ValidationErrorSeverity.WARNING,
      message: isPublish
        ? `${nodeName}: Modified Entities are required for publishing`
        : `${nodeName}: Consider adding Modified Entities for clarity`,
      nodeId: node.id,
      nodeName,
      fieldName: 'modifiedEntities',
    });
  }

  return errors;
};

const validateStatusNode = (node: CreateWorkflowNode): ValidationError[] => {
  const errors: ValidationError[] = [];
  const nodeName = getNodeName(node);

  if (!node.data.businessEventName || node.data.businessEventName.trim() === '') {
    errors.push({
      type: ValidationErrorType.MISSING_STATE_NAME,
      severity: ValidationErrorSeverity.ERROR,
      message: `${nodeName}: State Name is required`,
      nodeId: node.id,
      nodeName,
      fieldName: 'businessEventName',
    });
  }

  return errors;
};

const validateConnectivity = (
  nodes: CreateWorkflowNode[],
  edges: CreateWorkflowEdge[],
  mode: ValidationMode = ValidationMode.SAVE
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const isPublish = mode === ValidationMode.PUBLISH;

  const startNode = nodes.find((node) => node.type === NODE_TYPES.START);
  if (!startNode) return errors;

  const outgoingConnections = edges.filter((edge) => edge.source === startNode.id);
  if (outgoingConnections.length === 0) {
    errors.push({
      type: ValidationErrorType.START_NOT_CONNECTED,
      severity: ValidationErrorSeverity.ERROR,
      message: 'Start node has no outgoing connections. Connect it to begin your workflow.',
      nodeId: startNode.id,
      nodeName: 'Start',
    });
  }

  nodes.forEach((node) => {
    if (node.type === NODE_TYPES.START) return;

    const hasIncoming = edges.some((edge) => edge.target === node.id);
    if (!hasIncoming) {
      errors.push({
        type: ValidationErrorType.UNCONNECTED_NODE,
        severity: ValidationErrorSeverity.ERROR,
        message: `${getNodeName(node)}: Node has no incoming connections`,
        nodeId: node.id,
        nodeName: getNodeName(node),
      });
    }

    const hasOutgoing = edges.some((edge) => edge.source === node.id);
    if (!hasOutgoing) {
      errors.push({
        type: ValidationErrorType.DEAD_END_NODE,
        severity: isPublish ? ValidationErrorSeverity.ERROR : ValidationErrorSeverity.WARNING,
        message: isPublish
          ? `${getNodeName(node)}: Node has no outgoing connections. All nodes must have exit paths for publishing.`
          : `${getNodeName(node)}: Node has no outgoing connections (dead end)`,
        nodeId: node.id,
        nodeName: getNodeName(node),
      });
    }
  });

  return errors;
};

const findReachableNodes = (startNodeId: string, edges: CreateWorkflowEdge[]): Set<string> => {
  const reachable = new Set<string>();
  const queue = [startNodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (reachable.has(currentId)) continue;

    reachable.add(currentId);

    const connectedNodes = edges
      .filter((edge) => edge.source === currentId)
      .map((edge) => edge.target);

    queue.push(...connectedNodes);
  }

  return reachable;
};

const validateReachability = (
  nodes: CreateWorkflowNode[],
  edges: CreateWorkflowEdge[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const startNode = nodes.find((node) => node.type === NODE_TYPES.START);
  if (!startNode) return errors;

  const reachableNodeIds = findReachableNodes(startNode.id, edges);

  nodes.forEach((node) => {
    if (node.type === NODE_TYPES.START) return;

    if (!reachableNodeIds.has(node.id)) {
      errors.push({
        type: ValidationErrorType.UNREACHABLE_NODE,
        severity: ValidationErrorSeverity.ERROR,
        message: `${getNodeName(node)}: Node is not reachable from Start`,
        nodeId: node.id,
        nodeName: getNodeName(node),
      });
    }
  });

  return errors;
};

const detectCycles = (
  nodes: CreateWorkflowNode[],
  edges: CreateWorkflowEdge[]
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter((edge) => edge.source === nodeId);

    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (hasCycle(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        errors.push({
          type: ValidationErrorType.CIRCULAR_REFERENCE,
          severity: ValidationErrorSeverity.WARNING,
          message:
            'Workflow contains circular references (loops). This may cause infinite execution.',
        });
        break;
      }
    }
  }

  return errors;
};

export const validateWorkflow = (
  workflowName: string,
  workflowDescription: string,
  nodes: CreateWorkflowNode[],
  edges: CreateWorkflowEdge[],
  mode: ValidationMode = ValidationMode.SAVE
): ValidationResult => {
  const allErrors: ValidationError[] = [];

  allErrors.push(...validateWorkflowMetadata(workflowName, workflowDescription));
  allErrors.push(...validateEmptyWorkflow(nodes));

  if (nodes.length > 1) {
    nodes.forEach((node) => {
      if (node.type === NODE_TYPES.EVENT) {
        allErrors.push(...validateEventNode(node, mode));
      } else if (node.type === NODE_TYPES.STATUS) {
        allErrors.push(...validateStatusNode(node));
      }
    });

    allErrors.push(...validateConnectivity(nodes, edges, mode));
    allErrors.push(...validateReachability(nodes, edges));
    allErrors.push(...detectCycles(nodes, edges));
  }

  const errors = allErrors.filter((e) => e.severity === ValidationErrorSeverity.ERROR);
  const warnings = allErrors.filter((e) => e.severity === ValidationErrorSeverity.WARNING);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
