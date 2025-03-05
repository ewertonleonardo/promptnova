# Component-Functionality Mapping Guide

## Core System Features ↔ UI Components

### **Prompt Management System**

| Feature Requirement | Existing Component | Location | Modification Needed |
|----------------------|--------------------|----------|---------------------|
| Category Organization | `SectionProvider` | `src/components/SectionProvider.jsx` | Add folder tree functionality |
| Tag System | `Tag` component | `src/components/ui/Tag.jsx` | Color coding integration |
| CRUD Operations | `EditableContent` | `src/components/content/Editable.jsx` | Connect to local storage |

### **Floating Window UI**

| Feature Requirement | Template Component | Adaptation Required |
|----------------------|--------------------|----------------------|
| Compact Design | `FloatingPanel` | Size constraints |
| Stay-on-Top | `WindowManager` | Electron integration |
| Search Functionality | `SearchBar` | Connect to prompt DB |

### **Context Code Integration**

### **Workspace Management**

| Feature Requirement | Existing Component | Modification Needed |
|----------------------|--------------------|----------------------|
| Workspace Switching | `SectionProvider` | Add workspace context handling |
| Configuration Storage | `SettingsPanel` | Implement workspace-specific storage |
| Folder Structures | `WorkspaceManager` | Create new component for space management |

### **Code Processing Implementation**

| Processing Feature | Component | Implementation Status |
|--------------------|-----------|-----------------------|
| Comment Stripping | CodeProcessor | Needs util functions |
| Empty Line Removal | CodeCleaner | Partial implementation |
| Path Handling | Breadcrumb | Requires expansion |

- **Code Preview**: Modify `CodeBlock` in `src/components/mdx/Code.jsx`
- **Path Display**: Utilize `Breadcrumb` from `src/components/navigation/Breadcrumb.jsx`

## Icon Mapping Guide

| System Function | Icon Component | Location |
|-----------------|----------------|----------|
| Workspace Switch | `FolderIcon` | `src/components/icons/Folder.jsx` |
| Settings | `GearIcon` | `src/components/icons/Gear.jsx` |
| Quick Actions | `LightningIcon` | `src/components/icons/Lightning.jsx` |

## Layout Utilization Plan

1. **Main Application Frame**: `src/components/layout/MainLayout.jsx`
2. **Prompt Editor**: Adapt `src/components/content/Editor.jsx`
3. **Configuration Panels**: Use `src/components/layout/SettingsPanel.jsx`

> **Note**: All components should maintain Protocol design system patterns while adding Nova-specific functionality
