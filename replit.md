# Pipeline Management Framework

## Overview
This project is a React + TypeScript workflow management application designed to visualize and manage workflows and entities through an intuitive single-view system. It features a `StartNode` component and an advanced node type system for defining workflow structures. The application aims to provide a comprehensive tool for workflow creation, validation, and visualization, targeting efficient pipeline management. Key capabilities include advanced validation, interactive canvas manipulation, and a modular component architecture.

## User Preferences
- Prefers React with TypeScript for frontend development
- Uses modern UI component libraries (Material-UI, Radix UI, Lucide React)
- Workflow visualization is a key feature requirement
- SCSS for component styling with Tailwind for utility classes

## System Architecture
The frontend is built with React 18.3.1 and TypeScript, utilizing Vite 5.4.19 as the build tool. UI components are drawn from Material-UI, Radix UI, and shadcn-ui, with Lucide React for icons. Routing is handled by React Router DOM 6.30.1, and workflow visualization is powered by React Flow (`@xyflow/react`). Styling combines Tailwind CSS with SCSS (`sass-embedded`).

**UI/UX Decisions:**
- **Node Editor Sidebar Controls:** Three control buttons on the sidebar header:
  1. **Collapse Button:** ChevronLeft (expanded) / ChevronRight (collapsed) icon toggles **bidirectional collapse** with smooth 300ms transition. Collapses both width (21rem → 3rem) AND height (100% → 4rem). When collapsed and not dragged, positions itself at bottom-right corner (bottom: 5rem, right: 1rem). Maintains user-dragged position through collapse/expand cycles.
  2. **Drag Handle:** Middle button allows users to drag and reposition the entire sidebar anywhere on the screen. Uses fixed positioning and getBoundingClientRect() for smooth dragging without position jumps. Works in both expanded and collapsed states.
  3. **Delete Button:** TrashIcon removes the selected node.
- **Focus Mode Button:** Fixed-position button (bottom-right corner) with Maximize2/Minimize2 icons. Toggles hiding all sidebars (left builder sidebar and right node editor) to focus only on the graph canvas. Canvas maintains explicit dimensions (min-h-0 flex container with absolute positioned wrapper) to prevent white screen issues.
- **Canvas Maximization:** `fitView` functionality to optimize graph visibility with smooth animation and padding.
- **Validation Error Banner:** Fixed top banner with node-grouped error navigation showing one error per node, progress indicator (Error 1 of 5), Previous/Next buttons, dot navigation for jumping to specific errors, info icon popup displaying all issues for current node, auto-focus on first error, and mild red/yellow styling (red-50/yellow-50 backgrounds). Auto-dismisses when user makes any edits (node data, adding nodes, workflow metadata).
- **Error Highlighting on Canvas:** Visual feedback for validation errors using shape-matching borders (4px solid red). Rectangular border for `EVENT` nodes, circular border for `STATUS` nodes to match their intrinsic shapes. Borders automatically clear when error state ends.
- **Node Positioning:** Smart vertical positioning that alternates new nodes above and below the source, collision detection to prevent overlaps, and optimized horizontal/vertical spacing.
- **Drag & Drop:** Nodes are draggable when drag toggle is enabled, with smart positioning logic for nodes dropped from the palette, including vertical variation and collision detection.
- **Auto-Display Edit Forms:** New nodes automatically open the `NodeEditorSidebar` and are selected.
- **Connection Visualization:** Valid connection targets highlight in green, while invalid targets are grayed out.
- **Ghost Edge:** `StartNode` displays a dashed "ghost edge" when no nodes are connected.

**Technical Implementations:**
- **Comprehensive Workflow Validation:** Sixteen validation scenarios covering workflow metadata, node completeness, connectivity, and reachability. Supports `SAVE` (lenient) and `PUBLISH` (strict) modes with grouped error navigation through top banner. Errors grouped by node to show one message per node, with info popup to view all individual issues. Error messages use default node names (Stage, Stage1, Transition Block) instead of generic "Unnamed" labels for clarity.
- **Node Type System:** Replaced old node types with `START`, `STATUS` (formerly `STATE`), and `EVENT` constants.
- **`StartNode` Component:** A non-removable node that initializes workflows, supporting bidirectional connections with `EVENT` nodes.
- **Bidirectional Connection System:** Enforces valid connections (e.g., `STATUS` ↔ `EVENT`, `START` ↔ `EVENT`) and prevents invalid ones (e.g., `STATUS` ↔ `STATUS`).
- **SCSS Styling System:** Utilizes `CreateWorkflow.scss` for button mixins, input field styles, and node styling.
- **2-Step Wizard Node Editor:** For `EVENT` nodes, guiding users through `Transition Panel` (business event, condition, trigger) and `Details` (name, focal entity, description, created/modified entities).
- **Auto-Positioning:** Automatically enables when adding nodes via the '+' button and triggers graph realignment.
- **Smart View Fitting:** Canvas automatically centers and zooms on new nodes with smooth animation.

**Feature Specifications:**
- **Workflow Validation:** Includes checks for empty workflow name, incomplete node details, unconnected nodes, dead-end nodes, unreachable nodes, and circular references.
- **Node Type Renaming:** `STATE` node type renamed to `STATUS` across the codebase.
- **Collapsible Node Editor Sidebar:** Allows users to collapse/expand the editing panel for more canvas space.
- **Maximize Canvas Button:** Provides a quick way to fit all nodes into the view.
- **Improved Node Positioning:** Prevents collisions and uses alternating vertical patterns for new nodes.
- **Drag and Drop Functionality:** Nodes are draggable when drag toggle is enabled via the collapsible button panel.
- **Tag Display for Selected Items:** Visual feedback for selected business events, created entities, and modified entities in the editor.
- **Modular Node Editor Controls (Copy-Paste Ready):**
  - `hooks/useNodeEditorControls.ts`: State management for sidebar collapse, drag positioning, and focus mode (59 lines)
  - `components/FocusButton.tsx`: Standalone focus toggle button with Maximize2/Minimize2 icons (25 lines)

**System Design Choices:**
- **Frontend Structure:** Modular design with dedicated folders for pages, models, assets, workflow components (`create/`, `nodes/`, `components/`, `hooks/`, `utils/`), and utilities.
- **Key Files:** `CreateWorkflow.tsx` acts as the main orchestrating component, `nodeTypes.ts` defines core types, and `App.tsx` handles routing.
- **Modular Components:** New features implemented as standalone, copy-paste ready modules in dedicated folders to facilitate cross-repo code sharing.
- **Import Path Resolution:** Uses `@/` alias for consistent imports.
- **Development Workflow:** Standard `npm run dev` for development, `npm run build` for production, and `npm run preview` for production preview.
- **Code Quality:** Enforced via ESLint and Prettier with single quotes, 2-space indentation, and 100-character line width. Zero TypeScript errors and zero ESLint warnings policy.
- **Deployment Target:** Autoscale for stateless frontend applications.

## External Dependencies
- **React Flow:** (`@xyflow/react`) for workflow visualization and interaction.
- **Material-UI:** For UI components.
- **Radix UI:** For additional UI components.
- **shadcn-ui:** For UI components.
- **Lucide React:** For icon components.
- **React Router DOM:** For client-side routing.
- **sass-embedded:** For SCSS support.