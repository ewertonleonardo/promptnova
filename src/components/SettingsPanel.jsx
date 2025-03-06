import { useEffect, useState } from 'react';
import { workspaceContext } from '@/shared/WorkspaceContextProvider';
import { WorkspaceEvent } from '@/shared/models/WorkspaceContext';

export function SettingsPanel() {
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'system',
    fontSize: 14,
    autoSave: true
  });

  useEffect(() => {
    const initializeSettings = async () => {
      const currentWorkspace = await workspaceContext.getCurrentWorkspace();
      if (currentWorkspace) {
        setWorkspace(currentWorkspace);
        setSettings(currentWorkspace.config.settings);
      }
      setIsLoading(false);
    };

    initializeSettings();

    const handleWorkspaceChange = (updatedWorkspace) => {
      setWorkspace(updatedWorkspace);
      setSettings(updatedWorkspace.config.settings);
      setIsDirty(false);
    };

    workspaceContext.addEventListener(WorkspaceEvent.WORKSPACE_CHANGED, handleWorkspaceChange);
    workspaceContext.addEventListener(WorkspaceEvent.CONFIG_UPDATED, handleWorkspaceChange);

    return () => {
      workspaceContext.removeEventListener(WorkspaceEvent.WORKSPACE_CHANGED, handleWorkspaceChange);
      workspaceContext.removeEventListener(WorkspaceEvent.CONFIG_UPDATED, handleWorkspaceChange);
    };
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!workspace || !isDirty) return;

    const success = await workspaceContext.updateWorkspaceConfig({
      settings
    });

    if (success) {
      setIsDirty(false);
    }
  };

  const handleExport = () => {
    if (!workspace) return;

    const exportData = {
      config: workspace.config,
      state: workspace.state
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.config.name}-settings.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.config && importedData.config.settings) {
          const success = await workspaceContext.updateWorkspaceConfig({
            settings: importedData.config.settings
          });
          if (success) {
            setSettings(importedData.config.settings);
            setIsDirty(false);
          }
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workspace Settings</h2>
        <div className="space-x-2">
          <button
            onClick={handleExport}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export
          </button>
          <label className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Font Size</label>
          <input
            type="number"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
            min="10"
            max="24"
            className="px-3 py-1 border rounded w-20"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Auto Save</label>
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
            className="h-4 w-4"
          />
        </div>
      </div>

      {isDirty && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}