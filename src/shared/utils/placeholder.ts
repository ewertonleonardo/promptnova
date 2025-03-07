/**
 * @file placeholder.ts
 * @description Utility functions for detecting and managing placeholders in prompts.
 * Placeholders are special tokens in prompt content that can be replaced with user input
 * at runtime. This module provides functions to extract, validate, and process placeholders.
 */

/**
 * Regular expression to match placeholder syntax {{placeholder_name}}
 * Captures the placeholder name as a group
 */
const PLACEHOLDER_REGEX = /\{\{([^{}]+)\}\}/g;

/**
 * Extracts all placeholders from a given text
 * @param text The text to extract placeholders from
 * @returns Array of unique placeholder names (without the {{ }} syntax)
 */
export function extractPlaceholders(text: string): string[] {
  if (!text) return [];
  
  const matches = text.match(PLACEHOLDER_REGEX) || [];
  const placeholders = matches.map(match => match.slice(2, -2).trim());
  
  // Return unique placeholders only
  return [...new Set(placeholders)];
}

/**
 * Validates a placeholder name
 * @param name The placeholder name to validate
 * @returns True if the placeholder name is valid, false otherwise
 */
export function isValidPlaceholderName(name: string): boolean {
  // Placeholder names should be alphanumeric with underscores and hyphens
  // They should not start with a number
  const validNameRegex = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;
  return validNameRegex.test(name);
}

/**
 * Replaces placeholders in a text with their values
 * @param text The text containing placeholders
 * @param values Object mapping placeholder names to their values
 * @returns Text with placeholders replaced by their values
 */
export function replacePlaceholders(text: string, values: Record<string, string>): string {
  if (!text) return '';
  
  return text.replace(PLACEHOLDER_REGEX, (match, placeholderName) => {
    const trimmedName = placeholderName.trim();
    return values[trimmedName] !== undefined ? values[trimmedName] : match;
  });
}

/**
 * Generates a default value for a placeholder based on its name
 * @param name The placeholder name
 * @returns A sensible default value or empty string
 */
export function generateDefaultValue(name: string): string {
  // Common placeholder types with sensible defaults
  const defaults: Record<string, string> = {
    name: 'John Doe',
    email: 'user@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    company: 'ACME Corporation',
    url: 'https://example.com',
  };
  
  // Check if the placeholder name contains any of the keys
  for (const [key, value] of Object.entries(defaults)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return '';
}

/**
 * Creates a placeholder object with name and default value
 * @param name The placeholder name
 * @returns Placeholder object with name and default value
 */
export function createPlaceholder(name: string): { name: string; defaultValue: string } {
  return {
    name,
    defaultValue: generateDefaultValue(name),
  };
}

/**
 * Formats a placeholder name for display
 * @param name The raw placeholder name
 * @returns Formatted placeholder name (capitalized, spaces instead of underscores)
 */
export function formatPlaceholderName(name: string): string {
  // Convert snake_case or kebab-case to Title Case With Spaces
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase());
}