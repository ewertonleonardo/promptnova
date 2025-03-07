/**
 * @file PlaceholderEditor.tsx
 * @description Component for editing placeholder values in prompts.
 * This component displays a form with input fields for each placeholder
 * detected in a prompt's content, allowing users to customize the values
 * before using the prompt.
 */

import React, { useState, useEffect } from 'react';
import { extractPlaceholders, formatPlaceholderName, generateDefaultValue } from '../../../shared/utils/placeholder';

interface PlaceholderEditorProps {
  /**
   * The prompt content containing placeholders
   */
  content: string;
  
  /**
   * Optional initial values for placeholders
   */
  initialValues?: Record<string, string>;
  
  /**
   * Callback fired when placeholder values change
   */
  onChange?: (values: Record<string, string>) => void;
  
  /**
   * Callback fired when the form is submitted
   */
  onSubmit?: (values: Record<string, string>) => void;
}

/**
 * Component for editing placeholder values in prompts
 */
const PlaceholderEditor: React.FC<PlaceholderEditorProps> = ({
  content,
  initialValues = {},
  onChange,
  onSubmit,
}) => {
  // Extract placeholders from content
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  
  // State for placeholder values
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  
  // Extract placeholders when content changes
  useEffect(() => {
    const extractedPlaceholders = extractPlaceholders(content);
    setPlaceholders(extractedPlaceholders);
    
    // Initialize values for new placeholders
    const newValues = { ...values };
    let valuesChanged = false;
    
    extractedPlaceholders.forEach(placeholder => {
      if (newValues[placeholder] === undefined) {
        newValues[placeholder] = initialValues[placeholder] || generateDefaultValue(placeholder);
        valuesChanged = true;
      }
    });
    
    if (valuesChanged) {
      setValues(newValues);
      if (onChange) {
        onChange(newValues);
      }
    }
  }, [content, initialValues]);
  
  /**
   * Handles input change for a placeholder
   */
  const handleInputChange = (placeholder: string, value: string) => {
    const newValues = { ...values, [placeholder]: value };
    setValues(newValues);
    
    if (onChange) {
      onChange(newValues);
    }
  };
  
  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(values);
    }
  };
  
  // If no placeholders found, don't render anything
  if (placeholders.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Placeholders</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {placeholders.map(placeholder => (
            <div key={placeholder} className="flex flex-col">
              <label htmlFor={`placeholder-${placeholder}`} className="block text-sm font-medium text-gray-700 mb-1">
                {formatPlaceholderName(placeholder)}
              </label>
              <input
                type="text"
                id={`placeholder-${placeholder}`}
                value={values[placeholder] || ''}
                onChange={(e) => handleInputChange(placeholder, e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          ))}
        </div>
        
        {onSubmit && (
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PlaceholderEditor;