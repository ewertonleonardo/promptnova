/**
 * @file WorkspaceSettings.tsx
 * @description A component that provides workspace configuration and settings management.
 * This component allows users to edit workspace properties and configure workspace-specific settings.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Workspace } from '../../../shared/models/Workspace';
import { useWorkspaceContext } from '../../../shared/WorkspaceContextProvider';

interface WorkspaceSettingsProps {
  /** Optional callback when workspace settings are saved */
  onSettingsSaved?: (workspace: Workspace) => void;
}

/**
 * WorkspaceSettings component provides UI for configuring workspace settings
 */
export const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ onSettingsSaved }) => {
  const { currentWorkspace, updateWorkspace } = useWorkspaceContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load current workspace settings when component mounts or workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name);
      setDescription(currentWorkspace.description || '');
      
      // Load settings if they exist
      if (currentWorkspace.config?.settings) {
        setAutoSave(currentWorkspace.config.settings.autoSave ?? true);
        setFontSize(currentWorkspace.config.settings.fontSize ?? 14);
        setTheme(currentWorkspace.config.settings.theme ?? 'system');
      }
    }
  }, [currentWorkspace]);

  /**
   * Handles saving workspace settings
   */
  const handleSaveSettings = useCallback(async () => {
    if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Create updated workspace object
      const updatedWorkspace = new Workspace({
        ...currentWorkspace,
        name,
        description,
        config: {
          ...currentWorkspace.config,
          settings: {
            ...currentWorkspace.config?.settings,
            autoSave,
            fontSize,
            theme
          }
        }
      });
      
      // Validate the workspace
      const validationErrors = updatedWorkspace.validate();
      if (validationErrors.length > 0) {
        setError(validationErrors.map(err => err.message).join('\n'));
        return;
      }
      
      // Save the workspace via IPC
      await window.electron.ipcRenderer.invoke('workspace:update', { workspace: updatedWorkspace });
      
      // Update context
      updateWorkspace(updatedWorkspace);
      
      // Call callback if provided
      onSettingsSaved?.(updatedWorkspace);
      
      setSuccess('Workspace settings saved successfully');
    } catch (err) {
      setError('Failed to save workspace settings');
      console.error('Error saving workspace settings:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, name, description, autoSave, fontSize, theme, updateWorkspace, onSettingsSaved]);

  if (!currentWorkspace) {
    return <div className="p-4">No workspace selected</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Workspace Settings</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="workspace-name" className="block text-sm font-medium mb-1">
            Workspace Name
          </label>
          <input
            id="workspace-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="workspace-description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="workspace-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md h-24"
            disabled={loading}
          />
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-3">Display Settings</h3>
          
          <div className="mb-3">
            <label htmlFor="theme-select" className="block text-sm font-medium mb-1">
              Theme
            </label>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="w-full p-2 border rounded-md"
              disabled={loading}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="font-size" className="block text-sm font-medium mb-1">
              Font Size ({fontSize}px)
            </label>
            <input
              id="font-size"
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="auto-save"
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="mr-2"
              disabled={loading}
            />
            <label htmlFor="auto-save" className="text-sm">
              Auto-save changes
            </label>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};