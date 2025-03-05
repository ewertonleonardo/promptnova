/**
 * ClipboardManager.ts
 * Manages clipboard operations for the application.
 *
 * This class provides a centralized way to handle clipboard operations,
 * including reading and writing text, and managing clipboard state.
 * It wraps Electron's clipboard module with error handling and type safety.
 */

import { clipboard } from 'electron';

export class ClipboardManager {
  /**
   * Writes text to the system clipboard
   * @param text - The text to write to the clipboard
   * @returns boolean - True if the operation was successful
   */
  public writeText(text: string): boolean {
    try {
      clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error writing to clipboard:', error);
      return false;
    }
  }

  /**
   * Reads text from the system clipboard
   * @returns string - The text from the clipboard
   * @throws Error if the clipboard cannot be read
   */
  public readText(): string {
    try {
      return clipboard.readText();
    } catch (error) {
      console.error('Error reading from clipboard:', error);
      throw new Error(`Failed to read from clipboard: ${error.message}`);
    }
  }

  /**
   * Clears the system clipboard
   * @returns boolean - True if the operation was successful
   */
  public clear(): boolean {
    try {
      clipboard.clear();
      return true;
    } catch (error) {
      console.error('Error clearing clipboard:', error);
      return false;
    }
  }

  /**
   * Checks if the clipboard contains text
   * @returns boolean - True if the clipboard contains text
   */
  public hasText(): boolean {
    try {
      const text = clipboard.readText();
      return text.length > 0;
    } catch (error) {
      console.error('Error checking clipboard content:', error);
      return false;
    }
  }

  /**
   * Writes text to the clipboard only if it's different from current content
   * @param text - The text to write to the clipboard
   * @returns boolean - True if the operation was successful and content was different
   */
  public writeTextIfDifferent(text: string): boolean {
    try {
      const currentText = this.readText();
      if (currentText !== text) {
        return this.writeText(text);
      }
      return false;
    } catch (error) {
      console.error('Error in writeTextIfDifferent:', error);
      return false;
    }
  }
}