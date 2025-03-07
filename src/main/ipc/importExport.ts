/**
 * @file importExport.ts
 * @description IPC handlers for import/export operations in the PromptNova application.
 * This module manages file system operations and communication between main and renderer
 * processes for importing and exporting prompts.
 */

import { ipcMain, dialog, app } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import { IPC_CHANNELS } from '../../shared/ipc-types';
import { validateImportData, processImportData, prepareExport, ImportExportError } from '../../shared/utils/importExport';

// Add import/export channels to IPC_CHANNELS
declare module '../../shared/ipc-types' {
  interface typeof IPC_CHANNELS {
    EXPORT_PROMPTS: 'prompt:export';
    IMPORT_PROMPTS: 'prompt:import';
  }
}

/**
 * Registers IPC handlers for import/export operations
 */
export function registerImportExportHandlers(): void {
  // Handler for exporting prompts
  ipcMain.handle(IPC_CHANNELS.EXPORT_PROMPTS, async (event, data) => {
    try {
      const { prompts, workspace } = data;
      const exportData = prepareExport(prompts, workspace);

      // Show save dialog
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Prompts',
        defaultPath: path.join(app.getPath('documents'), 'prompts-export.json'),
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (!filePath) {
        throw new Error('Export cancelled');
      }

      // Write export data to file
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');

      return { success: true, filePath };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during export'
      };
    }
  });

  // Handler for importing prompts
  ipcMain.handle(IPC_CHANNELS.IMPORT_PROMPTS, async () => {
    try {
      // Show open dialog
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Prompts',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
      });

      if (filePaths.length === 0) {
        throw new Error('Import cancelled');
      }

      // Read and parse import file
      const fileContent = await fs.readFile(filePaths[0], 'utf8');
      const importData = JSON.parse(fileContent);

      // Validate import data
      validateImportData(importData);

      // Process and return imported prompts
      const processedPrompts = processImportData(importData);
      return { success: true, prompts: processedPrompts };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        error: error instanceof ImportExportError
          ? { type: error.type, message: error.message, details: error.details }
          : error instanceof Error
          ? error.message
          : 'Unknown error during import'
      };
    }
  });
}