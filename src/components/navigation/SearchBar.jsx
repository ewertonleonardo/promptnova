import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * SearchBar component for searching prompts in the floating interface
 * 
 * This component provides a search input with filtering capabilities
 * that will be connected to the prompt database.
 * 
 * @component
 * @param {Object} props
 * @param {function} props.onSearch - Callback function when search is performed
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {boolean} props.autoFocus - Whether to focus the search input on mount
 * @param {Array} props.searchHistory - List of recent search terms
 */
const SearchBar = ({
  onSearch,
  placeholder = 'Search prompts...',
  autoFocus = false,
  searchHistory = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const searchInputRef = useRef(null);
  const historyRef = useRef(null);

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setIsHistoryOpen(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    // Show history dropdown when typing if there's history
    setIsHistoryOpen(e.target.value !== '' && searchHistory.length > 0);
  };

  // Handle history item selection
  const handleHistorySelect = (term) => {
    setSearchTerm(term);
    setIsHistoryOpen(false);
    if (onSearch) {
      onSearch(term);
    }
  };

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto focus on mount if specified
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="search"
          className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onClick={() => setIsHistoryOpen(searchTerm !== '' && searchHistory.length > 0)}
          aria-label="Search prompts"
        />
        <button 
          type="submit" 
          className="absolute right-2 bottom-2 top-2 px-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Search
        </button>
      </form>

      {/* Search history dropdown */}
      {isHistoryOpen && searchHistory.length > 0 && (
        <div 
          ref={historyRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg dark:bg-gray-700 max-h-60 overflow-auto"
        >
          <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
            {searchHistory.map((term, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => handleHistorySelect(term)}
                >
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  searchHistory: PropTypes.arrayOf(PropTypes.string)
};

export default SearchBar;