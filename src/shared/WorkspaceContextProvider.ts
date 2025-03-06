/**
 * @file WorkspaceContextProvider.ts
 * @description Implements the workspace context interface for managing workspaces.
 * This module provides functionality for workspace state management and persistence.
 */

import { ipcRenderer } from 'electron';
import {
  IWorkspaceContext,
  Workspace,
  WorkspaceConfig,
  WorkspaceEvent,
  WorkspaceEventHandler,
  WorkspaceState
} from './models/WorkspaceContext';

/**
 * Constants for IPC channels
 */
const IPC_CHANNELS = {
  GET_WORKSPACE: 'workspace:get-current',
  SWITCH_WORKSPACE: 'workspace:switch',
  UPDATE_STATE: 'workspace:update-state',
  UPDATE_CONFIG: 'workspace:update-config'
};

/**
 * Default workspace configuration
 */
const DEFAULT_WORKSPACE: Workspace = {
  config: {
    id: 'default',
    name: 'Default Workspace',
    description: 'Default workspace for PromptNova',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      theme: 'system',
      fontSize: 14,
      autoSave: true
    }
  },
  state: {
    visibleSections: [],
    expandedNodes: []
  }
};

/**
 * Implementation of the IWorkspaceContext interface
 */
export class WorkspaceContextProvider implements IWorkspaceContext {
  private currentWorkspace: Workspace | null = null;
  private eventListeners: Map<WorkspaceEvent, Set<WorkspaceEventHandler>> = new Map();
  private initialized: boolean = false;

  /**
   * Creates a new WorkspaceContextProvider instance
   */
  constructor() {
    this.initialize();
  }

  /**
   * Initializes the workspace context provider
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Set up IPC listeners for workspace events
      ipcRenderer.on('workspace:changed', (_, workspace: Workspace) => {
        this.currentWorkspace = workspace;
        this.emitEvent(WorkspaceEvent.WORKSPACE_CHANGED, workspace);
      });

      ipcRenderer.on('workspace:state-updated', (_, workspace: Workspace) => {
        this.currentWorkspace = workspace;
        this.emitEvent(WorkspaceEvent.STATE_UPDATED, workspace);
      });

      ipcRenderer.on('workspace:config-updated', (_, workspace: Workspace) => {
        this.currentWorkspace = workspace;
        this.emitEvent(WorkspaceEvent.CONFIG_UPDATED, workspace);
      });

      // Load the current workspace
      await this.getCurrentWorkspace();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize workspace context:', error);
    }
  }

  /**
   * Gets the current workspace
   * @returns Promise resolving to the current workspace or null if not found
   */
  async getCurrentWorkspace(): Promise<Workspace | null> {
    if (!this.initialized) {
      try {
        const workspace = await ipcRenderer.invoke(IPC_CHANNELS.GET_WORKSPACE);
        this.currentWorkspace = workspace || DEFAULT_WORKSPACE;
      } catch (error) {
        console.error('Failed to get current workspace:', error);
        this.currentWorkspace = DEFAULT_WORKSPACE;
      }
    }
    
    return this.currentWorkspace;
  }

  /**
   * Switches to a different workspace
   * @param id The ID of the workspace to switch to
   * @returns Promise resolving to true if successful
   */
  async switchWorkspace(id: string): Promise<boolean> {
    try {
      const success = await ipcRenderer.invoke(IPC_CHANNELS.SWITCH_WORKSPACE, id);
      if (success) {
        const workspace = await this.getCurrentWorkspace();
        if (workspace) {
          this.emitEvent(WorkspaceEvent.WORKSPACE_CHANGED, workspace);
        }
      }
      return !!success;
    } catch (error) {
      console.error(`Failed to switch to workspace ${id}:`, error);
      return false;
    }
  }

  /**
   * Updates the current workspace state
   * @param state Partial workspace state to update
   * @returns Promise resolving to true if successful
   */
  async updateWorkspaceState(state: Partial<WorkspaceState>): Promise<boolean> {
    if (!this.currentWorkspace) {
      await this.getCurrentWorkspace();
    }
    
    if (!this.currentWorkspace) return false;
    
    try {
      const success = await ipcRenderer.invoke(
        IPC_CHANNELS.UPDATE_STATE, 
        this.currentWorkspace.config.id, 
        state
      );
      
      if (success) {
        // Update local state
        this.currentWorkspace = {
          ...this.currentWorkspace,
          state: {
            ...this.currentWorkspace.state,
            ...state
          }
        };
        
        this.emitEvent(WorkspaceEvent.STATE_UPDATED, this.currentWorkspace);
      }
      
      return !!success;
    } catch (error) {
      console.error('Failed to update workspace state:', error);
      return false;
    }
  }

  /**
   * Updates the current workspace configuration
   * @param config Partial workspace configuration to update
   * @returns Promise resolving to true if successful
   */
  async updateWorkspaceConfig(config: Partial<WorkspaceConfig>): Promise<boolean> {
    if (!this.currentWorkspace) {
      await this.getCurrentWorkspace();
    }
    
    if (!this.currentWorkspace) return false;
    
    try {
      const success = await ipcRenderer.invoke(
        IPC_CHANNELS.UPDATE_CONFIG, 
        this.currentWorkspace.config.id, 
        config
      );
      
      if (success) {
        // Update local config
        this.currentWorkspace = {
          ...this.currentWorkspace,
          config: {
            ...this.currentWorkspace.config,
            ...config,
            updatedAt: Date.now()
          }
        };
        
        this.emitEvent(WorkspaceEvent.CONFIG_UPDATED, this.currentWorkspace);
      }
      
      return !!success;
    } catch (error) {
      console.error('Failed to update workspace config:', error);
      return false;
    }
  }

  /**
   * Adds an event listener for workspace events
   * @param event The event to listen for
   * @param handler The event handler function
   */
  addEventListener(event: WorkspaceEvent, handler: WorkspaceEventHandler): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)!.add(handler);
  }

  /**
   * Removes an event listener for workspace events
   * @param event The event to remove the listener from
   * @param handler The event handler function to remove
   */
  removeEventListener(event: WorkspaceEvent, handler: WorkspaceEventHandler): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(handler);
    }
  }

  /**
   * Emits an event to all registered listeners
   * @param event The event to emit
   * @param workspace The workspace data to pass to handlers
   */
  private emitEvent(event: WorkspaceEvent, workspace: Workspace): void {
    if (this.eventListeners.has(event)) {
      for (const handler of this.eventListeners.get(event)!) {
        try {
          handler(workspace);
        } catch (error) {
          console.error(`Error in workspace event handler for ${event}:`, error);
        }
      }
    }
  }
}

/**
 * Singleton instance of the workspace context provider
 */
export const workspaceContext = new WorkspaceContextProvider();