## Core System Managers

PromptNova uses several manager classes to handle core system functionality:

### ShortcutManager

Manages global keyboard shortcuts throughout the application, allowing users to trigger actions from anywhere on their system.

**Purpose**: Registers, handles, and manages global keyboard shortcuts for accessing the floating window and executing prompt-related actions.

**Usage**:

```typescript
// Register a global shortcut
shortcutManager.registerShortcut('CommandOrControl+Shift+Space', () => {
  // Show the floating window
  windowManager.toggleFloatingWindow(true);
});
```

### WindowManager

Controls the creation and management of application windows.

**Purpose**: Handles window operations including creating, showing, hiding, and positioning both the main application window and the floating prompt window.

**Usage**:

```typescript
// Create and show the main window
const mainWindow = windowManager.createMainWindow();

// Toggle the floating window
windowManager.toggleFloatingWindow(true); // Show
windowManager.toggleFloatingWindow(false); // Hide
```

### FileSystemManager

Provides an interface for file system operations.

**Purpose**: Handles reading and writing files, managing workspaces, and importing/exporting prompts.

**Usage**:

```typescript
// Save a prompt to the file system
fileSystemManager.savePrompt(promptData);

// Export prompts to a file
fileSystemManager.exportPrompts(prompts, filePath);
```

### ClipboardManager

Manages clipboard operations for copying and pasting content.

**Purpose**: Facilitates copying prompts to the clipboard and inserting them into active applications.

**Usage**:

```typescript
// Copy text to clipboard
clipboardManager.writeText(promptText);

// Read text from clipboard
const text = clipboardManager.readText();

// Check if clipboard has text
if (clipboardManager.hasText()) {
  // Process clipboard content
}
```

## Data Models and Storage System

PromptNova implements a robust data model system for managing prompts and workspaces:

### Prompt Model

Manages individual prompts with validation and utility features.

**Purpose**: Provides a structured way to store and validate prompt data, including title, content, categories, tags, and dynamic placeholders.

**Features**:

- Validation rules for title, content, and tags
- Dynamic placeholder extraction
- JSON serialization support
- Update mechanism for partial data changes

**Usage**:

```typescript
// Create a new prompt
const prompt = new Prompt({
  title: "My Prompt",
  content: "Content with {{placeholder}}",
  tags: ["tag1", "tag2"]
});

// Validate the prompt
const errors = prompt.validate();

// Extract placeholders
const placeholders = prompt.extractPlaceholders();
```

### Workspace Model

Organizes collections of prompts with workspace-level management.

**Purpose**: Provides a container for organizing prompts with workspace-specific metadata and operations.

**Features**:

- Validation rules for workspace properties
- Prompt collection management
- CRUD operations for prompts
- JSON serialization support

**Usage**:

```typescript
// Create a new workspace
const workspace = new Workspace({
  name: "My Workspace",
  description: "A collection of prompts"
});

// Add a prompt to the workspace
workspace.addPrompt(prompt);

// Update a prompt in the workspace
workspace.updatePrompt(promptId, { title: "Updated Title" });
```

## IPC Communication System

PromptNova uses an IPC (Inter-Process Communication) system to facilitate communication between the main Electron process and the renderer process:

### IPC Handlers

The application uses a structured approach to IPC communication through dedicated handler files:

**Purpose**: Enables secure and type-safe communication between the main Electron process and the renderer UI process.

**Files Structure**:

- `/src/main/ipc/index.ts`: Central registration point for all IPC handlers
- `/src/main/ipc/prompt.ts`: Handlers for prompt-related operations
- `/src/main/ipc/workspace.ts`: Handlers for workspace-related operations
- `/src/shared/ipc-types.ts`: Type definitions for IPC messages
- `/src/main/ipc/templates.ts`: Template management handlers
- `/src/shared/models/WorkspaceTemplate.ts`: Template type definitions

**Usage**:

```typescript
// Renderer process: Send a request to the main process
import { ipcRenderer } from 'electron';
import { IPCChannels } from '@/shared/ipc-types';

// Request to save a prompt
const result = await ipcRenderer.invoke(IPCChannels.SAVE_PROMPT, promptData);

// Main process: Handle the request in the appropriate handler
import { ipcMain } from 'electron';
import { IPCChannels } from '@/shared/ipc-types';

// Register the handler
ipcMain.handle(IPCChannels.SAVE_PROMPT, async (event, promptData) => {
  // Process the request and return the result
  return await savePromptToStorage(promptData);
});
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for all notable changes.

## Plugin System Infrastructure

PromptNova implements a plugin system that allows for extensibility and customization:

### PluginManager

Manages the lifecycle and operations of plugins.

**Purpose**: Handles plugin loading, initialization, activation, and deactivation while ensuring secure execution.

**Features**:

- Plugin lifecycle management
- Secure plugin loading and execution
- Plugin state management
- Event system for plugin state changes

**Usage**:

```typescript
// Load and initialize a plugin
const plugin = pluginManager.loadPlugin(pluginPath);

// Activate a plugin
pluginManager.activatePlugin(pluginId);

// Listen for plugin state changes
pluginManager.on('stateChange', (pluginId, state) => {
  console.log(`Plugin ${pluginId} state changed to ${state}`);
});
```

## Workspace Management System

PromptNova implements a comprehensive workspace management system for organizing and persisting user workspaces:

### WorkspaceContext

Provides an interface for workspace operations and state management.

**Purpose**: Defines the contract for workspace-related operations, including retrieving, switching, and updating workspaces.

**Features**:

- Workspace state and configuration management
- Event-based architecture for workspace changes
- Strongly-typed interfaces for workspace operations

**Files**:

- `/src/shared/models/WorkspaceContext.ts`: Core interfaces and types
- `/src/shared/WorkspaceContextProvider.ts`: Implementation of the context interface

**Usage**:

```typescript
// Get the current workspace
const workspace = await workspaceContext.getCurrentWorkspace();

// Switch to a different workspace
const success = await workspaceContext.switchWorkspace(workspaceId);

// Update workspace state
await workspaceContext.updateWorkspaceState({
  currentSectionId: 'section-1',
  visibleSections: ['section-1', 'section-2']
});

// Listen for workspace changes
workspaceContext.addEventListener(WorkspaceEvent.WORKSPACE_CHANGED, (workspace) => {
  // Handle workspace change
  console.log('Workspace changed:', workspace.config.name);
});
```

### WorkspaceManager Component

Manages workspace creation, deletion, and organization.

**Purpose**: Provides a centralized interface for managing workspace lifecycle and structure, including templates and folder organization.

**Features**:

- Folder structure management for workspaces
- Workspace creation and deletion functionality
- Template system for quick workspace setup
- Workspace metadata management

**Files**:

- `/src/components/WorkspaceManager.jsx`: Main component implementation
- `/src/shared/models/WorkspaceTemplate.ts`: Template definitions

**Usage**:

```typescript
// Create a new workspace from template
workspaceManager.createWorkspace({
  name: "New Project",
  templateId: "default-template"
});

// Delete a workspace
workspaceManager.deleteWorkspace(workspaceId);

// Get available workspace templates
const templates = workspaceManager.getTemplates();
```

### Enhanced SectionProvider

Provides context-aware section management with workspace integration.

**Purpose**: Manages sections within workspaces, handling context switching and persistence.

**Features**:

- Workspace context handling capability
- Workspace switching logic
- Local storage integration for persistence
- Section visibility state management

**Files**:

- `/src/components/SectionProvider.jsx`: Enhanced provider implementation

**Usage**:

```typescript
// Access the section provider within a component
const { sections, currentSection, switchSection } = useSectionProvider();

// Switch to a different section with workspace context
switchSection('documentation', { preserveWorkspaceState: true });

// Get sections for current workspace
const workspaceSections = sections.filter(s => s.workspaceId === currentWorkspaceId);
```

### Updated SettingsPanel

Provides workspace-specific settings management.

**Purpose**: Allows users to configure workspace-specific settings and manage workspace data.

**Features**:

- Workspace-specific storage implementation
- UI for workspace settings configuration
- Import/export functionality for workspaces
- Settings persistence across sessions

**Files**:

- `/src/components/SettingsPanel.jsx`: Updated panel implementation

**Usage**:

```typescript
// Access settings panel functionality
const { settings, updateSettings, exportWorkspace } = useSettingsPanel();

// Update workspace-specific settings
updateSettings({
  theme: "dark",
  fontSize: 14,
  workspaceId: currentWorkspaceId
});

// Export current workspace
exportWorkspace(currentWorkspaceId, exportPath);
```

### Workspace Model

Organizes collections of prompts with workspace-level management.

**Purpose**: Provides a container for organizing prompts with workspace-specific metadata and operations.

**Features**:

- Workspace configuration with settings like theme and font size
- Workspace state persistence (section visibility, scroll position)
- Event-driven updates for real-time synchronization
- IPC communication for main and renderer process coordination

**Usage**:

```typescript
// Create a workspace context provider
const workspaceProvider = new WorkspaceContextProvider();

// Update workspace configuration
workspaceProvider.updateWorkspaceConfig({
  name: "Updated Workspace",
  settings: { theme: "dark" }
});

// Access workspace state
const workspace = await workspaceProvider.getCurrentWorkspace();
console.log(workspace.state.visibleSections);
```

```

## Code Processing System

PromptNova implements a code processing system to handle various programming languages and code transformations:

### CodeProcessor Component

Provides utilities for processing and transforming code in different programming languages.

**Purpose**: Enables standardized code manipulation across the application, including comment stripping, whitespace handling, and empty line removal.

**Features**:
- Language-specific processing rules
- Comment stripping with documentation preservation options
- Whitespace normalization
- Empty line handling
- Extensible design for additional languages

**Files**:
- `/src/shared/CodeProcessor.ts`: Main implementation
- `/src/shared/models/SupportedLanguage.ts`: Supported language definitions

**Usage**:

```typescript
// Import the processor and language enum
import { CodeProcessor } from '@/shared/CodeProcessor';
import { SupportedLanguage } from '@/shared/models/SupportedLanguage';

// Process JavaScript code with default options
const processedCode = CodeProcessor.process(
  sourceCode,
  SupportedLanguage.JavaScript
);

// Process with custom options
const cleanCode = CodeProcessor.process(
  sourceCode,
  SupportedLanguage.Python,
  {
    stripComments: true,
    preserveDocComments: true,
    removeEmptyLines: true,
    trimWhitespace: true
  }
);
```

### CodeCleaner Component

Provides specialized empty line management and code formatting capabilities.

**Purpose**: Offers fine-grained control over empty line handling in code, with preservation rules for maintaining code readability while reducing unnecessary whitespace.

**Features**:
- Empty line removal with configurable preservation rules
- Intelligent spacing preservation around documentation, functions, and classes
- Configurable consecutive empty line limits
- Batch processing capability for multiple files
- Language-specific pattern recognition

**Files**:
- `/src/shared/CodeCleaner.ts`: Main implementation
- `/src/shared/models/SupportedLanguage.ts`: Shared language definitions

**Usage**:

```typescript
// Import the cleaner and language enum
import { CodeCleaner } from '@/shared/CodeCleaner';
import { SupportedLanguage } from '@/shared/models/SupportedLanguage';

// Clean JavaScript code with default options
const cleanedCode = CodeCleaner.clean(
  sourceCode,
  SupportedLanguage.JavaScript
);

// Clean with custom options
const formattedCode = CodeCleaner.clean(
  sourceCode,
  SupportedLanguage.TypeScript,
  {
    preserveDocumentationSpacing: true,
    preserveFunctionSpacing: true,
    preserveClassSpacing: false,
    minConsecutiveEmptyLines: 0,
    maxConsecutiveEmptyLines: 1
  }
);

// Process multiple files in batch
const batchResults = CodeCleaner.batchClean([
  { code: jsCode, language: SupportedLanguage.JavaScript },
  { code: tsCode, language: SupportedLanguage.TypeScript }
]);
```

### Plugin Interface

Defines the contract for plugin development.

**Purpose**: Provides a standardized interface that all plugins must implement to ensure compatibility.

**Features**:
- Type definitions for plugin metadata
- Required methods for lifecycle hooks
- Event handling interfaces
- Configuration management

**Usage**:

```typescript
// Example plugin implementation
class MyPlugin implements PluginInterface {
  activate(): void {
    // Plugin activation logic
  }
  deactivate(): void {
    // Plugin cleanup logic
  }
  getConfiguration(): PluginConfig {
    return {
      name: "My Plugin",
      version: "1.0.0",
      description: "Example plugin"
    };
  }
}
```

### Plugin Store UI

Provides user interface components for managing plugins.

**Purpose**: Enables users to discover, install, configure, and manage plugins through a graphical interface.

**Features**:

- Plugin discovery and installation
- Plugin configuration interface
- Plugin state visualization
- Update management

**Usage**:

```typescript
// Access plugin store functionality
const store = new PluginStore();

// Install a plugin
store.installPlugin(pluginId);

// Update plugin configuration
store.updatePluginConfig(pluginId, newConfig);
```

## UI Components

PromptNova implements several UI components to provide a seamless user experience:

### FloatingPanel

Provides a lightweight, floating interface for quick prompt access.

**Purpose**: Creates a non-intrusive overlay window that can be summoned anywhere in the system for quick prompt access and management.

**Features**:

- Always-on-top functionality
- Compact and minimalist design
- Smooth animations and transitions
- Keyboard-first navigation

**Usage**:

```typescript
// Create a floating panel instance
const floatingPanel = new FloatingPanel({
  position: { x: 100, y: 100 },
  size: { width: 400, height: 500 }
});

// Show/hide the panel
floatingPanel.show();
floatingPanel.hide();
```

### SearchBar

Provides real-time search functionality across prompts and workspaces.

**Purpose**: Enables quick access to prompts through intelligent search with support for tags, categories, and content matching.

**Features**:

- Real-time search results
- Tag and category filtering
- Fuzzy matching
- Search history tracking

**Usage**:

```typescript
// Initialize search with options
const searchBar = new SearchBar({
  debounceMs: 150,
  minSearchLength: 2
});

// Perform search
searchBar.search("my prompt").then(results => {
  // Handle search results
});
```

### CodePreview

Displays code snippets and context with syntax highlighting.

**Purpose**: Renders code content with proper formatting and syntax highlighting for better readability.

**Features**:

- Multi-language syntax highlighting
- Line numbers
- Code folding
- Copy to clipboard functionality

**Usage**:

```typescript
// Create a code preview instance
const preview = new CodePreview({
  language: "typescript",
  showLineNumbers: true
});

// Set content
preview.setContent(codeSnippet);
```
