# ![PromptNova Logo](src/logo/DarkBgRectangle.svg)

![Version](https://img.shields.io/badge/Version-0.0.0__commit4-4d179a?style=for-the-badge&logo=git&logoColor=4d179a&labelColor=%23eee)
![License](https://img.shields.io/badge/License-GNU-4d179a?style=for-the-badge&logo=gnu&logoColor=4d179a&labelColor=%23eee)
![Electron](https://img.shields.io/badge/Electron-23.6.9-4d179a?style=for-the-badge&logo=electron&logoColor=4d179a&labelColor=%23eee)
![React](https://img.shields.io/badge/React-18.2.0-4d179a?style=for-the-badge&logo=react&logoColor=4d179a&labelColor=%23eee)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.3-4d179a?style=for-the-badge&logo=tailwindcss&logoColor=4d179a&labelColor=%23eee)

**PromptNova** is a desktop application designed to centralize the storage and utilization of prompts, primarily for AI interactions but also for other types of commands. It provides an organized, agile environment with seamless integration across Windows, Linux, and macOS, allowing users to access and insert their prompts into any text field with just a keyboard shortcut.

## Features

- Organized prompt storage with categories and tags
- Floating window with global keyboard shortcuts
- Smart placeholder system for dynamic content
- Context code integration with drag & drop support
- Multiple workspace support
- Cross-platform compatibility (Windows, Linux, macOS)
- Import/export functionality with multiple formats
- Modern, responsive interface built with React and Tailwind CSS

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

## Development

1. Clone the repository
2. Install dependencies
3. Start the development server

```bash
npm run dev
```

## License

This project is licensed under the GNU License - see the [LICENSE](LICENSE) file for details.

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
