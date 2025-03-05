/**
 * @file Prompt.ts
 * @description Defines the data model and types for prompts in the PromptNova application.
 * This module provides the core data structures for managing prompts, including their
 * content, metadata, and validation rules.
 */

import { Prompt as IPrompt } from '../ipc-types';

/**
 * Represents the validation rules for a prompt
 */
export interface PromptValidationRules {
  /** Maximum length of the prompt title */
  maxTitleLength: number;
  /** Maximum length of the prompt content */
  maxContentLength: number;
  /** Maximum number of tags allowed */
  maxTags: number;
  /** Maximum length of each tag */
  maxTagLength: number;
}

/**
 * Default validation rules for prompts
 */
export const DEFAULT_PROMPT_VALIDATION: PromptValidationRules = {
  maxTitleLength: 100,
  maxContentLength: 10000,
  maxTags: 10,
  maxTagLength: 30,
};

/**
 * Represents a validation error for a prompt
 */
export interface PromptValidationError {
  field: keyof IPrompt;
  message: string;
}

/**
 * Class representing a Prompt in the application
 * Implements the IPrompt interface and adds additional functionality
 */
export class Prompt implements IPrompt {
  public id: string;
  public title: string;
  public content: string;
  public category?: string;
  public tags?: string[];
  public placeholders?: string[];
  private validationRules: PromptValidationRules;

  /**
   * Creates a new Prompt instance
   * @param data Initial prompt data
   * @param validationRules Custom validation rules (optional)
   */
  constructor(
    data: Omit<IPrompt, 'id'>,
    validationRules: PromptValidationRules = DEFAULT_PROMPT_VALIDATION
  ) {
    this.id = crypto.randomUUID();
    this.title = data.title;
    this.content = data.content;
    this.category = data.category;
    this.tags = data.tags;
    this.placeholders = data.placeholders;
    this.validationRules = validationRules;
  }

  /**
   * Validates the prompt data against the validation rules
   * @returns Array of validation errors, empty if valid
   */
  public validate(): PromptValidationError[] {
    const errors: PromptValidationError[] = [];

    // Validate title
    if (!this.title) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (this.title.length > this.validationRules.maxTitleLength) {
      errors.push({
        field: 'title',
        message: `Title must be less than ${this.validationRules.maxTitleLength} characters`,
      });
    }

    // Validate content
    if (!this.content) {
      errors.push({ field: 'content', message: 'Content is required' });
    } else if (this.content.length > this.validationRules.maxContentLength) {
      errors.push({
        field: 'content',
        message: `Content must be less than ${this.validationRules.maxContentLength} characters`,
      });
    }

    // Validate tags
    if (this.tags) {
      if (this.tags.length > this.validationRules.maxTags) {
        errors.push({
          field: 'tags',
          message: `Maximum ${this.validationRules.maxTags} tags allowed`,
        });
      }

      this.tags.forEach((tag) => {
        if (tag.length > this.validationRules.maxTagLength) {
          errors.push({
            field: 'tags',
            message: `Tag must be less than ${this.validationRules.maxTagLength} characters`,
          });
        }
      });
    }

    return errors;
  }

  /**
   * Updates the prompt with new data
   * @param data Partial prompt data to update
   */
  public update(data: Partial<Omit<IPrompt, 'id'>>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.content !== undefined) this.content = data.content;
    if (data.category !== undefined) this.category = data.category;
    if (data.tags !== undefined) this.tags = data.tags;
    if (data.placeholders !== undefined) this.placeholders = data.placeholders;
  }

  /**
   * Extracts placeholders from the prompt content
   * @returns Array of placeholder strings
   */
  public extractPlaceholders(): string[] {
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const matches = this.content.matchAll(placeholderRegex);
    const placeholders = new Set<string>();

    for (const match of matches) {
      placeholders.add(match[1].trim());
    }

    this.placeholders = Array.from(placeholders);
    return this.placeholders;
  }

  /**
   * Converts the prompt instance to a plain object
   * @returns Plain object representation of the prompt
   */
  public toJSON(): IPrompt {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      category: this.category,
      tags: this.tags,
      placeholders: this.placeholders,
    };
  }
}