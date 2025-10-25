# Pipeline Management Framework - Replit Setup

## Project Overview
This is a React + TypeScript workflow management application built with Vite, Material-UI, and React Flow. It allows users to visualize and manage workflows and entities through an intuitive single-view system with a StartNode component and advanced node type system.

## Current Setup
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Libraries**: Material-UI, Radix UI components, shadcn-ui, Lucide React
- **Routing**: React Router DOM 6.30.1
- **Visualization**: React Flow (@xyflow/react)
- **Styling**: Tailwind CSS + SCSS (sass-embedded)

## Recent Changes (October 25, 2025)
- ✅ **Complete Codebase Refactor**: Implemented new architecture based on user's repository structure
- ✅ **New Node Type System**: Replaced old node types with START, STATE, EVENT constants
- ✅ **StartNode Component**: Added non-removable start node that initializes workflows
  - Default position at (150, 200)
  - Ghost edge indicator when no nodes connected (dashed line SVG)
  - Supports bidirectional connections with EVENT nodes
  - Cannot be deleted or selected for editing
  - Ghost edge automatically shows/hides based on connection state
- ✅ **Bidirectional Connection System**: Full manual connection support with visual feedback
  - **Valid Connections**:
    - State ↔ Event (bidirectional)
    - Start ↔ Event (bidirectional)
  - **Invalid Connections** (prevented):
    - State ↔ State
    - Start ↔ State
    - Event ↔ Event
    - Duplicate connections between same nodes
  - **Visual Feedback**: During connection dragging
    - Valid targets highlight in **green** (larger handles)
    - Invalid targets show **grayed out** with reduced opacity
    - Clear visual distinction for easier connection creation
- ✅ **Updated Node Components**:
  - `StartNode.tsx` - Bidirectional support, target handle, visual feedback
  - `StateNode.tsx` - Enhanced handles with connection state styling
  - `EventNode.tsx` - Supports connections to/from State and Start nodes
- ✅ **SCSS Styling System**: Added CreateWorkflow.scss with:
  - Button mixins (primary-button, secondary-button)
  - Input field styles
  - Transition block styling
  - Stage node styles
- ✅ **New Type Definitions**: Created `src/models/singleView/nodeTypes.ts`
  - FlowNode, CreateWorkflowNode, CreateWorkflowEdge interfaces
  - NODE_TYPES constants (START, STATE, EVENT)
  - Connection, HierarchicalOption types
- ✅ **Icon System**: Created `src/assets/index.tsx` with Lucide React icons
  - ArrowSymbol, SignBadge, ChevronDoubleUp, TrashIcon, DragReorder
- ✅ **Import Path Resolution**: Updated all imports to use `@/` alias for consistency
- ✅ **Dependencies Added**:
  - `sass-embedded` for SCSS support
  - `lucide-react` for icon components

## Recent Changes (October 17, 2025)
- ✅ **Duplicate Node Prevention & Alternating Pattern Enforcement**:
  - Enforces alternating Transition Block ↔ State pattern when auto-positioning is enabled
  - When auto-positioning is ON:
    - After adding Transition Block → only State palette enabled (to create connection)
    - After adding State → only Transition Block palette enabled (to create connection)
    - Ensures proper workflow structure with alternating nodes
  - When auto-positioning is OFF: allows adding multiple nodes of any type
  - Disabled palette items show visual feedback: grayed out with reduced opacity and cursor-not-allowed
  - Implementation: lastNodeType (rightmost node by X position) passed from CreateWorkflow to Sidebar component

## Recent Changes (October 11, 2025)
- ✅ **2-Step Wizard Node Editor**:
  - **Step 1 - Transition Panel**: Business Event(s) dropdown (hierarchical), Condition dropdown, Trigger checkboxes (Automatic/External) - Next button only
  - **Step 2 - Details**: Business Event Name (text input), Focal Entity (dropdown), Description (textarea), Created Entities (dropdown with Advanced Select), Modified Entities (dropdown with Advanced Select) - Previous/Next buttons
  - Rounded button styling (rounded-full)
  - Per-node state persistence across wizard steps
  - **Wizard Step Reset Fix**: Added useEffect to reset currentStep to TRANSITION_PANEL whenever selectedNode changes, ensuring wizard always starts on Step 1 when switching between nodes
  - Separate state fields: businessEvent (Step 1 dropdown) vs businessEventName (Step 2 text), condition (Step 1 dropdown) vs description (Step 2 textarea)
  - **Dynamic Next/Done Button Logic**: Button text adapts based on workflow context
    - Transition Blocks: Step 1 always shows "Next", Step 2 shows "Next" if connected node exists, "Done" if workflow ends
    - State Nodes: Shows "Next" if connected node exists, "Done" if workflow ends
    - Button label matches action (no label/action mismatches)
  - **Tag Display for Selected Items**: Visual feedback for selections
    - Business Events: Shows selected event as green tag with ✕ remove button
    - Created Entities: Shows all selected entities as individual green tags with remove buttons
    - Modified Entities: Shows all selected entities as individual green tags with remove buttons
    - Tags appear above dropdowns, clicking ✕ removes selection

## Project Architecture
### Frontend Structure
- **Pages**: Index (landing), View, NotFound
- **Models**: Type definitions and interfaces
  - `src/models/singleView/nodeTypes.ts` - Core node and edge type definitions
- **Assets**: Icon components
  - `src/assets/index.tsx` - Lucide React icon exports
- **Workflow Components** (Modular Structure):
  - `src/components/workflow/create/`
    - `CreateWorkflow.tsx` - Main orchestrating component managing all state
    - `CreateWorkflow.scss` - SCSS styling for workflow components
    - `Sidebar.tsx` - Workflow metadata form & component palette
    - `Canvas.tsx` - React Flow canvas with highlighting & interactions
    - `NodeEditorSidebar.tsx` - Node editing panel with 2-step wizard
    - `nodes/` - Custom node components
      - `StartNode.tsx` - Non-removable workflow start node
      - `StateNode.tsx` - State/Stage node (circular)
      - `EventNode.tsx` - Transition Block node (rectangular)
  - `WorkflowManager.tsx` - Workflow visualization and viewing
- **Utils**: Layout utilities and workflow data management
- **Hooks**: Mobile detection and HTTP data management

### Key Files
- `vite.config.ts`: Configured for Replit with proxy bypass, `@/` alias for src
- `src/App.tsx`: Main routing configuration (imports CreateWorkflow)
- `src/components/workflow/create/CreateWorkflow.tsx`: Main workflow creation component
- `src/models/singleView/nodeTypes.ts`: Type definitions for nodes, edges, and connections
- `src/assets/index.tsx`: Icon component exports
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

## Technical Notes
- **Import Paths**: All imports use `@/` alias (e.g., `@/models/singleView/nodeTypes`)
- **SCSS Deprecations**: Using modern Sass, some legacy functions (darken) show warnings
- **Node Type Validation**: Connection validation enforces START → EVENT → STATE → EVENT pattern
- **Ghost Edge Feature**: Start node shows visual indicator when no nodes are connected
- **Auto-positioning Origin**: Start node is fixed at (150, 200), new nodes branch from this position

## User Preferences
- Prefers React with TypeScript for frontend development
- Uses modern UI component libraries (Material-UI, Radix UI, Lucide React)
- Workflow visualization is a key feature requirement
- SCSS for component styling with Tailwind for utility classes
