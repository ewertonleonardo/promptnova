/**
 * @file StorageAdapter.ts
 * @description Defines the storage adapter interface for the PromptNova application.
 * This module provides the contract that all storage implementations must follow,
 * ensuring consistent data access patterns regardless of the underlying storage mechanism.
 */

/**
 * Generic interface for storage operations
 * @template T The type of data to be stored
 */
export interface StorageAdapter<T> {
  /**
   * Retrieves all items from storage
   * @returns Promise resolving to an array of items
   */
  getAll(): Promise<T[]>;

  /**
   * Retrieves a single item by its ID
   * @param id The unique identifier of the item
   * @returns Promise resolving to the item if found, null otherwise
   */
  getById(id: string): Promise<T | null>;

  /**
   * Creates a new item in storage
   * @param item The item to create
   * @returns Promise resolving to the created item with its assigned ID
   */
  create(item: T): Promise<T>;

  /**
   * Updates an existing item in storage
   * @param id The unique identifier of the item to update
   * @param item The updated item data
   * @returns Promise resolving to the updated item if successful, null if item not found
   */
  update(id: string, item: Partial<T>): Promise<T | null>;

  /**
   * Deletes an item from storage
   * @param id The unique identifier of the item to delete
   * @returns Promise resolving to true if deletion was successful, false otherwise
   */
  delete(id: string): Promise<boolean>;

  /**
   * Searches for items matching the given criteria
   * @param criteria A function that returns true for items that match the search criteria
   * @returns Promise resolving to an array of matching items
   */
  find(criteria: (item: T) => boolean): Promise<T[]>;

  /**
   * Clears all items from storage
   * @returns Promise resolving to true if operation was successful
   */
  clear(): Promise<boolean>;
}

/**
 * Interface for storage adapters that support metadata
 */
export interface MetadataStorageAdapter {
  /**
   * Gets a metadata value by key
   * @param key The metadata key
   * @returns Promise resolving to the metadata value if found, null otherwise
   */
  getMetadata<V>(key: string): Promise<V | null>;

  /**
   * Sets a metadata value
   * @param key The metadata key
   * @param value The metadata value
   * @returns Promise resolving to true if operation was successful
   */
  setMetadata<V>(key: string, value: V): Promise<boolean>;

  /**
   * Deletes a metadata entry
   * @param key The metadata key to delete
   * @returns Promise resolving to true if deletion was successful, false otherwise
   */
  deleteMetadata(key: string): Promise<boolean>;
}