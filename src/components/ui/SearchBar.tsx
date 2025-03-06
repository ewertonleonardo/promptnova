/**
 * @file SearchBar.tsx
 * @description Enhanced search bar component with real-time search and advanced filtering
 */

import React, { useState, useEffect, useRef } from 'react';
import { Prompt } from '../../shared/ipc-types';
import { searchService, SearchOptions } from '../../shared/services/SearchService';

interface SearchBarProps {
  onResultSelect?: (prompt: Prompt) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

interface FilterState {
  categories: string[];
  tags: string[];
  selectedCategories: string[];
  selectedTags: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onResultSelect,
  placeholder = 'Search prompts...',
  className = '',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    tags: [],
    selectedCategories: [],
    selectedTags: [],
  });
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize search service and load filters
  useEffect(() => {
    const initializeSearch = async () => {
      try {
        setLoading(true);
        await searchService.initialize();
        
        // Load available categories and tags for filters
        setFilters({
          categories: searchService.getCategories(),
          tags: searchService.getTags(),
          selectedCategories: [],
          selectedTags: [],
        });
      } catch (error) {
        console.error('Failed to initialize search:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSearch();
  }, []);

  // Handle outside click to close results dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim() === '') {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const searchOptions: SearchOptions = {
          query,
          categories: filters.selectedCategories.length > 0 ? filters.selectedCategories : undefined,
          tags: filters.selectedTags.length > 0 ? filters.selectedTags : undefined,
        };

        const searchResults = await searchService.search(searchOptions);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, filters.selectedCategories, filters.selectedTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
  };

  const handleResultClick = (prompt: Prompt) => {
    if (onResultSelect) {
      onResultSelect(prompt);
    }
    setShowResults(false);
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => {
      const isSelected = prev.selectedCategories.includes(category);
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter(c => c !== category)
          : [...prev.selectedCategories, category],
      };
    });
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => {
      const isSelected = prev.selectedTags.includes(tag);
      return {
        ...prev,
        selectedTags: isSelected
          ? prev.selectedTags.filter(t => t !== tag)
          : [...prev.selectedTags, tag],
      };
    });
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: [],
      selectedTags: [],
    }));
  };

  return (
    <div ref={searchBarRef} className={`relative ${className}`}>
      <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          autoFocus={autoFocus}
        />
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:text-gray-200"
            title="Advanced filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          {loading && (
            <div className="flex-shrink-0 text-gray-400 dark:text-gray-300">
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-800 border dark:border-gray-700">
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Advanced Filters</h3>
              <button
                onClick={clearFilters}
                className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Clear all
              </button>
            </div>
            
            {/* Categories */}
            {filters.categories.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {filters.categories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`text-xs px-2 py-1 rounded-full ${filters.selectedCategories.includes(category) 
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {filters.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {filters.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2 py-1 rounded-full ${filters.selectedTags.includes(tag) 
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && query.trim() !== '' && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-800 border dark:border-gray-700">
          {results.length > 0 ? (
            <ul className="max-h-60 overflow-auto py-1">
              {results.map(prompt => (
                <li
                  key={prompt.id}
                  onClick={() => handleResultClick(prompt)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{prompt.title}</div>
                  {prompt.category && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">{prompt.category}</div>
                  )}
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {prompt.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};