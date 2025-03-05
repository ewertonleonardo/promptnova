/**
 * @file Workspace.ts
 * @description Defines the data model and types for workspaces in the PromptNova application.
 * This module provides the core data structures for managing workspaces, including their
 * properties, prompt collections, and validation rules.
 */

import { Workspace as IWorkspace, Prompt as IPrompt } from '../ipc-types';
import { Prompt } from './Prompt';

/**
 * Represents the validation rules for a workspace
 */
export interface WorkspaceValidationRules {
  /** Maximum length of the workspace name */
  maxNameLength: number;
  /** Maximum length of the workspace description */
  maxDescriptionLength: number;
  /** Maximum number of prompts allowed in a workspace */
  maxPrompts: number;
}

/**
 * Default validation rules for workspaces
 */
export const DEFAULT_WORKSPACE_VALIDATION: WorkspaceValidationRules = {
  maxNameLength: 50,
  maxDescriptionLength: 500,
  maxPrompts: 1000,
};

/**
 * Represents a validation error for a workspace
 */
export interface WorkspaceValidationError {
  field: keyof IWorkspace;
  message: string;
}

/**
 * Class representing a Workspace in the application
 * Implements the IWorkspace interface and adds additional functionality
 */
export class Workspace implements IWorkspace {
  public id: string;
  public name: string;
  public description?: string;
  public prompts: Prompt[];
  private validationRules: WorkspaceValidationRules;

  /**
   * Creates a new Workspace instance
   * @param data Initial workspace data
   * @param validationRules Custom validation rules (optional)
   */
  constructor(
    data: Omit<IWorkspace, 'id' | 'prompts'>,
    prompts: Prompt[] = [],
    validationRules: WorkspaceValidationRules = DEFAULT_WORKSPACE_VALIDATION
  ) {
    this.id = crypto.randomUUID();
    this.name = data.name;
    this.description = data.description;
    this.prompts = prompts;
    this.validationRules = validationRules;
  }

  /**
   * Validates the workspace data against the validation rules
   * @returns Array of validation errors, empty if valid
   */
  public validate(): WorkspaceValidationError[] {
    const errors: WorkspaceValidationError[] = [];

    // Validate name
    if (!this.name) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (this.name.length > this.validationRules.maxNameLength) {
      errors.push({
        field: 'name',
        message: `Name must be less than ${this.validationRules.maxNameLength} characters`,
      });
    }

    // Validate description
    if (this.description && this.description.length > this.validationRules.maxDescriptionLength) {
      errors.push({
        field: 'description',
        message: `Description must be less than ${this.validationRules.maxDescriptionLength} characters`,
      });
    }

    // Validate prompts count
    if (this.prompts.length > this.validationRules.maxPrompts) {
      errors.push({
        field: 'prompts',
        message: `Maximum ${this.validationRules.maxPrompts} prompts allowed`,
      });
    }

    return errors;
  }

  /**
   * Updates the workspace with new data
   * @param data Partial workspace data to update
   */
  public update(data: Partial<Omit<IWorkspace, 'id' | 'prompts'>>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
  }

  /**
   * Adds a prompt to the workspace
   * @param prompt The prompt to add
   * @returns True if the prompt was added, false if it already exists
   */
  public addPrompt(prompt: Prompt): boolean {
    // Check if prompt already exists in workspace
    if (this.prompts.some((p) => p.id === prompt.id)) {
      return false;
    }

    this.prompts.push(prompt);
    return true;
  }

  /**
   * Removes a prompt from the workspace
   * @param promptId The ID of the prompt to remove
   * @returns True if the prompt was removed, false if it wasn't found
   */
  public removePrompt(promptId: string): boolean {
    const initialLength = this.prompts.length;
    this.prompts = this.prompts.filter((p) => p.id !== promptId);
    return this.prompts.length < initialLength;
  }

  /**
   * Gets a prompt by ID
   * @param promptId The ID of the prompt to get
   * @returns The prompt if found, undefined otherwise
   */
  public getPrompt(promptId: string): Prompt | undefined {
    return this.prompts.find((p) => p.id === promptId);
  }

  /**
   * Updates a prompt in the workspace
   * @param promptId The ID of the prompt to update
   * @param data The data to update the prompt with
   * @returns True if the prompt was updated, false if it wasn't found
   */
  public updatePrompt(promptId: string, data: Partial<Omit<IPrompt, 'id'>>): boolean {
    const prompt = this.getPrompt(promptId);
    if (!prompt) return false;
    
    prompt.update(data);
    return true;
  }

  /**
   * Converts the workspace instance to a plain object
   * @returns Plain object representation of the workspace
   */
  public toJSON(): IWorkspace {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      prompts: this.prompts.map(p => p.toJSON()),
    };
  }
}