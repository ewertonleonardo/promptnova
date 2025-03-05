/**
 * Main process entry point for PromptNova
 * 
 * This file initializes the Electron application, creates the main window,
 * sets up IPC communication, and handles application lifecycle events.
 */

import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import { registerIpcHandlers } from './ipc/index';
import * as path from 'path';
import * as url from 'url';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

/**
 * Creates the main application window
 */
function createWindow() {
  // Create the browser window with appropriate settings
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // Set window properties for a modern look
    frame: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff',
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    // In development, load from webpack dev server
    mainWindow.loadURL('http://localhost:9000/renderer/index.html');
    // Open DevTools for debugging
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Handle window closed event
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

/**
 * Initialize the application when Electron is ready
 */
app.whenReady().then(() => {
  createWindow();
  
  // Register all IPC handlers
  registerIpcHandlers();

  // Set up global shortcuts here
  // Example: globalShortcut.register('CommandOrControl+Space', () => { /* Show/hide app */ });

  // Re-create window when app is activated (macOS behavior)
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

/**
 * Quit the application when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  // On macOS, applications stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Clean up resources when app is about to quit
 */
app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Note: IPC handlers are now registered in the registerIpcHandlers function
// from the ipc/index.ts file. This provides better organization and separation of concerns.