/**
 * Workspace-related IPC handlers for PromptNova
 * 
 * This file contains all IPC handlers related to workspace management,
 * including creating, updating, deleting, and retrieving workspaces.
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS, Workspace, WorkspaceCreateRequest, WorkspaceUpdateRequest, IPCResponse } from '../../shared/ipc-types';
import { createErrorResponse, createSuccessResponse } from './index';

// In-memory storage for workspaces (will be replaced with actual storage in Step 5)
let workspaces: Workspace[] = [];
let activeWorkspaceId: string | null = null;

/**
 * Registers all workspace-related IPC handlers
 * 
 * This function should be called during application initialization
 * to set up all workspace-related communication channels.
 */
export function registerWorkspaceHandlers(): void {
  // Create a new workspace
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_CREATE, async (_, request: WorkspaceCreateRequest): Promise<IPCResponse<Workspace>> => {
    try {
      // Validate the workspace data
      if (!request.workspace.name) {
        return createErrorResponse('Workspace name is required');
      }
      
      // Create a new workspace with a unique ID
      const newWorkspace: Workspace = {
        id: Date.now().toString(), // Simple ID generation (will be improved in Step 5)
        prompts: [], // Initialize with empty prompts array
        ...request.workspace
      };
      
      // Store the workspace (temporary in-memory storage)
      workspaces.push(newWorkspace);
      
      // If this is the first workspace, set it as active
      if (workspaces.length === 1) {
        activeWorkspaceId = newWorkspace.id;
      }
      
      return createSuccessResponse(newWorkspace);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Update an existing workspace
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_UPDATE, async (_, request: WorkspaceUpdateRequest): Promise<IPCResponse<Workspace>> => {
    try {
      // Find the workspace to update
      const workspaceIndex = workspaces.findIndex(w => w.id === request.id);
      if (workspaceIndex === -1) {
        return createErrorResponse(`Workspace with ID ${request.id} not found`);
      }
      
      // Update the workspace
      const updatedWorkspace = {
        ...workspaces[workspaceIndex],
        ...request.workspace
      };
      
      // Save the updated workspace
      workspaces[workspaceIndex] = updatedWorkspace;
      
      return createSuccessResponse(updatedWorkspace);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Delete a workspace
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_DELETE, async (_, id: string): Promise<IPCResponse<boolean>> => {
    try {
      // Find the workspace to delete
      const workspaceIndex = workspaces.findIndex(w => w.id === id);
      if (workspaceIndex === -1) {
        return createErrorResponse(`Workspace with ID ${id} not found`);
      }
      
      // Remove the workspace
      workspaces.splice(workspaceIndex, 1);
      
      // If the deleted workspace was active, set a new active workspace
      if (activeWorkspaceId === id) {
        activeWorkspaceId = workspaces.length > 0 ? workspaces[0].id : null;
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Get all workspaces
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_GET_ALL, async (): Promise<IPCResponse<Workspace[]>> => {
    try {
      return createSuccessResponse(workspaces);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Get a workspace by ID
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_GET_BY_ID, async (_, id: string): Promise<IPCResponse<Workspace>> => {
    try {
      // Find the workspace
      const workspace = workspaces.find(w => w.id === id);
      if (!workspace) {
        return createErrorResponse(`Workspace with ID ${id} not found`);
      }
      
      return createSuccessResponse(workspace);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Set active workspace
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_SET_ACTIVE, async (_, id: string): Promise<IPCResponse<Workspace>> => {
    try {
      // Find the workspace
      const workspace = workspaces.find(w => w.id === id);
      if (!workspace) {
        return createErrorResponse(`Workspace with ID ${id} not found`);
      }
      
      // Set as active workspace
      activeWorkspaceId = id;
      
      return createSuccessResponse(workspace);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Get active workspace
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_GET_ACTIVE, async (): Promise<IPCResponse<Workspace | null>> => {
    try {
      if (!activeWorkspaceId) {
        return createSuccessResponse(null);
      }
      
      const workspace = workspaces.find(w => w.id === activeWorkspaceId);
      return createSuccessResponse(workspace || null);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  console.log('Workspace IPC handlers registered successfully');
}