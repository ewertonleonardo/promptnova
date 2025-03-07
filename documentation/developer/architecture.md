# PromptNova Architecture Documentation

## Overview

PromptNova is an Electron-based application designed to provide efficient prompt management with a floating interface. The application follows a modular architecture with clear separation between the main and renderer processes, utilizing React and Tailwind CSS for the UI components.

## Application Architecture

### Main Process

The main process handles system-level operations and serves as the bridge between the operating system and the renderer process.

#### Core Components

- **Entry Point (`/src/main/index.ts`)**: Initializes the Electron application and sets up the main window
- **IPC Handlers (`/src/main/ipc/`)**: Manages inter-process communication between main and renderer processes
- **System Managers**:
  - `ShortcutManager`: Handles global keyboard shortcuts
  - `WindowManager`: Manages application windows
  - `FileSystemManager`: Handles file system operations
  - `ClipboardManager`: Manages clipboard operations
- **Plugin System (`/src/main/plugins/`)**: Infrastructure for extending application functionality
- **Storage (`/src/main/storage/`)**: Data persistence implementations
- **Error Handling (`/src/main/utils/ErrorHandler.ts`)**: Centralized error processing

### Renderer Process

The renderer process is responsible for the user interface and user interactions.

#### Core Components

- **Entry Point (`/src/renderer/index.tsx`)**: Initializes the React application
- **Components (`/src/renderer/components/`)**: UI components organized by functionality
  - `prompt/`: Prompt management components
  - `workspace/`: Workspace management components
  - `context/`: Context code integration components
  - `plugins/`: Plugin-related components
  - `common/`: Shared UI components
  - `layout/`: Layout components including the floating panel
- **Hooks (`/src/renderer/hooks/`)**: Custom React hooks for state management
- **Styles (`/src/renderer/styles/`)**: CSS and styling utilities

### Shared Resources

Resources shared between main and renderer processes.

- **Models (`/src/shared/models/`)**: Data models for prompts and workspaces
- **IPC Types (`/src/shared/ipc-types.ts`)**: Type definitions for IPC messages
- **Utilities (`/src/shared/utils/`)**: Shared utility functions
  - `placeholder.ts`: Placeholder detection and management
  - `importExport.ts`: Import/export utilities
  - `fileProcessing.ts`: File processing utilities
  - `codeProcessing.ts`: Code processing utilities
  - `commentStripping.ts`: Comment removal utilities

## Key Workflows

### Prompt Management

1. User creates/edits prompts through the PromptEditor component
2. Prompts are categorized and stored via the storage adapter
3. Placeholders are detected and managed through the placeholder system

### Prompt Activation

1. User triggers the application via global shortcut (managed by ShortcutManager)
2. Floating window appears (managed by WindowManager)
3. User selects a prompt and fills placeholders
4. Processed prompt is inserted at the cursor position via ClipboardManager

### Context Code Integration

1. User drags files into the FileDropZone component
2. Files are processed by fileProcessing utilities
3. Processed code is previewed and can be included in prompts

### Workspace Management

1. User selects or creates workspaces via WorkspaceSelector
2. Workspace settings are configured through WorkspaceSettings
3. Workspace-specific prompts and settings are loaded

## Data Flow

### Storage

The application uses a local storage adapter for data persistence:

1. Data models (Prompt, Workspace) define the structure
2. StorageAdapter provides the interface for data operations
3. LocalStorage implements the actual storage mechanism

### IPC Communication

Communication between main and renderer processes follows this pattern:

1. Renderer process sends requests via IPC
2. Main process handles requests through registered IPC handlers
3. Results are returned to the renderer process

## Plugin System

The plugin system allows for extending application functionality:

1. PluginManager handles plugin lifecycle (loading, enabling, disabling)
2. PluginInterface defines the API for plugins
3. PluginStore provides UI for discovering and managing plugins

## Error Handling

The application implements comprehensive error handling:

1. Central error processing in ErrorHandler
2. React error boundaries for UI errors
3. IPC error reporting for cross-process errors

## Build and Distribution

The application uses Electron Builder for packaging and distribution:

1. Configuration in `/build/electron-builder.yml`
2. CI/CD workflow in `/.github/workflows/build.yml`
3. Build scripts in `/scripts/build.js`

## Development Guidelines

### Code Style

The project uses ESLint and Prettier for code formatting and linting:

1. ESLint configuration in `/.eslintrc.js`
2. Prettier configuration in `/.prettierrc`

### TypeScript

TypeScript is used for type safety:

1. Configuration in `/tsconfig.json`

### Testing

Jest is used for testing:

1. Configuration in `/jest.config.js`

## Accessibility

Accessibility features are implemented through:

1. Accessibility components in `/src/renderer/components/common/A11y.tsx`
2. Accessibility hooks in `/src/renderer/hooks/useA11y.ts`
3. Accessibility styles in `/src/renderer/styles/a11y.css`

This architecture documentation provides an overview of the PromptNova application structure and components. For more detailed information on specific components or workflows, please refer to the code documentation and comments.
