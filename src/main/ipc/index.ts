/**
 * IPC handler registration for PromptNova
 * 
 * This file serves as the central registration point for all IPC handlers
 * that facilitate communication between the main and renderer processes.
 */

import { ipcMain } from 'electron';
import { registerPromptHandlers } from './prompt';
import { registerWorkspaceHandlers } from './workspace';
import { IPC_CHANNELS, IPCResponse } from '../../shared/ipc-types';

/**
 * Registers all IPC handlers for the application
 * 
 * This function should be called during application initialization
 * to set up all the necessary communication channels.
 */
export function registerIpcHandlers(): void {
  // Register specific handler groups
  registerPromptHandlers();
  registerWorkspaceHandlers();
  
  // Register general application handlers
  registerGeneralHandlers();
  
  console.log('All IPC handlers registered successfully');
}

/**
 * Registers general application-level IPC handlers
 * 
 * These handlers are for application-wide functionality that
 * doesn't fit into specific feature categories.
 */
function registerGeneralHandlers(): void {
  // Example of a simple handler for getting application version
  ipcMain.handle('app:get-version', (event): IPCResponse<string> => {
    try {
      const version = process.env.npm_package_version || 'unknown';
      return { success: true, data: version };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
  
  // Add more general handlers as needed
}

/**
 * Helper function to create a standardized error response
 * 
 * @param error - The error that occurred
 * @returns A standardized error response object
 */
export function createErrorResponse(error: unknown): IPCResponse<never> {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error occurred'
  };
}

/**
 * Helper function to create a standardized success response
 * 
 * @param data - The data to include in the response
 * @returns A standardized success response object
 */
export function createSuccessResponse<T>(data: T): IPCResponse<T> {
  return {
    success: true,
    data
  };
}