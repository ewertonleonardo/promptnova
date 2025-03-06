/**
 * Template-related IPC handlers for PromptNova
 * 
 * This file contains all IPC handlers related to workspace template management,
 * including creating, updating, deleting, and retrieving templates.
 */

import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { IPC_CHANNELS, IPCResponse } from '../../shared/ipc-types';
import { WorkspaceTemplate, CreateTemplateRequest, UpdateTemplateRequest, FolderStructure } from '../../shared/models/WorkspaceTemplate';
import { createErrorResponse, createSuccessResponse } from './index';

// In-memory storage for templates (will be replaced with actual storage in future steps)
let templates: WorkspaceTemplate[] = [];

// Default templates
const defaultTemplates: WorkspaceTemplate[] = [
  {
    id: 'default-empty',
    name: 'Empty Workspace',
    description: 'A clean workspace with no predefined structure',
    folderStructure: {},
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'default-basic',
    name: 'Basic Prompt Workspace',
    description: 'A basic workspace with folders for prompts, responses, and resources',
    folderStructure: {
      'prompts': {
        type: 'directory',
        name: 'prompts',
        children: {}
      },
      'responses': {
        type: 'directory',
        name: 'responses',
        children: {}
      },
      'resources': {
        type: 'directory',
        name: 'resources',
        children: {}
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Registers all template-related IPC handlers
 * 
 * This function should be called during application initialization
 * to set up all template-related communication channels.
 */
export function registerTemplateHandlers(): void {
  // Initialize templates with defaults
  templates = [...defaultTemplates];
  
  // Load all templates
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_LOAD_TEMPLATES, async (): Promise<IPCResponse<WorkspaceTemplate[]>> => {
    try {
      return createSuccessResponse(templates);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Create a new template
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_CREATE_TEMPLATE, async (_, request: CreateTemplateRequest): Promise<IPCResponse<WorkspaceTemplate>> => {
    try {
      // Validate the template data
      if (!request.name) {
        return createErrorResponse('Template name is required');
      }
      
      // Create a new template with a unique ID
      const newTemplate: WorkspaceTemplate = {
        id: `template-${Date.now()}`,
        name: request.name,
        description: request.description,
        folderStructure: request.folderStructure,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store the template
      templates.push(newTemplate);
      
      return createSuccessResponse(newTemplate);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Update an existing template
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_UPDATE_TEMPLATE, async (_, request: UpdateTemplateRequest): Promise<IPCResponse<WorkspaceTemplate>> => {
    try {
      // Find the template to update
      const templateIndex = templates.findIndex(t => t.id === request.id);
      if (templateIndex === -1) {
        return createErrorResponse(`Template with ID ${request.id} not found`);
      }
      
      // Don't allow updating default templates
      if (templates[templateIndex].id.startsWith('default-')) {
        return createErrorResponse('Default templates cannot be modified');
      }
      
      // Update the template
      const updatedTemplate = {
        ...templates[templateIndex],
        ...request.template,
        updatedAt: new Date()
      };
      
      // Save the updated template
      templates[templateIndex] = updatedTemplate;
      
      return createSuccessResponse(updatedTemplate);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
  
  // Delete a template
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_DELETE_TEMPLATE, async (_, id: string): Promise<IPCResponse<boolean>> => {
    try {
      // Find the template to delete
      const templateIndex = templates.findIndex(t => t.id === id);
      if (templateIndex === -1) {
        return createErrorResponse(`Template with ID ${id} not found`);
      }
      
      // Don't allow deleting default templates
      if (templates[templateIndex].id.startsWith('default-')) {
        return createErrorResponse('Default templates cannot be deleted');
      }
      
      // Remove the template
      templates.splice(templateIndex, 1);
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(error);
    }
  });
}