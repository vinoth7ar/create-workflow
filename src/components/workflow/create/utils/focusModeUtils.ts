/**
 * MODULAR UTILITY: Focus Mode for Graph
 * Copy-paste these utilities to implement graph focus mode
 * that centers and makes the graph prominently visible
 */

import { Node, Edge, ReactFlowInstance } from '@xyflow/react';

/**
 * Calculate the center and zoom level to make all nodes prominently visible
 * This is more aggressive than fitView - it zooms in more and centers better
 */
export const calculateFocusViewport = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }

  // Calculate bounds of all nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const nodeWidth = 200; // Approximate node width
    const nodeHeight = 100; // Approximate node height

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  // Calculate center point
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Calculate width and height of the bounding box
  const width = maxX - minX;
  const height = maxY - minY;

  // Calculate zoom level to fit content with more aggressive zoom (less padding)
  // This makes the graph more prominent than standard fitView
  const padding = 50; // Less padding for more prominent view
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const zoomX = (viewportWidth - padding * 2) / width;
  const zoomY = (viewportHeight - padding * 2) / height;
  const zoom = Math.min(zoomX, zoomY, 1.5); // Max zoom of 1.5 for better visibility

  return {
    x: viewportWidth / 2 - centerX * zoom,
    y: viewportHeight / 2 - centerY * zoom,
    zoom: Math.max(zoom, 0.5), // Minimum zoom of 0.5
  };
};

/**
 * Apply focus mode to ReactFlow instance
 * Centers the graph and makes it prominently visible
 */
export const applyFocusMode = (
  reactFlowInstance: ReactFlowInstance | null,
  nodes: Node[],
  edges: Edge[]
) => {
  if (!reactFlowInstance) return;

  const viewport = calculateFocusViewport(nodes, edges);

  reactFlowInstance.setViewport(
    {
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    },
    { duration: 500 } // Smooth animation
  );
};

/**
 * Get CSS classes for focus mode overlay
 * Hides UI elements when focus mode is active
 */
export const getFocusModeClasses = (isFocusMode: boolean) => ({
  overlay: isFocusMode
    ? 'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300'
    : 'hidden',
  canvas: isFocusMode
    ? 'relative z-50 shadow-2xl ring-4 ring-blue-500 transition-all duration-300'
    : 'transition-all duration-300',
  hiddenElements: isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100',
});
