import { CreateWorkflowNode, CreateWorkflowEdge, NODE_TYPES } from '@/models/singleView/nodeTypes';

/**
 * Fallback node dimensions if actual measurements aren't available
 */
const FALLBACK_DIMENSIONS = {
  [NODE_TYPES.START]: { width: 120, height: 60 },
  [NODE_TYPES.STATUS]: { width: 180, height: 120 },
  [NODE_TYPES.EVENT]: { width: 200, height: 100 },
};

/**
 * Spacing configuration for compact layout
 */
const SPACING = {
  horizontalGap: 80, // Base horizontal gap between columns
  verticalGap: 60, // Base vertical gap between nodes in same column
  minPadding: 50, // Minimum padding from edges
};

interface NodeLevel {
  id: string;
  level: number;
  verticalIndex: number;
}

/**
 * Get actual or fallback dimensions for a node
 */
const getNodeDimensions = (node: CreateWorkflowNode): { width: number; height: number } => {
  // Try to get actual dimensions from React Flow (these get added at runtime)
  const nodeWithDims = node as CreateWorkflowNode & { width?: number; height?: number };

  if (nodeWithDims.width && nodeWithDims.height) {
    return { width: nodeWithDims.width, height: nodeWithDims.height };
  }

  // Fallback to type-based dimensions
  const fallback = FALLBACK_DIMENSIONS[node.type as keyof typeof FALLBACK_DIMENSIONS];
  return fallback || { width: 150, height: 80 };
};

/**
 * Calculate node levels using DIRECTED BFS from start node
 */
const calculateNodeLevels = (
  nodes: CreateWorkflowNode[],
  edges: CreateWorkflowEdge[]
): Map<string, NodeLevel> => {
  const levels = new Map<string, NodeLevel>();
  const startNode = nodes.find((n) => n.type === NODE_TYPES.START);

  if (!startNode) return levels;

  // Directed BFS to assign levels (only follow edge direction)
  const queue: Array<{ id: string; level: number }> = [{ id: startNode.id, level: 0 }];
  const visited = new Set<string>();
  const levelGroups = new Map<number, string[]>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;

    visited.add(current.id);

    // Add to level group
    if (!levelGroups.has(current.level)) {
      levelGroups.set(current.level, []);
    }
    levelGroups.get(current.level)!.push(current.id);

    // Find OUTGOING edges only (directed)
    const outgoingEdges = edges.filter((e) => e.source === current.id);

    outgoingEdges.forEach((edge) => {
      const nextId = edge.target;
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, level: current.level + 1 });
      }
    });
  }

  // Handle disconnected/orphaned nodes (not reachable from start)
  const orphanedNodes = nodes.filter((n) => !visited.has(n.id));
  if (orphanedNodes.length > 0) {
    const maxLevel = Math.max(...Array.from(levelGroups.keys()), -1);
    const orphanLevel = maxLevel + 1;

    if (!levelGroups.has(orphanLevel)) {
      levelGroups.set(orphanLevel, []);
    }

    orphanedNodes.forEach((node) => {
      levelGroups.get(orphanLevel)!.push(node.id);
      visited.add(node.id);
    });
  }

  // Assign vertical indices within each level
  levelGroups.forEach((nodeIds, level) => {
    nodeIds.forEach((id, index) => {
      levels.set(id, { id, level, verticalIndex: index });
    });
  });

  return levels;
};

/**
 * Calculate tree-style positions for nodes with horizontal spreading
 * Creates a pyramid/tree structure with proper centering
 */
export const calculateCompactLayout = (
  nodes: CreateWorkflowNode[],
  edges: CreateWorkflowEdge[]
): CreateWorkflowNode[] => {
  if (nodes.length === 0) return nodes;

  // Defensive check: if no START node exists, return nodes unchanged
  const startNode = nodes.find((n) => n.type === NODE_TYPES.START);
  if (!startNode) return nodes;

  const nodeLevels = calculateNodeLevels(nodes, edges);

  // Group nodes by level
  const levelGroups = new Map<number, CreateWorkflowNode[]>();
  nodes.forEach((node) => {
    const levelInfo = nodeLevels.get(node.id);
    if (!levelInfo) return;

    if (!levelGroups.has(levelInfo.level)) {
      levelGroups.set(levelInfo.level, []);
    }
    levelGroups.get(levelInfo.level)!.push(node);
  });

  const updatedNodes: CreateWorkflowNode[] = [];
  const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);

  // Calculate vertical positions and widths for each level
  let currentY = SPACING.minPadding;
  const levelYPositions = new Map<number, number>();
  const levelWidths = new Map<number, number>();

  sortedLevels.forEach((level) => {
    const nodesInLevel = levelGroups.get(level)!;
    
    // Find max height in this level
    const maxHeight = Math.max(
      ...nodesInLevel.map((n) => getNodeDimensions(n).height)
    );

    // Calculate total width for this level
    const totalWidth = nodesInLevel.reduce((sum, node) => {
      return sum + getNodeDimensions(node).width;
    }, 0);
    const totalGaps = (nodesInLevel.length - 1) * SPACING.horizontalGap * 1.5;
    const levelWidth = totalWidth + totalGaps;

    levelYPositions.set(level, currentY);
    levelWidths.set(level, levelWidth);
    currentY += maxHeight + SPACING.verticalGap * 2; // Increased vertical spacing
  });

  // Find the maximum width to center all levels
  const maxLevelWidth = Math.max(...Array.from(levelWidths.values()));
  const canvasWidth = maxLevelWidth + SPACING.minPadding * 4;

  // Position nodes with centering for pyramid effect
  sortedLevels.forEach((level) => {
    const nodesInLevel = levelGroups.get(level)!;
    const levelY = levelYPositions.get(level)!;
    const levelWidth = levelWidths.get(level)!;

    // Center this level horizontally
    const startX = (canvasWidth - levelWidth) / 2;
    let currentX = startX;

    // Position each node horizontally in this level
    nodesInLevel.forEach((node) => {
      const dims = getNodeDimensions(node);

      updatedNodes.push({
        ...node,
        position: {
          x: currentX,
          y: levelY,
        },
      });

      currentX += dims.width + SPACING.horizontalGap * 1.5;
    });
  });

  return updatedNodes;
};

/**
 * Apply compact layout with smooth animation
 */
export const applyCompactLayout = (
  nodes: CreateWorkflowNode[],
  edges: CreateWorkflowEdge[],
  setNodes: (nodes: CreateWorkflowNode[]) => void
): void => {
  const compactNodes = calculateCompactLayout(nodes, edges);
  setNodes(compactNodes);
};
