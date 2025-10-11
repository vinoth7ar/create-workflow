# Pipeline Management Framework - Replit Setup

## Project Overview
This is a React + TypeScript workflow management application built with Vite, Material-UI, and React Flow. It allows users to visualize and manage workflows and entities through an intuitive single-view system.

## Current Setup
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Libraries**: Material-UI, Radix UI components, shadcn-ui
- **Routing**: React Router DOM 6.30.1
- **Visualization**: React Flow (@xyflow/react)
- **Styling**: Tailwind CSS

## Recent Changes (October 8, 2025)
- ✅ **Major Refactoring**: Restructured workflow editor into modular architecture following CreateWorkflow pattern
- ✅ Separated concerns into focused components:
  - `CreateWorkflow.tsx` - Main orchestrating component
  - `Sidebar.tsx` - Workflow metadata & component palette
  - `Canvas.tsx` - React Flow visualization
  - `NodeEditorSidebar.tsx` - Node property editor
  - Extracted node components to `nodes/` folder (StateNode, EventNode)
- ✅ Fixed manual node dragging when auto-positioning is disabled
- ✅ Maintained all existing functionality: real-time updates, highlighting, auto-positioning, save/publish
- ✅ **Dynamic Sidebar Implementation** (based on Figma specs):
  - NodeEditorSidebar now renders different forms based on node type:
    - Transition Block (event): Business Events dropdown (hierarchical), Condition dropdown (All Of/One Of/None), Trigger checkboxes, Entity selectors
    - State Node (state): Simple State Name text input
- ✅ **Connection Validation**:
  - Implemented isValidConnection logic to only allow valid connections (Transition Block ↔ State)
  - Prevents invalid node pairings
- ✅ **Dynamic Visual Feedback**:
  - Connection handles are gray by default
  - Handles turn green only for valid connection targets during drag
  - Invalid targets remain gray
  - Green connection line for valid connections
  - Connection state tracking via onConnectStart/onConnectEnd handlers
- ✅ **Per-Node State Persistence**:
  - Each node stores configuration in node.data object (businessEvent, condition, triggers, entities)
  - currentNodeData derived from nodes array using selectedNode.id for real-time synchronization
  - Switching nodes loads their saved configuration
  - Human-readable labels stored for display (not internal IDs)
- ✅ **Hierarchical Components Enhanced**:
  - All dropdowns use HierarchicalSelect/MultiSelect
  - "+ Create New" button functional in all hierarchical dropdowns
  - onCreateNew callback wired through CreateWorkflow → NodeEditorSidebar → Components
  - Select All with intelligent toggle behavior (all selected → clears, not all → selects all)
- ✅ **Single-Page Node Editor** (October 11, 2025):
  - Replaced multi-step wizard with single-page form matching Figma design
  - All fields visible at once: Business Event Name, Focal Entity, Description, Created Entities, Modified Entities
  - Advanced Select links for entity selectors
  - Previous/Next buttons with rounded styling

## Previous Changes (September 30, 2025)
- ✅ Consolidated create/edit functionality into single component (WorkflowEditor.tsx)
- ✅ Removed unnecessary Editor.tsx wrapper page for cleaner architecture
- ✅ Implemented real-time node editor updates without "Next" button
- ✅ Added immediate reflection of dropdown changes on canvas
- ✅ Fixed plus icon positioning (8px from nodes) with gray colors
- ✅ Implemented consistent node sizing (40x40px for both types)
- ✅ Fixed auto-positioning logic (250px spacing when ON, random when OFF)

## Previous Changes (September 29, 2025)
- ✅ Successfully configured Vite for Replit environment
- ✅ Set proper host configuration (`0.0.0.0:5000`)
- ✅ Added `allowedHosts: true` to bypass host header verification for Replit proxy
- ✅ Configured polling-based file watching to avoid ENOSPC errors
- ✅ Set up frontend workflow on port 5000
- ✅ Configured deployment for autoscale with build and preview commands

## Project Architecture
### Frontend Structure
- **Pages**: Index (landing), View, NotFound
- **Workflow Components** (Modular Structure):
  - `src/components/workflow/create/`
    - `CreateWorkflow.tsx` - Main orchestrating component managing all state
    - `Sidebar.tsx` - Workflow metadata form & component palette
    - `Canvas.tsx` - React Flow canvas with highlighting & interactions
    - `NodeEditorSidebar.tsx` - Node editing panel with real-time updates
    - `nodes/` - Custom node components (StateNode, EventNode)
  - `WorkflowManager.tsx` - Workflow visualization and viewing
- **Utils**: Layout utilities and workflow data management
- **Hooks**: Mobile detection and HTTP data management

### Key Files
- `vite.config.ts`: Configured for Replit with proxy bypass
- `src/App.tsx`: Main routing configuration (imports CreateWorkflow)
- `src/components/workflow/create/CreateWorkflow.tsx`: Main workflow creation component
- `src/pages/`: Application pages (Index, View, NotFound)

## Development Workflow
- **Start Development**: Workflow "Start application" runs `npm run dev`
- **Port**: Frontend serves on port 5000 (required for Replit)
- **Build**: Uses `npm run build` for production builds
- **Preview**: Uses `npm run preview` for production preview

## Deployment Configuration
- **Target**: Autoscale (stateless frontend application)
- **Build Command**: `npm run build`
- **Run Command**: `npm run preview`

## User Preferences
- Prefers React with TypeScript for frontend development
- Uses modern UI component libraries (Material-UI, Radix UI)
- Workflow visualization is a key feature requirement