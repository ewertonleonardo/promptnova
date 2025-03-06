/**
 * @file PromptCategories.tsx
 * @description Component for managing prompt categories in the PromptNova application.
 * This component provides functionality for viewing, creating, and selecting
 * categories to organize prompts.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { usePrompts } from '../../hooks/usePrompts';

interface PromptCategoriesProps {
  selectedCategory?: string;
  onSelectCategory: (category: string | null) => void;
}

/**
 * Component for managing prompt categories
 */
const PromptCategories: React.FC<PromptCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { prompts, loading } = usePrompts();
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Extract unique categories from prompts
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    
    prompts.forEach((prompt) => {
      if (prompt.category) {
        categorySet.add(prompt.category);
      }
    });
    
    return Array.from(categorySet).sort();
  }, [prompts]);

  /**
   * Handles category selection
   * @param category Category to select, or null for 'All'
   */
  const handleCategorySelect = (category: string | null) => {
    onSelectCategory(category);
  };

  /**
   * Handles adding a new category
   */
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      // Since we don't have a direct way to add categories without prompts,
      // we'll just add it to the UI and it will be properly saved when a prompt
      // is created or updated with this category
      onSelectCategory(newCategory.trim());
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  /**
   * Handles key press in the new category input
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    } else if (e.key === 'Escape') {
      setIsAddingCategory(false);
      setNewCategory('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Categories</h3>
        {!isAddingCategory && (
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {isAddingCategory && (
        <div className="mb-4 flex">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="New category name"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingCategory(false);
              setNewCategory('');
            }}
            className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-1">
        {/* All category option */}
        <button
          type="button"
          onClick={() => handleCategorySelect(null)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${selectedCategory === undefined ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          All Prompts
        </button>
        
        {/* Category list */}
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading categories...</div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategorySelect(category)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${selectedCategory === category ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {category}
            </button>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No categories found</div>
        )}
      </div>
    </div>
  );
};

export default PromptCategories;