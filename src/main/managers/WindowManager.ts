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

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isAlwaysOnTop: boolean;
}

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private floatingWindow: BrowserWindow | null = null;
  private isDevelopment: boolean;
  private windowStates: Map<string, WindowState> = new Map();

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.loadWindowStates();
  }

  /**
   * Loads saved window states from storage
   */
  private loadWindowStates(): void {
    try {
      const savedStates = app.getPath('userData');
      const states = require(path.join(savedStates, 'window-states.json'));
      Object.entries(states).forEach(([key, state]) => {
        this.windowStates.set(key, state as WindowState);
      });
    } catch (error) {
      console.log('No saved window states found');
    }
  }

  /**
   * Saves current window states to storage
   */
  private saveWindowStates(): void {
    const states = Object.fromEntries(this.windowStates.entries());
    const savedStates = app.getPath('userData');
    require('fs').writeFileSync(
      path.join(savedStates, 'window-states.json'),
      JSON.stringify(states, null, 2)
    );
  }

  /**
   * Updates the state of a window
   * @param windowId - The identifier of the window
   * @param window - The window instance
   */
  private updateWindowState(windowId: string, window: BrowserWindow): void {
    const bounds = window.getBounds();
    this.windowStates.set(windowId, {
      ...bounds,
      isMaximized: window.isMaximized(),
      isAlwaysOnTop: window.isAlwaysOnTop()
    });
    this.saveWindowStates();
  }

  /**
   * Creates and shows the main application window
   * @returns BrowserWindow - The created main window
   */
  public createMainWindow(): BrowserWindow {
    const savedState = this.windowStates.get('main');
    // Close existing window if it exists
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }

    // Create the browser window with appropriate settings
    this.mainWindow = new BrowserWindow({
      width: savedState?.width || 1200,
      height: savedState?.height || 800,
      x: savedState?.x,
      y: savedState?.y,
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

    // Restore maximized state if needed
    if (savedState?.isMaximized) {
      this.mainWindow.maximize();
    }

    // Set always on top if previously enabled
    if (savedState?.isAlwaysOnTop) {
      this.mainWindow.setAlwaysOnTop(true);
    }

    // Save window state on changes
    this.mainWindow.on('resize', () => {
      if (this.mainWindow) {
        this.updateWindowState('main', this.mainWindow);
      }
    });

    this.mainWindow.on('move', () => {
      if (this.mainWindow) {
        this.updateWindowState('main', this.mainWindow);
      }
    });

    // Handle window closed event
    this.mainWindow.on('closed', () => {
      if (this.mainWindow) {
        this.updateWindowState('main', this.mainWindow);
      }
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
    const savedState = this.windowStates.get('floating');
    // Close existing window if it exists
    if (this.floatingWindow) {
      this.floatingWindow.close();
      this.floatingWindow = null;
    }

    // Use saved position or get cursor position
    const position = savedState ? { x: savedState.x, y: savedState.y } : screen.getCursorScreenPoint();
    const displayBounds = screen.getDisplayNearestPoint(position).workArea;

    // Create the floating window with appropriate settings
    this.floatingWindow = new BrowserWindow({
      width: savedState?.width || 500,
      height: savedState?.height || 400,
      x: position.x,
      y: position.y,
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

    // Save window state on changes
    this.floatingWindow.on('resize', () => {
      if (this.floatingWindow) {
        this.updateWindowState('floating', this.floatingWindow);
      }
    });

    this.floatingWindow.on('move', () => {
      if (this.floatingWindow) {
        this.updateWindowState('floating', this.floatingWindow);
      }
    });

    // Handle window closed event
    this.floatingWindow.on('closed', () => {
      if (this.floatingWindow) {
        this.updateWindowState('floating', this.floatingWindow);
      }
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