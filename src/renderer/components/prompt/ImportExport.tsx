/**
 * @file ImportExport.tsx
 * @description UI component for importing and exporting prompts in the PromptNova application.
 * This component provides a user interface for importing prompts from files and exporting
 * prompts to files, with proper feedback and error handling.
 */

import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../../shared/ipc-types';
import { ImportExportError, ImportExportErrorType } from '../../../shared/utils/importExport';
import { Prompt } from '../../../shared/models/Prompt';

// Define IPC channels for import/export
declare module '../../../shared/ipc-types' {
  interface typeof IPC_CHANNELS {
    EXPORT_PROMPTS: 'prompt:export';
    IMPORT_PROMPTS: 'prompt:import';
  }
}

// Define props for the ImportExport component
interface ImportExportProps {
  /** Current prompts in the workspace */
  prompts: Prompt[];
  /** Current workspace ID */
  workspaceId?: string;
  /** Callback for when prompts are imported */
  onImport?: (prompts: Prompt[]) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * Component for importing and exporting prompts
 */
export const ImportExport: React.FC<ImportExportProps> = ({
  prompts,
  workspaceId,
  onImport,
  className = ''
}) => {
  // State for tracking operation status
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  /**
   * Handles exporting prompts to a file
   */
  const handleExport = async () => {
    if (prompts.length === 0) {
      setStatus({
        type: 'info',
        message: 'No prompts to export. Create some prompts first.'
      });
      return;
    }

    setIsExporting(true);
    setStatus({ type: 'info', message: 'Preparing export...' });

    try {
      // Get workspace data if needed
      const workspace = workspaceId ? { id: workspaceId } : undefined;
      
      // Call IPC to handle file export
      const result = await ipcRenderer.invoke(IPC_CHANNELS.EXPORT_PROMPTS, {
        prompts,
        workspace
      });

      if (result.success) {
        setStatus({
          type: 'success',
          message: `Prompts exported successfully to ${result.filePath}`
        });
      } else {
        setStatus({
          type: 'error',
          message: `Export failed: ${result.error}`
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      setStatus({
        type: 'error',
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handles importing prompts from a file
   */
  const handleImport = async () => {
    setIsImporting(true);
    setStatus({ type: 'info', message: 'Selecting file to import...' });

    try {
      // Call IPC to handle file import
      const result = await ipcRenderer.invoke(IPC_CHANNELS.IMPORT_PROMPTS);

      if (result.success) {
        setStatus({
          type: 'success',
          message: `Imported ${result.prompts.length} prompts successfully`
        });

        // Call the onImport callback if provided
        if (onImport && result.prompts) {
          onImport(result.prompts);
        }
      } else {
        // Handle different error types
        if (typeof result.error === 'object' && result.error.type) {
          const { type, message, details } = result.error;
          
          // Special handling for validation errors
          if (type === ImportExportErrorType.VALIDATION_ERROR && details) {
            const errorCount = details.length;
            setStatus({
              type: 'error',
              message: `Import validation failed: ${errorCount} prompts have errors. ${message}`
            });
          } else {
            setStatus({
              type: 'error',
              message: `Import failed: ${message}`
            });
          }
        } else {
          setStatus({
            type: 'error',
            message: `Import failed: ${result.error}`
          });
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      setStatus({
        type: 'error',
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Clears the current status message
   */
  const clearStatus = () => {
    setStatus({ type: null, message: '' });
  };

  return (
    <div className={`import-export-container ${className}`}>
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleExport}
          disabled={isExporting || isImporting}
        >
          {isExporting ? 'Exporting...' : 'Export Prompts'}
        </button>
        
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          onClick={handleImport}
          disabled={isExporting || isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Prompts'}
        </button>
      </div>

      {status.type && (
        <div
          className={`status-message p-3 rounded mb-4 ${
            status.type === 'success' ? 'bg-green-100 text-green-800' :
            status.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}
        >
          <div className="flex justify-between items-center">
            <p>{status.message}</p>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={clearStatus}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExport;