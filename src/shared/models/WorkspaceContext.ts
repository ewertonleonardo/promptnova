/**
 * @file WorkspaceContext.ts
 * @description Defines the workspace context model and related types for the application.
 * This module provides the structure for workspace management and persistence.
 */

/**
 * Represents a workspace configuration
 */
export interface WorkspaceConfig {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  settings: {
    theme?: 'light' | 'dark' | 'system';
    fontSize?: number;
    autoSave?: boolean;
    [key: string]: any;
  };
}

/**
 * Represents the current state of a workspace
 */
export interface WorkspaceState {
  currentSectionId?: string;
  visibleSections: string[];
  scrollPosition?: number;
  expandedNodes?: string[];
}

/**
 * Represents a complete workspace with its configuration and state
 */
export interface Workspace {
  config: WorkspaceConfig;
  state: WorkspaceState;
}

/**
 * Events that can be emitted by the workspace context
 */
export enum WorkspaceEvent {
  WORKSPACE_CHANGED = 'workspace_changed',
  STATE_UPDATED = 'state_updated',
  CONFIG_UPDATED = 'config_updated'
}

/**
 * Type for workspace event handlers
 */
export type WorkspaceEventHandler = (workspace: Workspace) => void;

/**
 * Interface for workspace context operations
 */
export interface IWorkspaceContext {
  getCurrentWorkspace(): Promise<Workspace | null>;
  switchWorkspace(id: string): Promise<boolean>;
  updateWorkspaceState(state: Partial<WorkspaceState>): Promise<boolean>;
  updateWorkspaceConfig(config: Partial<WorkspaceConfig>): Promise<boolean>;
  addEventListener(event: WorkspaceEvent, handler: WorkspaceEventHandler): void;
  removeEventListener(event: WorkspaceEvent, handler: WorkspaceEventHandler): void;
}