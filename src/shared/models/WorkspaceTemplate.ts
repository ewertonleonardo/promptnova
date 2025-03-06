/**
 * Workspace template model for PromptNova
 * 
 * This file defines the structure and types for workspace templates
 * that can be used to create new workspaces with predefined structures.
 */

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  folderStructure: FolderStructure;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderStructure {
  [key: string]: FolderContent;
}

export interface FolderContent {
  type: 'file' | 'directory';
  name: string;
  content?: string;
  children?: FolderStructure;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  folderStructure: FolderStructure;
}

export interface UpdateTemplateRequest {
  id: string;
  template: Partial<WorkspaceTemplate>;
}