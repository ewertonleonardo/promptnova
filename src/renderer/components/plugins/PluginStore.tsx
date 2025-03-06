/**
 * Plugin Store Component for PromptNova
 * 
 * This component provides a user interface for managing plugins, including
 * browsing available plugins, installing new plugins, and managing installed plugins.
 */

import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  enabled: boolean;
}

export const PluginStore: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch plugins from the main process
      const installedPlugins = await ipcRenderer.invoke('plugins:list');
      setPlugins(installedPlugins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plugins');
    } finally {
      setLoading(false);
    }
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      await ipcRenderer.invoke('plugins:toggle', { pluginId, enabled });
      setPlugins(plugins.map(plugin =>
        plugin.id === pluginId ? { ...plugin, enabled } : plugin
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle plugin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        <p>{error}</p>
        <button
          onClick={loadPlugins}
          className="mt-2 px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Plugin Store</h2>
      
      {plugins.length === 0 ? (
        <p className="text-gray-500">No plugins installed</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plugins.map(plugin => (
            <div
              key={plugin.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{plugin.name}</h3>
                <span className="text-sm text-gray-500">v{plugin.version}</span>
              </div>
              
              <p className="text-gray-600 mb-4">{plugin.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  By {plugin.author.name}
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={plugin.enabled}
                    onChange={e => togglePlugin(plugin.id, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PluginStore;