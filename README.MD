# PromptNova

![Version](https://img.shields.io/badge/Version-0.0.0__commit3-purple?style=for-the-badge&logo=git&logoColor=purple&labelColor=%23eee)
![License](https://img.shields.io/badge/License-GNU-purple?style=for-the-badge&logo=gnu&logoColor=purple&labelColor=%23eee)
![Electron](https://img.shields.io/badge/Electron-23.6.9-purple?style=for-the-badge&logo=electron&logoColor=purple&labelColor=%23eee)
![React](https://img.shields.io/badge/React-18.2.0-purple?style=for-the-badge&logo=react&logoColor=purple&labelColor=%23eee)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.3-purple?style=for-the-badge&logo=tailwindcss&logoColor=purple&labelColor=%23eee)

PromptNova is a desktop application designed to centralize the storage and utilization of prompts, primarily for AI interactions but also for other types of commands. It provides an organized, agile environment with seamless integration across Windows, Linux, and macOS, allowing users to access and insert their prompts into any text field with just a keyboard shortcut.

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

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for all notable changes.
