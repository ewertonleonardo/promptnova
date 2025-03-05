/**
 * @file LocalStorage.ts
 * @description Implements the storage adapter interface using local file system storage.
 * This module provides a concrete implementation of the StorageAdapter interface
 * for persisting application data to the local file system using Electron's APIs.
 */

import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageAdapter, MetadataStorageAdapter } from './StorageAdapter';

/**
 * Configuration options for LocalStorage
 */
export interface LocalStorageOptions {
  /** Base directory for storage (relative to user data directory) */
  baseDir?: string;
  /** File extension for data files */
  fileExtension?: string;
  /** Whether to pretty print JSON data */
  prettyPrint?: boolean;
}

/**
 * Default options for LocalStorage
 */
const DEFAULT_OPTIONS: LocalStorageOptions = {
  baseDir: 'storage',
  fileExtension: '.json',
  prettyPrint: false,
};

/**
 * Implementation of StorageAdapter using local file system
 * @template T The type of data to be stored
 */
export class LocalStorage<T extends { id: string }> implements StorageAdapter<T>, MetadataStorageAdapter {
  private baseDir: string;
  private dataDir: string;
  private metadataDir: string;
  private fileExtension: string;
  private prettyPrint: boolean;
  private initialized: boolean = false;

  /**
   * Creates a new LocalStorage instance
   * @param collectionName Name of the data collection (used for directory naming)
   * @param options Configuration options
   */
  constructor(private collectionName: string, options: LocalStorageOptions = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    this.baseDir = mergedOptions.baseDir!;
    this.fileExtension = mergedOptions.fileExtension!;
    this.prettyPrint = mergedOptions.prettyPrint!;
    
    // Set up directory paths
    const userDataPath = app.getPath('userData');
    this.dataDir = path.join(userDataPath, this.baseDir, this.collectionName);
    this.metadataDir = path.join(userDataPath, this.baseDir, '_metadata');
  }

  /**
   * Initializes the storage by creating necessary directories
   * @returns Promise resolving when initialization is complete
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Create metadata directory if it doesn't exist
      await fs.mkdir(this.metadataDir, { recursive: true });
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize local storage:', error);
      throw new Error(`Failed to initialize local storage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets the file path for an item
   * @param id Item ID
   * @returns Full file path
   */
  private getFilePath(id: string): string {
    return path.join(this.dataDir, `${id}${this.fileExtension}`);
  }

  /**
   * Gets the file path for a metadata item
   * @param key Metadata key
   * @returns Full file path
   */
  private getMetadataFilePath(key: string): string {
    return path.join(this.metadataDir, `${key}${this.fileExtension}`);
  }

  /**
   * Serializes data to JSON
   * @param data Data to serialize
   * @returns JSON string
   */
  private serialize(data: any): string {
    return this.prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /**
   * Deserializes JSON to data
   * @param json JSON string
   * @returns Deserialized data
   */
  private deserialize<U>(json: string): U {
    return JSON.parse(json) as U;
  }

  /**
   * Retrieves all items from storage
   * @returns Promise resolving to an array of items
   */
  public async getAll(): Promise<T[]> {
    await this.initialize();

    try {
      const files = await fs.readdir(this.dataDir);
      const dataFiles = files.filter(file => file.endsWith(this.fileExtension));
      
      const items: T[] = [];
      for (const file of dataFiles) {
        const filePath = path.join(this.dataDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        items.push(this.deserialize<T>(data));
      }
      
      return items;
    } catch (error) {
      console.error('Failed to get all items:', error);
      return [];
    }
  }

  /**
   * Retrieves a single item by its ID
   * @param id The unique identifier of the item
   * @returns Promise resolving to the item if found, null otherwise
   */
  public async getById(id: string): Promise<T | null> {
    await this.initialize();

    try {
      const filePath = this.getFilePath(id);
      const data = await fs.readFile(filePath, 'utf-8');
      return this.deserialize<T>(data);
    } catch (error) {
      // File not found or other error
      return null;
    }
  }

  /**
   * Creates a new item in storage
   * @param item The item to create
   * @returns Promise resolving to the created item
   */
  public async create(item: T): Promise<T> {
    await this.initialize();

    try {
      const filePath = this.getFilePath(item.id);
      const serialized = this.serialize(item);
      await fs.writeFile(filePath, serialized, 'utf-8');
      return item;
    } catch (error) {
      console.error('Failed to create item:', error);
      throw new Error(`Failed to create item: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Updates an existing item in storage
   * @param id The unique identifier of the item to update
   * @param itemData The updated item data
   * @returns Promise resolving to the updated item if successful, null if item not found
   */
  public async update(id: string, itemData: Partial<T>): Promise<T | null> {
    await this.initialize();

    try {
      // Get existing item
      const existingItem = await this.getById(id);
      if (!existingItem) return null;

      // Merge existing item with updates
      const updatedItem = { ...existingItem, ...itemData } as T;
      
      // Save updated item
      const filePath = this.getFilePath(id);
      const serialized = this.serialize(updatedItem);
      await fs.writeFile(filePath, serialized, 'utf-8');
      
      return updatedItem;
    } catch (error) {
      console.error('Failed to update item:', error);
      throw new Error(`Failed to update item: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deletes an item from storage
   * @param id The unique identifier of the item to delete
   * @returns Promise resolving to true if deletion was successful, false otherwise
   */
  public async delete(id: string): Promise<boolean> {
    await this.initialize();

    try {
      const filePath = this.getFilePath(id);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      // File not found or other error
      return false;
    }
  }

  /**
   * Searches for items matching the given criteria
   * @param criteria A function that returns true for items that match the search criteria
   * @returns Promise resolving to an array of matching items
   */
  public async find(criteria: (item: T) => boolean): Promise<T[]> {
    const allItems = await this.getAll();
    return allItems.filter(criteria);
  }

  /**
   * Clears all items from storage
   * @returns Promise resolving to true if operation was successful
   */
  public async clear(): Promise<boolean> {
    await this.initialize();

    try {
      const files = await fs.readdir(this.dataDir);
      const dataFiles = files.filter(file => file.endsWith(this.fileExtension));
      
      for (const file of dataFiles) {
        const filePath = path.join(this.dataDir, file);
        await fs.unlink(filePath);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Gets a metadata value by key
   * @param key The metadata key
   * @returns Promise resolving to the metadata value if found, null otherwise
   */
  public async getMetadata<V>(key: string): Promise<V | null> {
    await this.initialize();

    try {
      const filePath = this.getMetadataFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      return this.deserialize<V>(data);
    } catch (error) {
      // File not found or other error
      return null;
    }
  }

  /**
   * Sets a metadata value
   * @param key The metadata key
   * @param value The metadata value
   * @returns Promise resolving to true if operation was successful
   */
  public async setMetadata<V>(key: string, value: V): Promise<boolean> {
    await this.initialize();

    try {
      const filePath = this.getMetadataFilePath(key);
      const serialized = this.serialize(value);
      await fs.writeFile(filePath, serialized, 'utf-8');
      return true;
    } catch (error) {
      console.error('Failed to set metadata:', error);
      return false;
    }
  }

  /**
   * Deletes a metadata entry
   * @param key The metadata key to delete
   * @returns Promise resolving to true if deletion was successful, false otherwise
   */
  public async deleteMetadata(key: string): Promise<boolean> {
    await this.initialize();

    try {
      const filePath = this.getMetadataFilePath(key);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      // File not found or other error
      return false;
    }
  }
}