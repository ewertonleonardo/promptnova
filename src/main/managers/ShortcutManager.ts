/**
 * ShortcutManager.ts
 * Manages global keyboard shortcuts for the application.
 *
 * This class handles the registration and management of global shortcuts,
 * ensuring proper cleanup and preventing conflicts. It provides a centralized
 * way to handle keyboard shortcuts across the entire application.
 */

import { globalShortcut } from 'electron';

export class ShortcutManager {
  private shortcuts: Map<string, () => void>;

  constructor() {
    this.shortcuts = new Map();
  }

  /**
   * Registers a global shortcut
   * @param accelerator - The keyboard shortcut (e.g., 'CommandOrControl+Space')
   * @param callback - The function to execute when the shortcut is triggered
   * @returns boolean - True if registration was successful
   * @throws Error if the shortcut is already registered
   */
  public registerShortcut(accelerator: string, callback: () => void): boolean {
    try {
      if (this.shortcuts.has(accelerator)) {
        throw new Error(`Shortcut ${accelerator} is already registered`);
      }

      const success = globalShortcut.register(accelerator, () => {
        try {
          callback();
        } catch (error) {
          console.error(`Error executing shortcut ${accelerator}:`, error);
        }
      });

      if (success) {
        this.shortcuts.set(accelerator, callback);
        return true;
      } else {
        throw new Error(`Failed to register shortcut ${accelerator}`);
      }
    } catch (error) {
      console.error('Error registering shortcut:', error);
      return false;
    }
  }

  /**
   * Unregisters a specific global shortcut
   * @param accelerator - The keyboard shortcut to unregister
   * @returns boolean - True if unregistration was successful
   */
  public unregisterShortcut(accelerator: string): boolean {
    try {
      globalShortcut.unregister(accelerator);
      this.shortcuts.delete(accelerator);
      return true;
    } catch (error) {
      console.error('Error unregistering shortcut:', error);
      return false;
    }
  }

  /**
   * Checks if a shortcut is registered
   * @param accelerator - The keyboard shortcut to check
   * @returns boolean - True if the shortcut is registered
   */
  public isRegistered(accelerator: string): boolean {
    return globalShortcut.isRegistered(accelerator);
  }

  /**
   * Unregisters all shortcuts
   * This should be called when cleaning up the application
   */
  public unregisterAll(): void {
    try {
      globalShortcut.unregisterAll();
      this.shortcuts.clear();
    } catch (error) {
      console.error('Error unregistering all shortcuts:', error);
    }
  }

  /**
   * Gets all registered shortcuts
   * @returns string[] - Array of registered shortcut accelerators
   */
  public getRegisteredShortcuts(): string[] {
    return Array.from(this.shortcuts.keys());
  }
}