# Project Structure

PromptNova follows a well-organized directory structure to maintain clean separation of concerns and facilitate easy navigation:

## Source Code (`/src`)

### Main Process (`/src/main`)

- `index.ts`: Entry point for Electron's main process
- `/ipc`: IPC handlers for inter-process communication
- `/managers`: Core system managers (ShortcutManager, WindowManager, etc.)
- `/plugins`: Plugin system infrastructure
- `/storage`: Data persistence and storage implementations

### Renderer Process (`/src/renderer`)

- `index.tsx`: Entry point for React renderer process
- `/components`: React UI components
- `/hooks`: Custom React hooks
- `/styles`: CSS and styling files
- `/utils`: Utility functions for the renderer

### Shared (`/src/shared`)

- `/models`: Data models (Prompt, Workspace)
- `/utils`: Shared utility functions
  - `commentStripping.ts`: Language-aware comment removal utilities
  - `codeProcessing.ts`: Advanced code transformation utilities
- `/services`: Shared service implementations
- `ipc-types.ts`: TypeScript definitions for IPC messages
- `CodeProcessor.ts`: Core class for processing code with various options

## Configuration Files

- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.js`: ESLint rules
- `.prettierrc`: Code formatting rules
- `jest.config.js`: Testing configuration
- `tailwind.config.js`: Tailwind CSS configuration

## Build Configuration (`/build`)

- `electron-builder.yml`: Electron build settings for packaging the application
- `webpack.config.js`: Webpack bundling configuration
- `/resources`: Build resources including icons and platform-specific files
  - `/icons`: Application icons for different platforms (Windows, macOS, Linux)
  - `/entitlements.mac.plist`: macOS security entitlements configuration
- `/scripts`: Build-related scripts
  - `afterBuild.js`: Post-build operations script

## Build and Distribution

The application uses Electron Builder for packaging and distribution:

1. Configuration in `/build/electron-builder.yml`
2. CI/CD workflow in `/.github/workflows/build.yml`
3. Build scripts in `/scripts/build.js`

The build system supports:

- Cross-platform builds (Windows, macOS, Linux)
- Multiple distribution formats (NSIS installer, portable, DMG, AppImage, etc.)
- Automated releases through GitHub Actions
- Platform-specific configurations and optimizations

## Documentation

- `ARCHITECTURE.md`: System architecture documentation
- `README.md`: Project overview and setup instructions
- `CHANGELOG.md`: Version history and changes
- `/documentation/user/getting-started.md`: Comprehensive guide for new users covering installation, basic usage, and advanced features
- `/documentation/developer/architecture.md`: Detailed overview of the application architecture, components, and workflows
- `/documentation/developer/contributing.md`: Guidelines for contributing to the project, including code standards and workflow

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

## File System Integration Components

PromptNova implements a robust file system integration system to enable drag & drop functionality and file preview capabilities:

### FileDropZone Component

Provides a flexible drag and drop interface for file selection.

**Purpose**: Enables users to easily add files to the application through an intuitive drag and drop interface or file selection dialog.

**Features**:

- Drag and drop file selection
- Click to open file browser alternative
- File type filtering with accepted file types
- Multiple file selection with optional limits
- Visual feedback during drag operations
- Rejection handling for invalid files

## Import/Export System

PromptNova includes a comprehensive import/export system for sharing and backing up prompts:

### ImportExport Utilities

**Purpose**: Provides core functionality for serializing and deserializing prompt data, with validation and error handling to ensure data integrity during import/export operations.

**Features**:

- Prompt data validation during import/export
- Version compatibility checking
- Structured error handling with detailed feedback
- Support for workspace context in exports

**Usage**:

```typescript
// Export prompts to JSON format
const exportData = prepareExport(prompts, workspace);

// Import and validate prompts from JSON
try {
  validateImportData(importData);
  const processedPrompts = processImportData(importData);
} catch (error) {
  // Handle import errors
}
```

### ImportExport UI Component

**Purpose**: Provides a user interface for importing prompts from files and exporting prompts to files, with proper feedback and error handling.

**Features**:

- File selection dialogs for import/export
- Progress indication during operations
- Detailed error reporting with type-specific handling
- Success confirmation with operation details

### ImportExport IPC Handlers

**Purpose**: Manages file system operations and communication between main and renderer processes for importing and exporting prompts.

**Features**:

- File dialog management for selecting import/export locations
- File reading and writing operations
- Error handling and reporting back to the UI
- Integration with the main IPC system

**Files**:

- `/src/renderer/components/context/FileDropZone.tsx`: Main component implementation

**Usage**:

```typescript
import { FileDropZone } from '@/renderer/components/context/FileDropZone';

<FileDropZone
  onFilesSelected={(files) => handleFiles(files)}
  acceptedFileTypes={['.js', '.ts', '.jsx', '.tsx']}
  maxFiles={5}
  className="w-full h-32"
/>
```

### FilePreview Component

Displays previews of selected files with appropriate icons and metadata.

**Purpose**: Provides visual feedback about selected files and allows users to preview file contents when possible.

**Features**:

- File type detection with appropriate icons
- Preview generation for supported file types (images, text)
- File metadata display (name, size, type)
- Remove button for deleting files from selection
- Error handling for large or unsupported files

**Files**:

- `/src/renderer/components/context/FilePreview.tsx`: Main component implementation

**Usage**:

```typescript
import { FilePreview } from '@/renderer/components/context/FilePreview';

<FilePreview
  file={selectedFile}
  onRemove={() => handleRemoveFile(selectedFile)}
  maxPreviewSize={2 * 1024 * 1024} // 2MB
  className="border rounded p-3"
/>
```

### File Processing Utilities

Provides utility functions for handling file operations and processing.

**Purpose**: Centralizes common file operations like validation, reading, and processing to ensure consistent behavior throughout the application.

**Features**:

- File validation against size and type constraints
- Text file reading with error handling
- Support for various programming language file types
- File size formatting
- Error type definitions for consistent error handling

**Files**:

- `/src/shared/utils/fileProcessing.ts`: Core file processing utilities

**Usage**:

```typescript
import { validateFile, readTextFile, SUPPORTED_TEXT_TYPES } from '@/shared/utils/fileProcessing';

// Validate a file
const validation = validateFile(file, 5 * 1024 * 1024, SUPPORTED_TEXT_TYPES);
if (validation.isValid) {
  // Process the file
  const content = await readTextFile(file);
  // Use the file content
} else {
  // Handle validation error
  console.error(validation.message);
}
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

```md
### Workspace Model

Organizes collections of prompts with comprehensive workspace-level management capabilities.

**Purpose**:
- Provides a robust container for organizing prompts with workspace-specific metadata, operations, and configuration management.

**Features**:
- Validation rules for workspace properties and structure
- Complete prompt collection management with CRUD operations
- Workspace configuration with customizable settings (theme, font size)
- State persistence for UI elements (section visibility, scroll position)
- Event-driven architecture for real-time synchronization
- IPC communication between main and renderer processes
- JSON serialization support for data portability
- Comprehensive workspace context management

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

## Workspace Model (Additional Details)

Organizes collections of prompts with workspace-level management.

**Purpose**:

- Provides a container for organizing prompts with workspace-specific metadata and operations.

**Features**:

- Workspace configuration with settings like theme and font size
- Workspace state persistence (section visibility, scroll position)
- Event-driven updates for real-time synchronization
- IPC communication for main and renderer process coordination

**Usage**:

````typescript
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
````

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

## Placeholder System

PromptNova implements a robust placeholder system for creating dynamic prompts with user-fillable fields:

### Placeholder Detection Utilities

Provides utilities for detecting, validating, and replacing placeholders in prompt content.

**Purpose**: Enables the identification and processing of dynamic placeholders in prompt templates, allowing for customizable prompt generation.

**Features**:

- Regular expression-based placeholder detection
- Validation of placeholder format and naming
- Placeholder replacement with user-provided values
- Default value support for optional placeholders

**Files**:

- `/src/shared/utils/placeholder.ts`: Core placeholder utilities

**Usage**:

```typescript
// Detect placeholders in a prompt string
const placeholders = detectPlaceholders("This is a {{placeholder}} with {{another_one}}");

// Validate a placeholder name
const isValid = validatePlaceholderName("my_placeholder");

// Replace placeholders with values
const filledPrompt = replacePlaceholders(promptText, {
  placeholder: "value",
  another_one: "second value"
});
```

### PlaceholderEditor Component

Provides a user interface for editing and managing placeholders in prompts.

**Purpose**: Allows users to create, edit, and manage placeholders within the prompt editing interface.

**Features**:

- Visual highlighting of placeholders in the editor
- Inline placeholder creation and editing
- Default value configuration
- Placeholder validation feedback

**Files**:

- `/src/renderer/components/prompt/PlaceholderEditor.tsx`: UI component for placeholder editing

**Usage**:

```typescript
// Render the placeholder editor component
<PlaceholderEditor
  promptContent={promptContent}
  onChange={handleContentChange}
  onPlaceholderUpdate={handlePlaceholderUpdate}
/>
```

### usePlaceholders Hook

Manages placeholder state and operations in React components.

**Purpose**: Provides a React hook for managing placeholder detection, validation, and replacement within components.

**Features**:

- Automatic placeholder detection in prompt content
- State management for placeholder values
- Validation of user-provided values
- Integration with form components

**Files**:

- `/src/renderer/hooks/usePlaceholders.ts`: Custom React hook

**Usage**:

```typescript
// Use the hook in a component
const {
  placeholders,
  placeholderValues,
  updatePlaceholderValue,
  fillPromptWithValues
} = usePlaceholders(promptContent);

// Update a placeholder value
updatePlaceholderValue('user_name', 'John');

// Get the filled prompt with all values
const finalPrompt = fillPromptWithValues();
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for all notable changes.

## Version Control Compliance

PromptNova implements a robust version control compliance system to maintain code quality and consistency:

### Git Hooks (`/.husky/pre-commit`)

- Enforces code quality checks before commits
- Runs linting and formatting on staged files
- Validates commit messages against conventional commit format

### Lint-Staged Configuration (`/lint-staged.config.js`)

- Configures which linting and formatting tasks run on staged files
- Ensures consistent code style across the codebase
- Prevents code style issues from being committed

### CI/CD Pipeline (`/.github/workflows/main.yml`)

- Automates testing and validation on pull requests and pushes
- Enforces commit message conventions
- Runs linting, type checking, and tests in a controlled environment
- Ensures code quality across all contributions

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

## WorkspaceManager Component

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

## WorkspaceSelector Component

Provides a user interface for selecting and switching between workspaces.

**Purpose**: Enables users to easily navigate between different workspaces and manage their workspace selection.

**Features**:

- List of available workspaces
- Quick workspace switching
- Visual indicators for active workspace
- Search and filter capabilities
- Recent workspaces history

**Files**:

- `/src/renderer/components/workspace/WorkspaceSelector.tsx`: Main component implementation

**Usage**:

```typescript
import { WorkspaceSelector } from '@/renderer/components/workspace/WorkspaceSelector';

<WorkspaceSelector
  onWorkspaceSelect={handleWorkspaceSelect}
  currentWorkspace={currentWorkspace}
  recentWorkspaces={recentWorkspaces}
/>
```

## WorkspaceSettings Component

Manages workspace-specific configuration and settings.

**Purpose**: Provides an interface for users to configure workspace-specific settings and preferences.

**Features**:

- Workspace name and description editing
- Category management
- Template preferences
- Export/import settings
- Workspace-specific shortcuts

**Files**:

- `/src/renderer/components/workspace/WorkspaceSettings.tsx`: Main component implementation

**Usage**:

```typescript
import { WorkspaceSettings } from '@/renderer/components/workspace/WorkspaceSettings';

<WorkspaceSettings
  workspace={currentWorkspace}
  onSettingsUpdate={handleSettingsUpdate}
  onExportWorkspace={handleExport}
/>
```

## useWorkspace Hook

Custom React hook for managing workspace state and operations.

**Purpose**: Provides a convenient way to access and manage workspace data and operations within React components.

**Features**:

- Workspace state management
- CRUD operations for workspace data
- Automatic state updates
- Error handling
- Loading state management

**Files**:

- `/src/renderer/hooks/useWorkspace.ts`: Custom React hook implementation

**Usage**:

````typescript
import { useWorkspace } from '@/renderer/hooks/useWorkspace';

const {
  workspace,
  isLoading,
  error,
  updateWorkspace,
  deleteWorkspace,
  exportWorkspace
} = useWorkspace(workspaceId);

// Update workspace settings
await updateWorkspace({
  name: 'Updated Name',
  description: 'New description'
});

// Export workspace data
const exportData = await exportWorkspace();
```

````

## Enhanced SectionProvider

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

## Updated SettingsPanel

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

## UI Component System

PromptNova implements a modern UI component system for creating an intuitive and efficient user interface:

### FloatingPanel Component

Provides a flexible, movable interface container that can be positioned anywhere on screen.

**Purpose**: Creates a foundation for floating windows that can be resized, moved, and remembered between sessions.

**Features**:

- Size constraints with minimum and maximum dimensions
- Position memory for restoring window placement
- Performance optimizations for smooth animations
- Drag handles for user repositioning

**Files**:

- `/src/components/layout/FloatingPanel.jsx`: Main component implementation

**Usage**:

```typescript
// Create a floating panel with position memory
import { FloatingPanel } from '@/components/layout/FloatingPanel';

<FloatingPanel
  id="prompt-panel"
  defaultPosition={{ x: 100, y: 100 }}
  minWidth={300}
  minHeight={200}
>
  {/* Panel content */}
</FloatingPanel>
```

## WindowManager Integration

Integrates with Electron to provide native window management capabilities.

**Purpose**: Bridges the gap between React components and Electron's window management, enabling advanced window behaviors.

**Features**:

- Complete Electron integration for native window controls
- Stay-on-top functionality for floating windows
- Window state management (position, size, visibility)
- Multi-window coordination

**Files**:

- `/src/components/layout/WindowManager.jsx`: Electron integration layer
- `/src/main/managers/WindowManager.ts`: Main process window management

**Usage**:

```typescript
// In renderer process
import { useWindowManager } from '@/components/layout/WindowManager';

const { setAlwaysOnTop, setWindowState } = useWindowManager();

// Set window to stay on top
setAlwaysOnTop(true);

// Save window state
setWindowState({
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  isVisible: true
});

// In main process
import { windowManager } from '@/main/managers/WindowManager';

// Create a floating window
const floatingWindow = windowManager.createFloatingWindow();

// Set window properties
windowManager.setWindowAlwaysOnTop(floatingWindow, true);
```

## SearchBar Component

Provides an advanced search interface with real-time filtering and result display.

**Purpose**: Enables users to efficiently search and filter prompts with a modern, responsive interface that supports advanced filtering capabilities.

**Features**:

- Real-time search with debouncing
- Advanced filtering by categories and tags
- Dynamic result display with prompt details
- Dark mode support
- Loading state indication
- Outside click handling
- Filter state management

**Files**:

- `/src/components/ui/SearchBar.tsx`: Main component implementation
- `/src/shared/services/SearchService.ts`: Search service implementation

**Implementation Details**:

- Uses React hooks for state management
- Implements TypeScript interfaces for type safety
- Integrates with SearchService for data operations
- Supports customization through props
- Handles keyboard interactions and accessibility

**Usage**:

```typescript
import { SearchBar } from '@/components/ui/SearchBar';

<SearchBar
  onResultSelect={(prompt) => handlePromptSelect(prompt)}
  placeholder="Search prompts..."
  className="w-full max-w-xl"
  autoFocus={true}
/>

// Handle prompt selection
const handlePromptSelect = (prompt) => {
  console.log('Selected prompt:', prompt.title);
  // Process the selected prompt
};
```

## SearchService Integration

Provides the backend functionality for the SearchBar component.

**Purpose**: Manages prompt data retrieval, filtering, and real-time search operations.

**Features**:

- Asynchronous initialization
- Debounced search operations
- Category and tag filtering
- Result limiting
- Error handling

**Implementation Details**:

- Maintains an in-memory cache of prompts
- Uses IPC communication for data retrieval
- Implements efficient filtering algorithms
- Provides utility methods for metadata

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

## CodeCleaner Component

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

## Plugin Interface

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

## Plugin Store UI

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

## SearchBar

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

## CodePreview

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

## Prompt Management Components

PromptNova implements a comprehensive prompt management system for creating, editing, organizing, and using prompts:

### PromptEditor Component

Provides an interface for creating and editing prompts with real-time preview.

**Purpose**: Enables users to create, edit, and format prompts with support for placeholders, markdown, and code snippets.

**Features**:

- Rich text editing with markdown support
- Placeholder detection and management
- Real-time preview of formatted content
- Tag and category assignment
- Validation and error handling

**Files**:

- `/src/renderer/components/prompt/PromptEditor.tsx`: Main component implementation

**Usage**:

```typescript
import { PromptEditor } from '@/renderer/components/prompt/PromptEditor';

// Create a new prompt
<PromptEditor
  onSave={(promptData) => savePrompt(promptData)}
  initialData={{
    title: "",
    content: "",
    tags: [],
    categoryId: "default"
  }}
/>

// Edit an existing prompt
<PromptEditor
  onSave={(promptData) => updatePrompt(promptId, promptData)}
  initialData={existingPrompt}
/>
```

## PromptCategories Component

Manages the organization of prompts into categories for better organization.

**Purpose**: Provides an interface for creating, editing, and managing prompt categories to organize the prompt library.

**Features**:

- Category creation and editing
- Drag-and-drop organization
- Nested category support
- Category color coding
- Prompt assignment to categories

**Files**:

- `/src/renderer/components/prompt/PromptCategories.tsx`: Main component implementation

**Usage**:

```typescript
import { PromptCategories } from '@/renderer/components/prompt/PromptCategories';

// Display categories with selection
<PromptCategories
  onCategorySelect={(categoryId) => setSelectedCategory(categoryId)}
  onCategoryUpdate={(categoryId, data) => updateCategory(categoryId, data)}
  onCategoryCreate={(data) => createCategory(data)}
/>
```

## usePrompts Hook

Provides a centralized way to manage prompts throughout the application.

**Purpose**: Offers a React hook for accessing and manipulating prompts with built-in state management and persistence.

**Features**:

- CRUD operations for prompts
- Filtering and searching
- Category-based organization
- Persistence through IPC communication
- Real-time updates across components

**Files**:

- `/src/renderer/hooks/usePrompts.ts`: Hook implementation

**Usage**:

```typescript
import { usePrompts } from '@/renderer/hooks/usePrompts';

// In a component
const {
  prompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  getPromptsByCategory,
  searchPrompts
} = usePrompts();

// Create a new prompt
const newPromptId = await createPrompt({
  title: "API Request Template",
  content: "GET {{endpoint}} HTTP/1.1\nAuthorization: Bearer {{token}}",
  tags: ["api", "http"],
  categoryId: "web-development"
});

// Update an existing prompt
await updatePrompt(promptId, { title: "Updated Title" });

// Get prompts by category
const categoryPrompts = getPromptsByCategory("web-development");

// Search prompts
const searchResults = await searchPrompts("api");
```
