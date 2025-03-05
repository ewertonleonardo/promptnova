# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- **Step 4**: Establish IPC communication channels between the main and renderer processes for seamless data exchange.
- **Step 5**: Define data models and implement storage solutions for managing prompts and workspaces.
- **Step 6**: Create foundational UI components using Tailwind CSS for a consistent and reusable design.
- **Step 7**: Build the floating window interface, including search and prompt listing functionalities.
- **Step 8**: Implement CRUD operations for prompt management, allowing users to create, read, update, and delete prompts.
- **Step 9**: Integrate a placeholder system for detecting and managing placeholders within prompts.
- **Step 10**: Add file system integration features, such as drag-and-drop and file previews, to enhance user interaction.
- **Step 11**: Develop workspace management features, enabling users to select and configure workspaces.
- **Step 13**: Write comprehensive documentation for both users and developers to facilitate understanding and contribution.
- **Step 14**: Set up build and distribution configurations, including CI/CD workflows, to automate the deployment process.

## [0.0.0_commit3] - 2024-03-05

- **Step 3**: Develop core system managers for handling global shortcuts, file system operations, clipboard actions, and window management.

### Added
- Core system managers implementation:
  - ShortcutManager for handling global keyboard shortcuts
  - FileSystemManager for file system operations
  - ClipboardManager for clipboard actions
  - WindowManager for application window management

## [0.0.0_commit2] - 2024-03-05

- **Step 2**: Configure development tools like ESLint, Prettier, TypeScript, and Jest for code quality and testing.

### Added

- Development tools configuration (ESLint, Prettier, TypeScript, Jest) for code quality and testing
- Core system managers for global shortcuts, file system operations, clipboard actions, and window management
- IPC communication channels between main and renderer processes
- Data models and storage solutions for prompts and workspaces
- Foundational UI components using Tailwind CSS
- Floating window interface with search and prompt listing functionalities
- CRUD operations for prompt management
- Placeholder system for managing dynamic content within prompts
- File system integration features (drag-and-drop, file previews)
- Workspace management features for multiple environment support
- Comprehensive documentation for users and developers
- Build and distribution configurations with CI/CD workflows

## [0.0.0] - 2024-03-05

- **Step 1**: Initialize the project, create the base structure, and set up the development environment. Here is the beginning!

### Added

- Project ideation and documentation in `/BaseFiles`
- Initial project structure setup with Electron, React, and Tailwind CSS
- Basic frontend organization in `/src` directory
- Project documentation structure and guidelines
- Development environment configuration files
- Organized frontend components and utilities following Airbnb style guide
- Updated project documentation to follow standard guidelines
- Structured the development workflow with proper branching strategy
- Initial repository setup
