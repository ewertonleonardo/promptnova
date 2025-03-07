import { ipcMain, WebContents } from 'electron';
import MainErrorHandler from '../utils/ErrorHandler';

interface ErrorDetails {
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  context?: Record<string, unknown>;
}

/**
 * Sets up IPC handlers for error reporting and management
 * @param webContents The WebContents instance to send error notifications to
 */
export function setupErrorIpcHandlers(webContents: WebContents): void {
  const errorHandler = MainErrorHandler.getInstance();

  // Handle error reports from the renderer process
  ipcMain.handle('error:report', (_, errorDetails: ErrorDetails) => {
    errorHandler.handleError(errorDetails);
    return { success: true };
  });

  // Handle critical errors from the renderer process
  ipcMain.handle('error:critical', (_, errorDetails: ErrorDetails) => {
    errorHandler.handleError({
      ...errorDetails,
      severity: 'critical'
    });
    return { success: true };
  });

  // Get error logs
  ipcMain.handle('error:getLogs', () => {
    return errorHandler.getErrorLog();
  });

  // Clear error logs
  ipcMain.handle('error:clearLogs', () => {
    errorHandler.clearErrorLog();
    return { success: true };
  });

  // Get error log file path
  ipcMain.handle('error:getLogFilePath', () => {
    return errorHandler.getLogFilePath();
  });

  // Setup notification for new errors to the renderer
  const notifyRenderer = (errorDetails: ErrorDetails): void => {
    if (webContents && !webContents.isDestroyed()) {
      webContents.send('error:notification', errorDetails);
    }
  };

  // Subscribe to error events
  process.on('error:new', (errorDetails: ErrorDetails) => {
    notifyRenderer(errorDetails);
  });
}

/**
 * Registers the error IPC handlers in the main IPC registry
 */
export function registerErrorIpcHandlers(): void {
  // This function will be called from the main IPC index file
  // to register all error-related IPC handlers
  console.log('Error IPC handlers registered');
}