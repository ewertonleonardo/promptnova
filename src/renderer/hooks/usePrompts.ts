/**
 * @file usePrompts.ts
 * @description Custom hook for managing prompts in the PromptNova application.
 * This hook provides CRUD operations for prompts and integrates with the IPC
 * communication layer to interact with the main process.
 */

import { useState, useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { Prompt, PromptCreateRequest, PromptUpdateRequest, IPC_CHANNELS } from '../../shared/ipc-types';

interface UsePromptsReturn {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  createPrompt: (prompt: Omit<Prompt, 'id'>) => Promise<Prompt>;
  updatePrompt: (id: string, prompt: Partial<Prompt>) => Promise<Prompt>;
  deletePrompt: (id: string) => Promise<void>;
  getPromptById: (id: string) => Promise<Prompt>;
  refreshPrompts: () => Promise<void>;
}

/**
 * Custom hook for managing prompts
 * @returns Object containing prompt data and CRUD operations
 */
export function usePrompts(): UsePromptsReturn {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all prompts from the main process
   */
  const refreshPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPrompts = await ipcRenderer.invoke(IPC_CHANNELS.PROMPT_GET_ALL);
      setPrompts(fetchedPrompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Creates a new prompt
   * @param prompt Prompt data without ID
   * @returns Created prompt with ID
   */
  const createPrompt = useCallback(async (prompt: Omit<Prompt, 'id'>): Promise<Prompt> => {
    try {
      setError(null);
      const request: PromptCreateRequest = { prompt };
      const createdPrompt = await ipcRenderer.invoke(IPC_CHANNELS.PROMPT_CREATE, request);
      await refreshPrompts();
      return createdPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshPrompts]);

  /**
   * Updates an existing prompt
   * @param id Prompt ID
   * @param prompt Partial prompt data to update
   * @returns Updated prompt
   */
  const updatePrompt = useCallback(async (id: string, prompt: Partial<Prompt>): Promise<Prompt> => {
    try {
      setError(null);
      const request: PromptUpdateRequest = { id, prompt };
      const updatedPrompt = await ipcRenderer.invoke(IPC_CHANNELS.PROMPT_UPDATE, request);
      await refreshPrompts();
      return updatedPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshPrompts]);

  /**
   * Deletes a prompt
   * @param id Prompt ID
   */
  const deletePrompt = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await ipcRenderer.invoke(IPC_CHANNELS.PROMPT_DELETE, id);
      await refreshPrompts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshPrompts]);

  /**
   * Retrieves a prompt by ID
   * @param id Prompt ID
   * @returns Prompt data
   */
  const getPromptById = useCallback(async (id: string): Promise<Prompt> => {
    try {
      setError(null);
      return await ipcRenderer.invoke(IPC_CHANNELS.PROMPT_GET_BY_ID, id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Load prompts on mount
  useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    getPromptById,
    refreshPrompts,
  };
}