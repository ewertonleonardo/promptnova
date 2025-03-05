/**
 * Prompt-related IPC handlers for PromptNova
 * 
 * This file contains all IPC handlers related to prompt management,
 * including creating, updating, deleting, and retrieving prompts.
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS, Prompt, PromptCreateRequest, PromptUpdateRequest, IPCResponse } from '../../shared/ipc-types';
import { createErrorResponse, createSuccessResponse } from './index';

// In-memory storage for prompts (will be replaced with actual storage in Step 5)
let prompts: Prompt[] = [];

/**
 * Registers all prompt-related IPC handlers
 * 
 * This function should be called during application initialization
 * to set up all prompt-related communication channels.
 */
export function registerPromptHandlers(): void {
  // Create a new prompt
  ipcMain.handle(IPC_CHANNELS.PROMPT_CREATE, async (_, request: PromptCreateRequest): Promise<IPCResponse<Prompt>> => {
    try {
      // Validate the prompt data
      if (!request.prompt.title || !request.prompt.content) {
        return createErrorResponse('Prompt title and content are required');
      }
      
      // Create a new prompt with a unique ID
      const newPrompt: Prompt = {
        id: Date.now().toString(), // Simple ID generation (will be improved in Step 5)
        ...request.prompt
      };
      
      // Store the prompt (temporary in-memory storage)
      prompts.push(newPrompt);
      
      return createSuccessResponse(newPrompt);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Update an existing prompt
  ipcMain.handle(IPC_CHANNELS.PROMPT_UPDATE, async (_, request: PromptUpdateRequest): Promise<IPCResponse<Prompt>> => {
    try {
      // Find the prompt to update
      const promptIndex = prompts.findIndex(p => p.id === request.id);
      if (promptIndex === -1) {
        return createErrorResponse(`Prompt with ID ${request.id} not found`);
      }
      
      // Update the prompt
      const updatedPrompt = {
        ...prompts[promptIndex],
        ...request.prompt
      };
      
      // Save the updated prompt
      prompts[promptIndex] = updatedPrompt;
      
      return createSuccessResponse(updatedPrompt);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Delete a prompt
  ipcMain.handle(IPC_CHANNELS.PROMPT_DELETE, async (_, id: string): Promise<IPCResponse<boolean>> => {
    try {
      // Find the prompt to delete
      const promptIndex = prompts.findIndex(p => p.id === id);
      if (promptIndex === -1) {
        return createErrorResponse(`Prompt with ID ${id} not found`);
      }
      
      // Remove the prompt
      prompts.splice(promptIndex, 1);
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Get all prompts
  ipcMain.handle(IPC_CHANNELS.PROMPT_GET_ALL, async (): Promise<IPCResponse<Prompt[]>> => {
    try {
      return createSuccessResponse(prompts);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Get a prompt by ID
  ipcMain.handle(IPC_CHANNELS.PROMPT_GET_BY_ID, async (_, id: string): Promise<IPCResponse<Prompt>> => {
    try {
      // Find the prompt
      const prompt = prompts.find(p => p.id === id);
      if (!prompt) {
        return createErrorResponse(`Prompt with ID ${id} not found`);
      }
      
      return createSuccessResponse(prompt);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  console.log('Prompt IPC handlers registered successfully');
}