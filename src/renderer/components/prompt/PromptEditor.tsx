/**
 * @file PromptEditor.tsx
 * @description Component for creating and editing prompts in the PromptNova application.
 * This component provides a form interface for managing prompt data, including title,
 * content, category, and tags. It integrates with the usePrompts hook for CRUD operations.
 */

import React, { useState, useEffect } from 'react';
import { usePrompts } from '../../hooks/usePrompts';
import { Prompt } from '../../../shared/ipc-types';

interface PromptEditorProps {
  promptId?: string; // If provided, edit mode is activated
  onSave?: (prompt: Prompt) => void;
  onCancel?: () => void;
}

/**
 * Component for creating and editing prompts
 */
const PromptEditor: React.FC<PromptEditorProps> = ({ promptId, onSave, onCancel }) => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get prompt management functions from hook
  const { createPrompt, updatePrompt, getPromptById, error } = usePrompts();

  // Determine if we're in edit mode
  const isEditMode = !!promptId;

  // Load prompt data if in edit mode
  useEffect(() => {
    const loadPrompt = async () => {
      if (promptId) {
        try {
          const prompt = await getPromptById(promptId);
          setTitle(prompt.title);
          setContent(prompt.content);
          setCategory(prompt.category || '');
          setTags(prompt.tags || []);
        } catch (err) {
          console.error('Failed to load prompt:', err);
        }
      }
    };

    loadPrompt();
  }, [promptId, getPromptById]);

  /**
   * Validates the form fields
   * @returns True if valid, false otherwise
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    if (!content.trim()) {
      errors.content = 'Content is required';
    } else if (content.length > 10000) {
      errors.content = 'Content must be less than 10,000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const promptData = {
        title,
        content,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      let savedPrompt;

      if (isEditMode && promptId) {
        savedPrompt = await updatePrompt(promptId, promptData);
      } else {
        savedPrompt = await createPrompt(promptData);
      }

      if (onSave) {
        onSave(savedPrompt);
      }
    } catch (err) {
      console.error('Failed to save prompt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Adds a tag to the tags array
   */
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  /**
   * Removes a tag from the tags array
   */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  /**
   * Handles tag input key press
   */
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Edit Prompt' : 'Create New Prompt'}
      </h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title field */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.title ? 'border-red-500' : ''}`}
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Content field */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${validationErrors.content ? 'border-red-500' : ''}`}
          />
          {validationErrors.content && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Use {{placeholder}} syntax to define placeholders.
          </p>
        </div>

        {/* Category field */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Tags field */}
        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <div className="flex">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="ml-2 mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>

          {/* Display tags */}
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                >
                  <span className="sr-only">Remove tag</span>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Prompt' : 'Create Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptEditor;