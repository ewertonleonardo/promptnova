/**
 * @file useWorkspace.ts
 * @description A custom hook for managing workspace state and operations.
 * This hook provides a centralized way to handle workspace-related functionality,
 * including workspace selection, settings management, and state persistence.
 */

import { useCallback, useEffect, useState } from 'react';
import { Workspace } from '../../shared/models/Workspace';
import { useWorkspaceContext } from '../../shared/WorkspaceContextProvider';

/**
 * Interface for workspace operations and state
 */
interface UseWorkspaceReturn {
  /** Current workspace */
  workspace: Workspace | null;
  /** List of available workspaces */
  workspaces: Workspace[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Function to fetch available workspaces */
  fetchWorkspaces: () => Promise<void>;
  /** Function to switch to a different workspace */
  switchWorkspace: (workspaceId: string) => Promise<void>;
  /** Function to update workspace settings */
  updateWorkspaceSettings: (settings: Partial<Workspace>) => Promise<void>;
  /** Function to create a new workspace */
  createWorkspace: (name: string, description?: string) => Promise<void>;
  /** Function to delete a workspace */
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

/**
 * Custom hook for managing workspace operations
 */
export const useWorkspace = (): UseWorkspaceReturn => {
  const { currentWorkspace, setCurrentWorkspace, updateWorkspace } = useWorkspaceContext();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the list of available workspaces
   */
  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await window.electron.ipcRenderer.invoke('workspace:list');
      setWorkspaces(response.workspaces);
    } catch (err) {
      setError('Failed to fetch workspaces');
      console.error('Error fetching workspaces:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Switches to a different workspace
   */
  const switchWorkspace = useCallback(async (workspaceId: string) => {
    try {
      setError(null);
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      await window.electron.ipcRenderer.invoke('workspace:switch', { workspaceId });
      setCurrentWorkspace(workspace);
    } catch (err) {
      setError('Failed to switch workspace');
      console.error('Error switching workspace:', err);
    }
  }, [workspaces, setCurrentWorkspace]);

  /**
   * Updates workspace settings
   */
  const updateWorkspaceSettings = useCallback(async (settings: Partial<Workspace>) => {
    try {
      setError(null);
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      const updatedWorkspace = new Workspace({
        ...currentWorkspace,
        ...settings,
        config: {
          ...currentWorkspace.config,
          ...settings.config,
        }
      });

      await window.electron.ipcRenderer.invoke('workspace:update', { workspace: updatedWorkspace });
      updateWorkspace(updatedWorkspace);
    } catch (err) {
      setError('Failed to update workspace settings');
      console.error('Error updating workspace settings:', err);
    }
  }, [currentWorkspace, updateWorkspace]);

  /**
   * Creates a new workspace
   */
  const createWorkspace = useCallback(async (name: string, description?: string) => {
    try {
      setError(null);
      const response = await window.electron.ipcRenderer.invoke('workspace:create', {
        name,
        description
      });

      if (response.success) {
        await fetchWorkspaces();
      }
    } catch (err) {
      setError('Failed to create workspace');
      console.error('Error creating workspace:', err);
    }
  }, [fetchWorkspaces]);

  /**
   * Deletes a workspace
   */
  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    try {
      setError(null);
      const response = await window.electron.ipcRenderer.invoke('workspace:delete', { workspaceId });

      if (response.success) {
        if (currentWorkspace?.id === workspaceId) {
          setCurrentWorkspace(null);
        }
        await fetchWorkspaces();
      }
    } catch (err) {
      setError('Failed to delete workspace');
      console.error('Error deleting workspace:', err);
    }
  }, [currentWorkspace, setCurrentWorkspace, fetchWorkspaces]);

  // Load workspaces on component mount
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return {
    workspace: currentWorkspace,
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    switchWorkspace,
    updateWorkspaceSettings,
    createWorkspace,
    deleteWorkspace
  };
};