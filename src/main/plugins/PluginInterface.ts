/**
 * Plugin Interface definitions for PromptNova
 * 
 * This file defines the interfaces and types that plugins must implement
 * to be compatible with the PromptNova plugin system. It establishes the
 * contract between the application and third-party plugins.
 */

import { BrowserWindow } from 'electron';

/**
 * Metadata for a plugin
 */
export interface PluginMetadata {
  /** Unique identifier for the plugin */
  id: string;
  
  /** Display name of the plugin */
  name: string;
  
  /** Plugin version following semantic versioning */
  version: string;
  
  /** Brief description of the plugin's functionality */
  description: string;
  
  /** Plugin author information */
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  
  /** Minimum application version required for this plugin */
  minAppVersion?: string;
  
  /** URL to the plugin's homepage or repository */
  homepage?: string;
  
  /** Main entry point for the plugin */
  main: string;
  
  /** Optional icon path relative to the plugin directory */
  icon?: string;
}

/**
 * Plugin lifecycle states
 */
export enum PluginState {
  /** Plugin is registered but not loaded */
  REGISTERED = 'registered',
  
  /** Plugin is loaded and ready to use */
  LOADED = 'loaded',
  
  /** Plugin is active and running */
  ACTIVE = 'active',
  
  /** Plugin is disabled by user */
  DISABLED = 'disabled',
  
  /** Plugin failed to load or encountered an error */
  ERROR = 'error'
}

/**
 * Plugin context provided to plugins during initialization
 */
export interface PluginContext {
  /** Application version */
  appVersion: string;
  
  /** Path to the plugin's directory */
  pluginPath: string;
  
  /** Reference to the main browser window */
  mainWindow: BrowserWindow;
  
  /** Register IPC handlers for the plugin */
  registerIpcHandler: (channel: string, handler: Function) => void;
  
  /** Unregister IPC handlers for the plugin */
  unregisterIpcHandler: (channel: string) => void;
}

/**
 * Core interface that all plugins must implement
 */
export interface Plugin {
  /** Plugin metadata */
  metadata: PluginMetadata;
  
  /** Current state of the plugin */
  state: PluginState;
  
  /**
   * Initialize the plugin
   * @param context - The plugin context provided by the application
   * @returns A promise that resolves when initialization is complete
   */
  initialize(context: PluginContext): Promise<void>;
  
  /**
   * Activate the plugin
   * @returns A promise that resolves when activation is complete
   */
  activate(): Promise<void>;
  
  /**
   * Deactivate the plugin
   * @returns A promise that resolves when deactivation is complete
   */
  deactivate(): Promise<void>;
  
  /**
   * Clean up resources when the plugin is unloaded
   * @returns A promise that resolves when cleanup is complete
   */
  unload(): Promise<void>;
}

/**
 * Error thrown when a plugin operation fails
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public pluginId: string,
    public code?: string
  ) {
    super(message);
    this.name = 'PluginError';
  }
}

/**
 * Plugin event types for the event system
 */
export enum PluginEventType {
  REGISTERED = 'plugin:registered',
  LOADED = 'plugin:loaded',
  ACTIVATED = 'plugin:activated',
  DEACTIVATED = 'plugin:deactivated',
  UNLOADED = 'plugin:unloaded',
  ERROR = 'plugin:error'
}

/**
 * Plugin event data structure
 */
export interface PluginEvent {
  type: PluginEventType;
  pluginId: string;
  timestamp: number;
  data?: any;
}

/**
 * Plugin settings interface for storing plugin configuration
 */
export interface PluginSettings {
  /** Whether the plugin is enabled */
  enabled: boolean;
  
  /** Custom settings specific to the plugin */
  [key: string]: any;
}