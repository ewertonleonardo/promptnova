/**
 * Plugin Manager for PromptNova
 * 
 * This file implements the core plugin management system responsible for
 * discovering, loading, activating, and managing plugins throughout their lifecycle.
 * It serves as the central hub for all plugin-related operations in the application.
 */

import { app, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import {
  Plugin,
  PluginMetadata,
  PluginState,
  PluginContext,
  PluginError,
  PluginEventType,
  PluginEvent,
  PluginSettings
} from './PluginInterface';

/**
 * Class responsible for managing the lifecycle of plugins
 */
export class PluginManager extends EventEmitter {
  /** Map of plugin IDs to plugin instances */
  private plugins: Map<string, Plugin> = new Map();
  
  /** Map of plugin IDs to plugin settings */
  private pluginSettings: Map<string, PluginSettings> = new Map();
  
  /** Directory where plugins are stored */
  private pluginsDir: string;
  
  /** Reference to the main application window */
  private mainWindow: BrowserWindow | null = null;
  
  /** Singleton instance */
  private static instance: PluginManager;
  
  /**
   * Creates a new PluginManager instance
   * @param pluginsDir - Directory where plugins are stored
   */
  private constructor(pluginsDir: string) {
    super();
    this.pluginsDir = pluginsDir;
    
    // Create plugins directory if it doesn't exist
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }
  
  /**
   * Gets the singleton instance of the PluginManager
   * @param pluginsDir - Directory where plugins are stored (only used on first call)
   * @returns The PluginManager instance
   */
  public static getInstance(pluginsDir?: string): PluginManager {
    if (!PluginManager.instance) {
      if (!pluginsDir) {
        // Default plugins directory is in the user data directory
        pluginsDir = path.join(app.getPath('userData'), 'plugins');
      }
      PluginManager.instance = new PluginManager(pluginsDir);
    }
    return PluginManager.instance;
  }
  
  /**
   * Sets the main window reference for plugin context
   * @param window - The main BrowserWindow instance
   */
  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }
  
  /**
   * Discovers and registers all plugins in the plugins directory
   * @returns A promise that resolves when all plugins are discovered
   */
  public async discoverPlugins(): Promise<void> {
    try {
      // Ensure plugins directory exists
      if (!fs.existsSync(this.pluginsDir)) {
        fs.mkdirSync(this.pluginsDir, { recursive: true });
        return; // No plugins to discover yet
      }
      
      // Read all directories in the plugins directory
      const entries = fs.readdirSync(this.pluginsDir, { withFileTypes: true });
      const pluginDirs = entries.filter(entry => entry.isDirectory());
      
      // Process each plugin directory
      for (const dir of pluginDirs) {
        const pluginDir = path.join(this.pluginsDir, dir.name);
        await this.registerPlugin(pluginDir);
      }
      
      console.log(`Discovered ${this.plugins.size} plugins`);
    } catch (error) {
      console.error('Error discovering plugins:', error);
      throw new Error(`Failed to discover plugins: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Registers a plugin from the given directory
   * @param pluginDir - Directory containing the plugin
   * @returns A promise that resolves when the plugin is registered
   */
  public async registerPlugin(pluginDir: string): Promise<void> {
    try {
      // Check if plugin.json exists
      const metadataPath = path.join(pluginDir, 'plugin.json');
      if (!fs.existsSync(metadataPath)) {
        throw new Error(`Plugin metadata file not found: ${metadataPath}`);
      }
      
      // Read and parse plugin metadata
      const metadataContent = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent) as PluginMetadata;
      
      // Validate metadata
      this.validateMetadata(metadata);
      
      // Check if plugin is already registered
      if (this.plugins.has(metadata.id)) {
        throw new Error(`Plugin with ID ${metadata.id} is already registered`);
      }
      
      // Load plugin module
      const mainPath = path.join(pluginDir, metadata.main);
      if (!fs.existsSync(mainPath)) {
        throw new Error(`Plugin main file not found: ${mainPath}`);
      }
      
      // Create plugin instance
      // Note: In a real implementation, this would use a more secure way to load plugins
      // such as a sandbox or separate process
      const pluginModule = require(mainPath);
      if (!pluginModule.default) {
        throw new Error(`Plugin ${metadata.id} does not export a default class`);
      }
      
      const plugin: Plugin = new pluginModule.default();
      plugin.metadata = metadata;
      plugin.state = PluginState.REGISTERED;
      
      // Store plugin
      this.plugins.set(metadata.id, plugin);
      
      // Load or create settings
      await this.loadPluginSettings(metadata.id);
      
      // Emit event
      this.emitPluginEvent({
        type: PluginEventType.REGISTERED,
        pluginId: metadata.id,
        timestamp: Date.now()
      });
      
      console.log(`Registered plugin: ${metadata.name} (${metadata.id})`);
    } catch (error) {
      console.error(`Error registering plugin from ${pluginDir}:`, error);
      throw new PluginError(
        `Failed to register plugin: ${error instanceof Error ? error.message : String(error)}`,
        path.basename(pluginDir),
        'REGISTRATION_FAILED'
      );
    }
  }
  
  /**
   * Loads a registered plugin
   * @param pluginId - ID of the plugin to load
   * @returns A promise that resolves when the plugin is loaded
   */
  public async loadPlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.getPlugin(pluginId);
      
      // Skip if already loaded or active
      if (plugin.state === PluginState.LOADED || plugin.state === PluginState.ACTIVE) {
        return;
      }
      
      // Skip if disabled
      const settings = this.pluginSettings.get(pluginId);
      if (settings && !settings.enabled) {
        console.log(`Plugin ${pluginId} is disabled, skipping load`);
        return;
      }
      
      // Create plugin context
      const context: PluginContext = {
        appVersion: app.getVersion(),
        pluginPath: path.join(this.pluginsDir, pluginId),
        mainWindow: this.mainWindow!,
        registerIpcHandler: (channel, handler) => {
          // Prefix channel with plugin ID to avoid conflicts
          const prefixedChannel = `plugin:${pluginId}:${channel}`;
          // Implementation would go here
        },
        unregisterIpcHandler: (channel) => {
          const prefixedChannel = `plugin:${pluginId}:${channel}`;
          // Implementation would go here
        }
      };
      
      // Initialize plugin
      await plugin.initialize(context);
      plugin.state = PluginState.LOADED;
      
      // Emit event
      this.emitPluginEvent({
        type: PluginEventType.LOADED,
        pluginId,
        timestamp: Date.now()
      });
      
      console.log(`Loaded plugin: ${plugin.metadata.name} (${pluginId})`);
    } catch (error) {
      console.error(`Error loading plugin ${pluginId}:`, error);
      
      // Update plugin state
      const plugin = this.plugins.get(pluginId);
      if (plugin) {
        plugin.state = PluginState.ERROR;
      }
      
      // Emit error event
      this.emitPluginEvent({
        type: PluginEventType.ERROR,
        pluginId,
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      
      throw new PluginError(
        `Failed to load plugin: ${error instanceof Error ? error.message : String(error)}`,
        pluginId,
        'LOAD_FAILED'
      );
    }
  }
  
  /**
   * Activates a loaded plugin
   * @param pluginId - ID of the plugin to activate
   * @returns A promise that resolves when the plugin is activated
   */
  public async activatePlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.getPlugin(pluginId);
      
      // Skip if already active
      if (plugin.state === PluginState.ACTIVE) {
        return;
      }
      
      // Ensure plugin is loaded
      if (plugin.state !== PluginState.LOADED) {
        await this.loadPlugin(pluginId);
      }
      
      // Activate plugin
      await plugin.activate();
      plugin.state = PluginState.ACTIVE;
      
      // Emit event
      this.emitPluginEvent({
        type: PluginEventType.ACTIVATED,
        pluginId,
        timestamp: Date.now()
      });
      
      console.log(`Activated plugin: ${plugin.metadata.name} (${pluginId})`);
    } catch (error) {
      console.error(`Error activating plugin ${pluginId}:`, error);
      
      // Update plugin state
      const plugin = this.plugins.get(pluginId);
      if (plugin) {
        plugin.state = PluginState.ERROR;
      }
      
      // Emit error event
      this.emitPluginEvent({
        type: PluginEventType.ERROR,
        pluginId,
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      
      throw new PluginError(
        `Failed to activate plugin: ${error instanceof Error ? error.message : String(error)}`,
        pluginId,
        'ACTIVATION_FAILED'
      );
    }
  }
  
  /**
   * Deactivates an active plugin
   * @param pluginId - ID of the plugin to deactivate
   * @returns A promise that resolves when the plugin is deactivated
   */
  public async deactivatePlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.getPlugin(pluginId);
      
      // Skip if not active
      if (plugin.state !== PluginState.ACTIVE) {
        return;
      }
      
      // Deactivate plugin
      await plugin.deactivate();
      plugin.state = PluginState.LOADED;
      
      // Emit event
      this.emitPluginEvent({
        type: PluginEventType.DEACTIVATED,
        pluginId,
        timestamp: Date.now()
      });
      
      console.log(`Deactivated plugin: ${plugin.metadata.name} (${pluginId})`);
    } catch (error) {
      console.error(`Error deactivating plugin ${pluginId}:`, error);
      
      // Emit error event
      this.emitPluginEvent({
        type: PluginEventType.ERROR,
        pluginId,
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      
      throw new PluginError(
        `Failed to deactivate plugin: ${error instanceof Error ? error.message : String(error)}`,
        pluginId,
        'DEACTIVATION_FAILED'
      );
    }
  }
  
  /**
   * Unloads a plugin, cleaning up its resources
   * @param pluginId - ID of the plugin to unload
   * @returns A promise that resolves when the plugin is unloaded
   */
  public async unloadPlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.getPlugin(pluginId);
      
      // Deactivate if active
      if (plugin.state === PluginState.ACTIVE) {
        await this.deactivatePlugin(pluginId);
      }
      
      // Skip if not loaded
      if (plugin.state !== PluginState.LOADED && plugin.state !== PluginState.ERROR) {
        return;
      }
      
      // Unload plugin
      await plugin.unload();
      plugin.state = PluginState.REGISTERED;
      
      // Emit event
      this.emitPluginEvent({
        type: PluginEventType.UNLOADED,
        pluginId,
        timestamp: Date.now()
      });
      
      console.log(`Unloaded plugin: ${plugin.metadata.name} (${pluginId})`);
    } catch (error) {
      console.error(`Error unloading plugin ${pluginId}:`, error);
      
      // Emit error event
      this.emitPluginEvent({
        type: PluginEventType.ERROR,
        pluginId,
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      
      throw new PluginError(
        `Failed to unload plugin: ${error instanceof Error ? error.message : String(error)}`,
        pluginId,
        'UNLOAD_FAILED'
      );
    }
  }
  
  /**
   * Enables a plugin and updates its settings
   * @param pluginId - ID of the plugin to enable
   * @returns A promise that resolves when the plugin is enabled
   */
  public async enablePlugin(pluginId: string): Promise<void> {
    const settings = this.getPluginSettings(pluginId);
    settings.enabled = true;
    await this.savePluginSettings(pluginId, settings);
    
    // Load and activate the plugin if it's registered
    const plugin = this.plugins.get(pluginId);
    if (plugin && plugin.state === PluginState.REGISTERED) {
      await this.loadPlugin(pluginId);
    }
    
    console.log(`Enabled plugin: ${pluginId}`);
  }
  
  /**
   * Disables a plugin and updates its settings
   * @param pluginId - ID of the plugin to disable
   * @returns A promise that resolves when the plugin is disabled
   */
  public async disablePlugin(pluginId: string): Promise<void> {
    const settings = this.getPluginSettings(pluginId);
    settings.enabled = false;
    await this.savePluginSettings(pluginId, settings);
    
    // Unload the plugin if it's loaded or active
    const plugin = this.plugins.get(pluginId);
    if (plugin && (plugin.state === PluginState.LOADED || plugin.state === PluginState.ACTIVE)) {
      await this.unloadPlugin(pluginId);
    }
    
    console.log(`Disabled plugin: ${pluginId}`);
  }
  
  /**
   * Gets a plugin by ID
   * @param pluginId - ID of the plugin to get
   * @returns The plugin instance
   * @throws PluginError if the plugin is not found
   */
  private getPlugin(pluginId: string): Plugin {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginError(`Plugin not found: ${pluginId}`, pluginId, 'PLUGIN_NOT_FOUND');
    }
    return plugin;
  }
  
  /**
   * Gets plugin settings by ID
   * @param pluginId - ID of the plugin to get settings for
   * @returns The plugin settings
   */
  private getPluginSettings(pluginId: string): PluginSettings {
    let settings = this.pluginSettings.get(pluginId);
    if (!settings) {
      // Create default settings if none exist
      settings = { enabled: true };
      this.pluginSettings.set(pluginId, settings);
    }
    return settings;
  }
  
  /**
   * Loads plugin settings from storage
   * @param pluginId - ID of the plugin to load settings for
   * @returns A promise that resolves when settings are loaded
   */
  private async loadPluginSettings(pluginId: string): Promise<void> {
    try {
      // In a real implementation, this would load settings from a file or database
      // For now, we'll just create default settings
      if (!this.pluginSettings.has(pluginId)) {
        this.pluginSettings.set(pluginId, { enabled: true });
      }
    } catch (error) {
      console.error(`Error loading settings for plugin ${pluginId}:`, error);
      // Create default settings on error
      this.pluginSettings.set(pluginId, { enabled: true });
    }
  }
  
  /**
   * Saves plugin settings to storage
   * @param pluginId - ID of the plugin to save settings for
   * @param settings - Settings to save
   * @returns A promise that resolves when settings are saved
   */
  private async savePluginSettings(pluginId: string, settings: PluginSettings): Promise<void> {
    try {
      // In a real implementation, this would save settings to a file or database
      this.pluginSettings.set(pluginId, settings);
    } catch (error) {
      console.error(`Error saving settings for plugin ${pluginId}:`, error);
      throw new Error(`Failed to save plugin settings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Emits a plugin event
   * @param event - The event to emit
   */
  private emitPluginEvent(event: PluginEvent): void {
    this.emit(event.type, event);
    this.emit('plugin:event', event);
  }
  
  /**
   * Validates plugin metadata
   * @param metadata - The metadata to validate
   * @throws Error if metadata is invalid
   */
  private validateMetadata(metadata: PluginMetadata): void {
    // Check required fields
    if (!metadata.id) throw new Error('Plugin ID is required');
    if (!metadata.name) throw new Error('Plugin name is required');
    if (!metadata.version) throw new Error('Plugin version is required');
    if (!metadata.description) throw new Error('Plugin description is required');
    if (!metadata.author || !metadata.author.name) throw new Error('Plugin author name is required');
    if (!metadata.main) throw new Error('Plugin main entry point is required');
    
    // Validate ID format (alphanumeric with dashes and dots)
    if (!/^[a-z0-9.-]+$/.test(metadata.id)) {
      throw new Error('Plugin ID must contain only lowercase letters, numbers, dots, and dashes');
    }
    
    // Validate version format (semver)
    const semverRegex = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;
    if (!semverRegex.test(metadata.version)) {
      throw new Error('Plugin version must follow semantic versioning (e.g., 1.0.0)');
    }
  }
  
  /**
   * Gets all registered plugins
   * @returns Array of all plugins
   */
  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Gets all enabled plugins
   * @returns Array of enabled plugins
   */
  public getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter(plugin => {
      const settings = this.pluginSettings.get(plugin.metadata.id);
      return settings && settings.enabled;
    });
  }