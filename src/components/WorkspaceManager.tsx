import React, { useCallback, useState } from 'react';
import { useWorkspaceContext } from '../shared/WorkspaceContextProvider';

interface WorkspaceTemplate {
  name: string;
  description: string;
  folderStructure: Record<string, any>;
}

interface WorkspaceManagerProps {
  onWorkspaceChange?: (workspaceName: string) => void;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ onWorkspaceChange }) => {
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceContext();
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);

  const createWorkspace = useCallback(async (name: string, template?: WorkspaceTemplate) => {
    try {
      // TODO: Implement IPC call to create workspace directory
      const response = await window.electron.ipcRenderer.invoke('workspace:create', {
        name,
        template: template?.folderStructure
      });

      if (response.success) {
        setCurrentWorkspace(name);
        onWorkspaceChange?.(name);
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  }, [setCurrentWorkspace, onWorkspaceChange]);

  const deleteWorkspace = useCallback(async (name: string) => {
    try {
      // TODO: Implement IPC call to delete workspace directory
      const response = await window.electron.ipcRenderer.invoke('workspace:delete', { name });

      if (response.success && currentWorkspace === name) {
        setCurrentWorkspace('');
        onWorkspaceChange?.('');
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  }, [currentWorkspace, setCurrentWorkspace, onWorkspaceChange]);

  const loadTemplates = useCallback(async () => {
    try {
      // TODO: Implement IPC call to load workspace templates
      const response = await window.electron.ipcRenderer.invoke('workspace:loadTemplates');
      if (response.success) {
        setTemplates(response.templates);
      }
    } catch (error) {
      console.error('Failed to load workspace templates:', error);
    }
  }, []);

  return (
    <div className="workspace-manager">
      <div className="workspace-controls">
        <button
          onClick={() => createWorkspace('New Workspace')}
          className="btn btn-primary"
        >
          Create Workspace
        </button>
        {currentWorkspace && (
          <button
            onClick={() => deleteWorkspace(currentWorkspace)}
            className="btn btn-danger"
          >
            Delete Current Workspace
          </button>
        )}
      </div>

      <div className="workspace-templates">
        <h3>Available Templates</h3>
        <div className="template-list">
          {templates.map((template) => (
            <div key={template.name} className="template-item">
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              <button
                onClick={() => createWorkspace(`New ${template.name}`, template)}
                className="btn btn-secondary"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManager;