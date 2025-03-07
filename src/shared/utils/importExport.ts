/**
 * @file importExport.ts
 * @description Provides utilities for importing and exporting prompts in the PromptNova application.
 * This module handles the serialization and deserialization of prompt data, with validation
 * and error handling to ensure data integrity during import/export operations.
 */

import { Prompt, Workspace } from '../ipc-types';
import { Prompt as PromptModel, PromptValidationError, DEFAULT_PROMPT_VALIDATION } from '../models/Prompt';

/**
 * Represents the format of exported prompt data
 */
export interface ExportData {
  version: string;
  prompts: Prompt[];
  workspace?: Workspace;
  exportDate: string;
}

/**
 * Error types that can occur during import/export operations
 */
export enum ImportExportErrorType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  VERSION_MISMATCH = 'VERSION_MISMATCH'
}

/**
 * Custom error class for import/export operations
 */
export class ImportExportError extends Error {
  constructor(
    public type: ImportExportErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ImportExportError';
  }
}

/**
 * Current version of the export format
 */
export const CURRENT_EXPORT_VERSION = '1.0.0';

/**
 * Validates imported prompt data against the schema and business rules
 * @param prompt The prompt data to validate
 * @returns Array of validation errors, empty if valid
 */
export function validatePrompt(prompt: Prompt): PromptValidationError[] {
  const errors: PromptValidationError[] = [];
  const rules = DEFAULT_PROMPT_VALIDATION;

  if (!prompt.title || prompt.title.length > rules.maxTitleLength) {
    errors.push({
      field: 'title',
      message: `Title must be between 1 and ${rules.maxTitleLength} characters`
    });
  }

  if (!prompt.content || prompt.content.length > rules.maxContentLength) {
    errors.push({
      field: 'content',
      message: `Content must be between 1 and ${rules.maxContentLength} characters`
    });
  }

  if (prompt.tags && prompt.tags.length > rules.maxTags) {
    errors.push({
      field: 'tags',
      message: `Maximum ${rules.maxTags} tags allowed`
    });
  }

  if (prompt.tags) {
    prompt.tags.forEach(tag => {
      if (tag.length > rules.maxTagLength) {
        errors.push({
          field: 'tags',
          message: `Tag length must not exceed ${rules.maxTagLength} characters`
        });
      }
    });
  }

  return errors;
}

/**
 * Prepares prompt data for export
 * @param prompts Array of prompts to export
 * @param workspace Optional workspace data to include
 * @returns Formatted export data object
 */
export function prepareExport(prompts: Prompt[], workspace?: Workspace): ExportData {
  return {
    version: CURRENT_EXPORT_VERSION,
    prompts,
    workspace,
    exportDate: new Date().toISOString()
  };
}

/**
 * Validates the structure and version of imported data
 * @param data The imported data to validate
 * @throws ImportExportError if validation fails
 */
export function validateImportData(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new ImportExportError(
      ImportExportErrorType.INVALID_FORMAT,
      'Invalid import data format'
    );
  }

  if (!data.version || !data.prompts || !Array.isArray(data.prompts)) {
    throw new ImportExportError(
      ImportExportErrorType.INVALID_FORMAT,
      'Missing required fields in import data'
    );
  }

  if (data.version !== CURRENT_EXPORT_VERSION) {
    throw new ImportExportError(
      ImportExportErrorType.VERSION_MISMATCH,
      `Unsupported version ${data.version}. Expected ${CURRENT_EXPORT_VERSION}`
    );
  }

  // Validate each prompt in the import data
  const allErrors: { prompt: Prompt; errors: PromptValidationError[] }[] = [];
  data.prompts.forEach((prompt: Prompt) => {
    const errors = validatePrompt(prompt);
    if (errors.length > 0) {
      allErrors.push({ prompt, errors });
    }
  });

  if (allErrors.length > 0) {
    throw new ImportExportError(
      ImportExportErrorType.VALIDATION_ERROR,
      'Invalid prompts in import data',
      allErrors
    );
  }
}

/**
 * Processes imported data and converts it to application models
 * @param data The validated import data
 * @returns Processed prompt models
 */
export function processImportData(data: ExportData): PromptModel[] {
  return data.prompts.map(prompt => new PromptModel(prompt));
}