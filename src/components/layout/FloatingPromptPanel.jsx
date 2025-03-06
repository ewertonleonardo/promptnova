import React, { useState } from 'react';
import PropTypes from 'prop-types';

import FloatingPanel from './FloatingPanel';
import WindowManager from './WindowManager';
import SearchBar from '../navigation/SearchBar';
import { Tag } from '../ui/Tag';

/**
 * FloatingPromptPanel component that integrates the floating window UI components
 * 
 * This component combines FloatingPanel, WindowManager, and SearchBar to create
 * a complete floating interface for prompt management.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls panel visibility
 * @param {function} props.onClose - Callback when panel is closed
 * @param {boolean} props.alwaysOnTop - Whether the window should stay on top of other windows
 * @param {Object} props.initialPosition - Initial position of the panel
 */
const FloatingPromptPanel = ({
  isOpen = true,
  onClose,
  alwaysOnTop = true,
  initialPosition = { x: 100, y: 100 }
}) => {
  // Sample data for demonstration
  const [searchHistory] = useState(['React hooks', 'Tailwind CSS', 'Electron IPC']);
  const [sampleTags] = useState([
    { id: 1, text: 'React', color: 'sky' },
    { id: 2, text: 'Electron', color: 'emerald' },
    { id: 3, text: 'Tailwind', color: 'amber' }
  ]);

  // Handle search
  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    // This will be connected to the prompt database in a future step
  };

  // Handle tag click
  const handleTagClick = (tagId) => {
    console.log('Tag clicked:', tagId);
    // This will filter prompts by tag in a future step
  };

  return (
    <WindowManager alwaysOnTop={alwaysOnTop} defaultPosition={initialPosition}>
      <FloatingPanel
        title="Prompt Nova"
        isOpen={isOpen}
        onClose={onClose}
        initialPosition={initialPosition}
        minSize={{ width: 400, height: 500 }}
      >
        <div className="flex flex-col h-full">
          {/* Search section */}
          <div className="mb-4">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search prompts..."
              autoFocus={true}
              searchHistory={searchHistory}
            />
          </div>

          {/* Tags section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {sampleTags.map((tag) => (
                <Tag
                  key={tag.id}
                  color={tag.color}
                  onClick={() => handleTagClick(tag.id)}
                >
                  {tag.text}
                </Tag>
              ))}
            </div>
          </div>

          {/* Prompts section - placeholder for future implementation */}
          <div className="flex-1 overflow-auto">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompts</h4>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prompt list will be implemented in Step 8 (Prompt CRUD Operations)
              </p>
            </div>
          </div>
        </div>
      </FloatingPanel>
    </WindowManager>
  );
};

FloatingPromptPanel.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  alwaysOnTop: PropTypes.bool,
  initialPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })
};

export default FloatingPromptPanel;