/**
 * IPC message type definitions for communication between main and renderer processes
 */

// Prompt-related types
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  placeholders?: string[];
}

export interface PromptCreateRequest {
  prompt: Omit<Prompt, 'id'>;
}

export interface PromptUpdateRequest {
  id: string;
  prompt: Partial<Prompt>;
}

// Workspace-related types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  prompts: Prompt[];
}

export interface WorkspaceCreateRequest {
  workspace: Omit<Workspace, 'id' | 'prompts'>;
}

export interface WorkspaceUpdateRequest {
  id: string;
  workspace: Partial<Omit<Workspace, 'prompts'>>;
}

// IPC channel definitions
export const IPC_CHANNELS = {
  // Prompt channels
  PROMPT_CREATE: 'prompt:create',
  PROMPT_UPDATE: 'prompt:update',
  PROMPT_DELETE: 'prompt:delete',
  PROMPT_GET_ALL: 'prompt:get-all',
  PROMPT_GET_BY_ID: 'prompt:get-by-id',
  
  // Workspace channels
  WORKSPACE_CREATE: 'workspace:create',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_GET_ALL: 'workspace:get-all',
  WORKSPACE_GET_BY_ID: 'workspace:get-by-id',
  WORKSPACE_SET_ACTIVE: 'workspace:set-active',
  WORKSPACE_GET_ACTIVE: 'workspace:get-active',
  
  // Workspace template channels
  WORKSPACE_LOAD_TEMPLATES: 'workspace:loadTemplates',
  WORKSPACE_CREATE_TEMPLATE: 'workspace:createTemplate',
  WORKSPACE_UPDATE_TEMPLATE: 'workspace:updateTemplate',
  WORKSPACE_DELETE_TEMPLATE: 'workspace:deleteTemplate',
} as const;

// Response types
export type IPCResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};