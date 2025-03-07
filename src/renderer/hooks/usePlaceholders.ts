/**
 * @file usePlaceholders.ts
 * @description Custom hook for managing placeholders in prompts.
 * This hook provides functionality for extracting, validating, and replacing
 * placeholders in prompt content, as well as managing placeholder values.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  extractPlaceholders,
  isValidPlaceholderName,
  replacePlaceholders,
  generateDefaultValue,
  formatPlaceholderName
} from '../../shared/utils/placeholder';

interface UsePlaceholdersOptions {
  /**
   * Initial content containing placeholders
   */
  content?: string;
  
  /**
   * Initial values for placeholders
   */
  initialValues?: Record<string, string>;
}

interface UsePlaceholdersReturn {
  /**
   * Array of placeholder names extracted from content
   */
  placeholders: string[];
  
  /**
   * Current values for placeholders
   */
  values: Record<string, string>;
  
  /**
   * Sets a value for a specific placeholder
   */
  setValue: (placeholder: string, value: string) => void;
  
  /**
   * Sets multiple placeholder values at once
   */
  setValues: (values: Record<string, string>) => void;
  
  /**
   * Resets all placeholder values to defaults or empty strings
   */
  resetValues: () => void;
  
  /**
   * Applies placeholder values to content
   */
  applyValues: (content: string) => string;
  
  /**
   * Updates the content to extract placeholders from
   */
  updateContent: (content: string) => void;
  
  /**
   * Validates a placeholder name
   */
  validatePlaceholder: (name: string) => boolean;
  
  /**
   * Formats a placeholder name for display
   */
  formatPlaceholder: (name: string) => string;
}

/**
 * Custom hook for managing placeholders in prompts
 * @param options Configuration options
 * @returns Object with placeholder management functions
 */
export function usePlaceholders(options: UsePlaceholdersOptions = {}): UsePlaceholdersReturn {
  const { content: initialContent = '', initialValues = {} } = options;
  
  // State for content and extracted placeholders
  const [content, setContent] = useState(initialContent);
  const [values, setAllValues] = useState<Record<string, string>>(initialValues);
  
  // Extract placeholders from content
  const placeholders = useMemo(() => {
    return extractPlaceholders(content);
  }, [content]);
  
  // Initialize default values for placeholders
  useMemo(() => {
    const newValues = { ...values };
    let valuesChanged = false;
    
    placeholders.forEach(placeholder => {
      if (newValues[placeholder] === undefined) {
        newValues[placeholder] = initialValues[placeholder] || generateDefaultValue(placeholder);
        valuesChanged = true;
      }
    });
    
    if (valuesChanged) {
      setAllValues(newValues);
    }
  }, [placeholders, initialValues]);
  
  /**
   * Sets a value for a specific placeholder
   */
  const setValue = useCallback((placeholder: string, value: string) => {
    setAllValues(prev => ({ ...prev, [placeholder]: value }));
  }, []);
  
  /**
   * Sets multiple placeholder values at once
   */
  const setValues = useCallback((newValues: Record<string, string>) => {
    setAllValues(prev => ({ ...prev, ...newValues }));
  }, []);
  
  /**
   * Resets all placeholder values to defaults or empty strings
   */
  const resetValues = useCallback(() => {
    const defaultValues: Record<string, string> = {};
    
    placeholders.forEach(placeholder => {
      defaultValues[placeholder] = generateDefaultValue(placeholder);
    });
    
    setAllValues(defaultValues);
  }, [placeholders]);
  
  /**
   * Applies placeholder values to content
   */
  const applyValues = useCallback((contentToApply: string): string => {
    return replacePlaceholders(contentToApply, values);
  }, [values]);
  
  /**
   * Updates the content to extract placeholders from
   */
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);
  
  /**
   * Validates a placeholder name
   */
  const validatePlaceholder = useCallback((name: string): boolean => {
    return isValidPlaceholderName(name);
  }, []);
  
  /**
   * Formats a placeholder name for display
   */
  const formatPlaceholder = useCallback((name: string): string => {
    return formatPlaceholderName(name);
  }, []);
  
  return {
    placeholders,
    values,
    setValue,
    setValues,
    resetValues,
    applyValues,
    updateContent,
    validatePlaceholder,
    formatPlaceholder,
  };
}