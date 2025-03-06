import React, { useState, useEffect } from 'react';
import { useCallback } from 'react';
import path from 'path';

const MAX_HISTORY_SIZE = 10;

const Breadcrumb = ({ currentPath, onPathChange }) => {
  const [pathHistory, setPathHistory] = useState([]);
  const [normalizedPath, setNormalizedPath] = useState('');

  // Normalize and validate path
  const normalizePath = useCallback((inputPath) => {
    try {
      // Normalize path separators and resolve relative paths
      const normalized = path.normalize(inputPath).replace(/\\/g, '/');
      // Remove trailing slashes except for root
      return normalized === '/' ? normalized : normalized.replace(/\/$/, '');
    } catch (error) {
      console.error('Path normalization error:', error);
      return inputPath;
    }
  }, []);

  // Update path history
  const updatePathHistory = useCallback((newPath) => {
    setPathHistory(prevHistory => {
      const updatedHistory = [newPath, ...prevHistory.filter(p => p !== newPath)];
      return updatedHistory.slice(0, MAX_HISTORY_SIZE);
    });
  }, []);

  // Handle path segment click
  const handleSegmentClick = useCallback((index, segments) => {
    const newPath = segments.slice(0, index + 1).join('/');
    onPathChange(newPath);
  }, [onPathChange]);

  // Validate path exists (to be implemented with FileSystemManager)
  const validatePath = useCallback(async (pathToValidate) => {
    try {
      // TODO: Implement actual file system validation using IPC
      return true;
    } catch (error) {
      console.error('Path validation error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const processPath = async () => {
      const normalized = normalizePath(currentPath);
      if (normalized !== normalizedPath) {
        const isValid = await validatePath(normalized);
        if (isValid) {
          setNormalizedPath(normalized);
          updatePathHistory(normalized);
        }
      }
    };

    processPath();
  }, [currentPath, normalizePath, normalizedPath, validatePath, updatePathHistory]);

  // Split path into segments for rendering
  const pathSegments = normalizedPath.split('/').filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <button
        onClick={() => onPathChange('/')}
        className="hover:text-gray-900"
      >
        Root
      </button>
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => handleSegmentClick(index, pathSegments)}
            className="hover:text-gray-900 truncate max-w-xs"
            title={segment}
          >
            {segment}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;