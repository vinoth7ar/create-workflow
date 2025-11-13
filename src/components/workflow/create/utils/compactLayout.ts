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
  horizontalGap: 160, // Horizontal gap between columns
  verticalGap: 80, // Vertical gap between child nodes
  minPadding: 100, // Minimum padding from edges
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
 * Track occupied vertical space in each column for collision detection
 */
interface OccupiedBand {
  minY: number;
  maxY: number;
}

/**
 * Calculate horizontal growth layout with parent-relative child positioning
 * - Grows left-to-right in columns
 * - Single child: same Y as parent
 * - Multiple children: distributed above/below parent
 */
export const calculateCompactLayout = (
  nodes: CreateWorkflowNode[],
  edges: CreateWorkflowEdge[]
): CreateWorkflowNode[] => {
  if (nodes.length === 0) return nodes;

  const startNode = nodes.find((n) => n.type === NODE_TYPES.START);
  if (!startNode) return nodes;

  const nodeLevels = calculateNodeLevels(nodes, edges);
  const nodePositions = new Map<string, { x: number; y: number }>();
  const occupiedBands = new Map<number, OccupiedBand[]>();

  // Find max width in each level for X positioning
  const levelMaxWidths = new Map<number, number>();
  nodes.forEach((node) => {
    const levelInfo = nodeLevels.get(node.id);
    if (!levelInfo) return;
    const dims = getNodeDimensions(node);
    const currentMax = levelMaxWidths.get(levelInfo.level) || 0;
    levelMaxWidths.set(levelInfo.level, Math.max(currentMax, dims.width));
  });

  // Calculate X positions for each level (columns)
  const levelXPositions = new Map<number, number>();
  let currentX = SPACING.minPadding;
  const sortedLevels = Array.from(levelMaxWidths.keys()).sort((a, b) => a - b);
  sortedLevels.forEach((level) => {
    levelXPositions.set(level, currentX);
    const maxWidth = levelMaxWidths.get(level) || 150;
    currentX += maxWidth + SPACING.horizontalGap;
  });

  // Helper: Get children of a node
  const getChildren = (nodeId: string): CreateWorkflowNode[] => {
    const childEdges = edges.filter((e) => e.source === nodeId);
    return childEdges.map((e) => nodes.find((n) => n.id === e.target)).filter(Boolean) as CreateWorkflowNode[];
  };

  // Helper: Find minimum Y that avoids ALL collisions in a column (iterative)
  const findAvailableY = (level: number, preferredY: number, height: number): number => {
    if (!occupiedBands.has(level)) {
      return preferredY;
    }

    const bands = occupiedBands.get(level)!;
    let candidateY = preferredY;

    // Iteratively find collision-free position
    // Will always terminate because candidateY monotonically increases
    while (true) {
      const proposedMinY = candidateY;
      const proposedMaxY = candidateY + height;

      // Check for collisions with ANY existing band
      let hasCollision = false;
      let maxConflictY = 0;

      for (const band of bands) {
        // Check overlap: A overlaps B if (A.min <= B.max AND A.max >= B.min)
        if (proposedMinY <= band.maxY && proposedMaxY >= band.minY) {
          hasCollision = true;
          maxConflictY = Math.max(maxConflictY, band.maxY);
        }
      }

      // If no collision, we found a valid position
      if (!hasCollision) {
        return candidateY;
      }

      // Collision detected: shift down and re-check
      candidateY = maxConflictY + SPACING.verticalGap;
    }
  };

  // Helper: Add occupied band after positioning
  const trackOccupiedBand = (level: number, minY: number, maxY: number): void => {
    if (!occupiedBands.has(level)) {
      occupiedBands.set(level, []);
    }
    occupiedBands.get(level)!.push({ minY, maxY });
  };

  // BFS traversal to position nodes
  const queue: string[] = [startNode.id];
  const visited = new Set<string>();

  // Position START node
  const startDims = getNodeDimensions(startNode);
  const startY = SPACING.minPadding * 2;
  nodePositions.set(startNode.id, { x: SPACING.minPadding, y: startY });
  trackOccupiedBand(0, startY, startY + startDims.height);
  visited.add(startNode.id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = nodes.find((n) => n.id === currentId);
    if (!currentNode) continue;

    const currentPos = nodePositions.get(currentId)!;
    const currentDims = getNodeDimensions(currentNode);
    const currentLevel = nodeLevels.get(currentId)?.level || 0;
    const children = getChildren(currentId);

    if (children.length === 0) continue;

    const childLevel = currentLevel + 1;
    const childX = levelXPositions.get(childLevel) || 0;

    // Filter out children that have already been positioned (multi-parent scenario)
    const unpositionedChildren = children.filter((c) => !visited.has(c.id));

    if (unpositionedChildren.length === 0) {
      // All children already positioned by other parents, add them to queue
      children.forEach((child) => {
        if (!visited.has(child.id)) {
          queue.push(child.id);
          visited.add(child.id);
        }
      });
      continue;
    }

    if (unpositionedChildren.length === 1) {
      // Single child: prefer parent Y axis but avoid collisions
      const child = unpositionedChildren[0];
      const childDims = getNodeDimensions(child);
      const preferredY = currentPos.y;

      // Find available Y (shifts minimally if collision)
      const childY = findAvailableY(childLevel, preferredY, childDims.height);
      nodePositions.set(child.id, { x: childX, y: childY });
      trackOccupiedBand(childLevel, childY, childY + childDims.height);

      if (!visited.has(child.id)) {
        queue.push(child.id);
        visited.add(child.id);
      }
    } else {
      // Multiple children: distribute above and below parent
      const childDims = unpositionedChildren.map((c) => getNodeDimensions(c));
      const totalHeight = childDims.reduce((sum, d) => sum + d.height, 0);
      const totalGaps = (unpositionedChildren.length - 1) * SPACING.verticalGap;
      const clusterHeight = totalHeight + totalGaps;

      // Center cluster around parent Y
      const parentCenterY = currentPos.y + currentDims.height / 2;
      const preferredClusterY = parentCenterY - clusterHeight / 2;

      // Find available Y for entire cluster (shifts to avoid collisions)
      let childY = findAvailableY(childLevel, preferredClusterY, clusterHeight);

      // Position each child and track their bands
      unpositionedChildren.forEach((child, index) => {
        const dims = childDims[index];
        nodePositions.set(child.id, { x: childX, y: childY });
        trackOccupiedBand(childLevel, childY, childY + dims.height);
        childY += dims.height + SPACING.verticalGap;

        if (!visited.has(child.id)) {
          queue.push(child.id);
          visited.add(child.id);
        }
      });
    }
  }

  // Handle orphaned nodes
  const orphanedNodes = nodes.filter((n) => !visited.has(n.id));
  orphanedNodes.forEach((node) => {
    const levelInfo = nodeLevels.get(node.id);
    if (!levelInfo) return;

    const x = levelXPositions.get(levelInfo.level) || SPACING.minPadding;
    const dims = getNodeDimensions(node);
    const preferredY = SPACING.minPadding;

    const y = findAvailableY(levelInfo.level, preferredY, dims.height);
    nodePositions.set(node.id, { x, y });
    trackOccupiedBand(levelInfo.level, y, y + dims.height);
  });

  // Create updated nodes with new positions
  return nodes.map((node) => {
    const pos = nodePositions.get(node.id);
    if (!pos) return node;

    return {
      ...node,
      position: pos,
    };
  });
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
