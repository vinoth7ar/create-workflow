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

## Recent Changes (September 29, 2025)
- ✅ Successfully configured Vite for Replit environment
- ✅ Set proper host configuration (`0.0.0.0:5000`)
- ✅ Added `allowedHosts: true` to bypass host header verification for Replit proxy
- ✅ Configured polling-based file watching to avoid ENOSPC errors
- ✅ Set up frontend workflow on port 5000
- ✅ Configured deployment for autoscale with build and preview commands

## Project Architecture
### Frontend Structure
- **Pages**: Index (landing), View, Editor, NotFound
- **Components**: Workflow management UI with drag-and-drop capabilities
- **Nodes**: EventNode, StatusNode for workflow visualization
- **Utils**: Layout utilities and workflow data management
- **Hooks**: Mobile detection and HTTP data management

### Key Files
- `vite.config.ts`: Configured for Replit with proxy bypass
- `src/App.tsx`: Main routing configuration
- `src/pages/`: Application pages
- `src/components/`: Reusable UI components and workflow builders

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