/**
 * @file WorkspaceSelector.tsx
 * @description A component that provides workspace selection and management functionality.
 * This component allows users to switch between workspaces and displays workspace information.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Workspace } from '../../../shared/models/Workspace';
import { useWorkspaceContext } from '../../../shared/WorkspaceContextProvider';

interface WorkspaceSelectorProps {
  /** Optional callback when workspace selection changes */
  onWorkspaceChange?: (workspace: Workspace) => void;
}

/**
 * WorkspaceSelector component provides UI for selecting and managing workspaces
 */
export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ onWorkspaceChange }) => {
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceContext();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the list of available workspaces from the main process
   */
  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const response = await window.electron.ipcRenderer.invoke('workspace:list');
      setWorkspaces(response.workspaces);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workspaces');
      console.error('Error fetching workspaces:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handles workspace selection change
   */
  const handleWorkspaceChange = useCallback(async (workspaceId: string) => {
    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        await window.electron.ipcRenderer.invoke('workspace:switch', { workspaceId });
        setCurrentWorkspace(workspace);
        onWorkspaceChange?.(workspace);
      }
    } catch (err) {
      setError('Failed to switch workspace');
      console.error('Error switching workspace:', err);
    }
  }, [workspaces, setCurrentWorkspace, onWorkspaceChange]);

  // Load workspaces on component mount
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  if (loading) {
    return <div className="p-4">Loading workspaces...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
        <button
          onClick={fetchWorkspaces}
          className="ml-2 text-blue-500 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Select Workspace</h2>
      <div className="space-y-2">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => handleWorkspaceChange(workspace.id)}
            className={`w-full p-3 text-left rounded-lg transition-colors ${workspace.id === currentWorkspace?.id
              ? 'bg-blue-100 dark:bg-blue-900'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <div className="font-medium">{workspace.name}</div>
            {workspace.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {workspace.description}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};