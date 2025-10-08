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