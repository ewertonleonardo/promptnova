/**
 * FileSystemManager.ts
 * Manages file system operations for the application.
 *
 * This class provides a centralized way to handle file operations such as
 * reading and writing files, creating directories, and managing workspaces.
 * It abstracts the Node.js fs module and provides error handling and logging.
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export class FileSystemManager {
  private appDataPath: string;

  constructor() {
    // Set up the application data path
    this.appDataPath = path.join(app.getPath('userData'), 'PromptNova');
    this.ensureAppDataDirectory();
  }

  /**
   * Ensures the application data directory exists
   * Creates it if it doesn't exist
   */
  private ensureAppDataDirectory(): void {
    try {
      if (!fs.existsSync(this.appDataPath)) {
        fs.mkdirSync(this.appDataPath, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating app data directory:', error);
      throw new Error(`Failed to create application data directory: ${error.message}`);
    }
  }

  /**
   * Gets the path to the application data directory
   * @returns string - The absolute path to the app data directory
   */
  public getAppDataPath(): string {
    return this.appDataPath;
  }

  /**
   * Reads a file from the specified path
   * @param filePath - The path to the file
   * @returns string - The file contents
   * @throws Error if the file cannot be read
   */
  public readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Writes data to a file at the specified path
   * @param filePath - The path to the file
   * @param data - The data to write
   * @throws Error if the file cannot be written
   */
  public writeFile(filePath: string, data: string): void {
    try {
      // Ensure the directory exists
      const dirPath = path.dirname(filePath);
      this.ensureDirectoryExists(dirPath);
      
      // Write the file
      fs.writeFileSync(filePath, data, 'utf8');
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Ensures a directory exists, creating it if necessary
   * @param dirPath - The path to the directory
   * @throws Error if the directory cannot be created
   */
  public ensureDirectoryExists(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Checks if a file exists
   * @param filePath - The path to the file
   * @returns boolean - True if the file exists
   */
  public fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch (error) {
      console.error(`Error checking if file exists ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Checks if a directory exists
   * @param dirPath - The path to the directory
   * @returns boolean - True if the directory exists
   */
  public directoryExists(dirPath: string): boolean {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch (error) {
      console.error(`Error checking if directory exists ${dirPath}:`, error);
      return false;
    }
  }

  /**
   * Deletes a file
   * @param filePath - The path to the file
   * @throws Error if the file cannot be deleted
   */
  public deleteFile(filePath: string): void {
    try {
      if (this.fileExists(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Lists files in a directory
   * @param dirPath - The path to the directory
   * @returns string[] - Array of file names in the directory
   * @throws Error if the directory cannot be read
   */
  public listFiles(dirPath: string): string[] {
    try {
      if (!this.directoryExists(dirPath)) {
        return [];
      }
      
      return fs.readdirSync(dirPath)
        .filter(file => fs.statSync(path.join(dirPath, file)).isFile());
    } catch (error) {
      console.error(`Error listing files in directory ${dirPath}:`, error);
      throw new Error(`Failed to list files in directory ${dirPath}: ${error.message}`);
    }
  }
}