/**
 * WindowManager.ts
 * Manages window creation and management for the application.
 *
 * This class provides a centralized way to handle window operations,
 * including creating, showing, hiding, and positioning windows.
 * It manages both the main application window and the floating prompt window.
 */

import { BrowserWindow, screen, app } from 'electron';
import * as path from 'path';
import * as url from 'url';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private floatingWindow: BrowserWindow | null = null;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Creates and shows the main application window
   * @returns BrowserWindow - The created main window
   */
  public createMainWindow(): BrowserWindow {
    // Close existing window if it exists
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }

    // Create the browser window with appropriate settings
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js'),
      },
      // Set window properties for a modern look
      frame: true,
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#ffffff',
    });

    // Load the app
    if (this.isDevelopment) {
      // In development, load from webpack dev server
      this.mainWindow.loadURL('http://localhost:9000/renderer/index.html');
      // Open DevTools for debugging
      this.mainWindow.webContents.openDevTools();
    } else {
      // In production, load from built files
      this.mainWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, '../../renderer/index.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
    }

    // Handle window closed event
    this.mainWindow.on('closed', () => {
      // Dereference the window object
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  /**
   * Creates and shows the floating prompt window
   * @returns BrowserWindow - The created floating window
   */
  public createFloatingWindow(): BrowserWindow {
    // Close existing window if it exists
    if (this.floatingWindow) {
      this.floatingWindow.close();
      this.floatingWindow = null;
    }

    // Get the cursor position to place the window near it
    const cursorPosition = screen.getCursorScreenPoint();
    const displayBounds = screen.getDisplayNearestPoint(cursorPosition).workArea;

    // Create the floating window with appropriate settings
    this.floatingWindow = new BrowserWindow({
      width: 500,
      height: 400,
      x: cursorPosition.x,
      y: cursorPosition.y,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js'),
      },
      // Set window properties for a floating appearance
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      show: false, // Don't show until ready
    });

    // Adjust position to ensure window is fully visible
    this.adjustFloatingWindowPosition(displayBounds);

    // Load the floating window content
    if (this.isDevelopment) {
      this.floatingWindow.loadURL('http://localhost:9000/renderer/floating.html');
    } else {
      this.floatingWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, '../../renderer/floating.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
    }

    // Show window when ready to prevent flickering
    this.floatingWindow.once('ready-to-show', () => {
      if (this.floatingWindow) {
        this.floatingWindow.show();
      }
    });

    // Handle window closed event
    this.floatingWindow.on('closed', () => {
      this.floatingWindow = null;
    });

    // Allow window to be moved by dragging
    this.floatingWindow.on('will-move', (event, newBounds) => {
      // Ensure window stays within screen bounds
      const display = screen.getDisplayNearestPoint({ x: newBounds.x, y: newBounds.y });
      const bounds = display.workArea;
      
      if (newBounds.x < bounds.x) {
        newBounds.x = bounds.x;
      } else if (newBounds.x + newBounds.width > bounds.x + bounds.width) {
        newBounds.x = bounds.x + bounds.width - newBounds.width;
      }
      
      if (newBounds.y < bounds.y) {
        newBounds.y = bounds.y;
      } else if (newBounds.y + newBounds.height > bounds.y + bounds.height) {
        newBounds.y = bounds.y + bounds.height - newBounds.height;
      }
    });

    return this.floatingWindow;
  }

  /**
   * Adjusts the position of the floating window to ensure it's fully visible
   * @param displayBounds - The bounds of the display
   */
  private adjustFloatingWindowPosition(displayBounds: Electron.Rectangle): void {
    if (!this.floatingWindow) return;
    
    const windowBounds = this.floatingWindow.getBounds();
    
    // Adjust x position if window would be off-screen
    if (windowBounds.x + windowBounds.width > displayBounds.x + displayBounds.width) {
      windowBounds.x = displayBounds.x + displayBounds.width - windowBounds.width;
    }
    if (windowBounds.x < displayBounds.x) {
      windowBounds.x = displayBounds.x;
    }
    
    // Adjust y position if window would be off-screen
    if (windowBounds.y + windowBounds.height > displayBounds.y + displayBounds.height) {
      windowBounds.y = displayBounds.y + displayBounds.height - windowBounds.height;
    }
    if (windowBounds.y < displayBounds.y) {
      windowBounds.y = displayBounds.y;
    }
    
    this.floatingWindow.setBounds(windowBounds);
  }

  /**
   * Shows or hides the floating window
   * @param show - Whether to show or hide the window
   */
  public toggleFloatingWindow(show: boolean): void {
    if (show) {
      if (!this.floatingWindow) {
        this.createFloatingWindow();
      } else {
        this.floatingWindow.show();
      }
    } else {
      if (this.floatingWindow) {
        this.floatingWindow.hide();
      }
    }
  }

  /**
   * Gets the main window instance
   * @returns BrowserWindow | null - The main window or null if it doesn't exist
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Gets the floating window instance
   * @returns BrowserWindow | null - The floating window or null if it doesn't exist
   */
  public getFloatingWindow(): BrowserWindow | null {
    return this.floatingWindow;
  }

  /**
   * Closes all windows and cleans up resources
   */
  public closeAllWindows(): void {
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }
    
    if (this.floatingWindow) {
      this.floatingWindow.close();
      this.floatingWindow = null;
    }
  }
}