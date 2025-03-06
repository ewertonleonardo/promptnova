import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

/**
 * FloatingPanel component for creating a draggable, resizable floating window
 * 
 * @component
 * @param {Object} props
 * @param {ReactNode} props.children - Content to be rendered inside the panel
 * @param {string} props.title - Title of the floating panel
 * @param {boolean} props.isOpen - Controls panel visibility
 * @param {function} props.onClose - Callback when panel is closed
 * @param {Object} props.initialPosition - Initial position of the panel
 * @param {Object} props.minSize - Minimum size constraints for the panel
 */
const FloatingPanel = ({
  children,
  title = 'Prompt Nova',
  isOpen = true,
  onClose,
  initialPosition = { x: 100, y: 100 },
  minSize = { width: 300, height: 200 },
  maxSize = { width: 800, height: 600 }
}) => {
  const [position, setPosition] = useState(() => {
    const savedPosition = localStorage.getItem('floatingPanelPosition');
    return savedPosition ? JSON.parse(savedPosition) : initialPosition;
  });
  const [size, setSize] = useState(() => {
    const savedSize = localStorage.getItem('floatingPanelSize');
    return savedSize ? JSON.parse(savedSize) : minSize;
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  const savePositionToStorage = useCallback(
    debounce((pos) => {
      localStorage.setItem('floatingPanelPosition', JSON.stringify(pos));
    }, 100),
    []
  );

  const saveSizeToStorage = useCallback(
    debounce((newSize) => {
      localStorage.setItem('floatingPanelSize', JSON.stringify(newSize));
    }, 100),
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e) => {
      if (isResizing && panelRef.current) {
        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;
        
        const newWidth = Math.min(maxSize.width, Math.max(minSize.width, size.width + deltaX));
        const newHeight = Math.min(maxSize.height, Math.max(minSize.height, size.height + deltaY));
        
        setSize({ width: newWidth, height: newHeight });
        saveSizeToStorage({ width: newWidth, height: newHeight });
        
        resizeStartPos.current = { x: e.clientX, y: e.clientY };
        return;
      }


      if (isDragging && panelRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep panel within window bounds
        const maxX = window.innerWidth - panelRef.current.offsetWidth;
        const maxY = window.innerHeight - panelRef.current.offsetHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, isOpen, size.width, size.height, minSize, maxSize, saveSizeToStorage]);

  const handleMouseDown = (e) => {
    if (panelRef.current) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  useEffect(() => {
    savePositionToStorage(position);
  }, [position, savePositionToStorage]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: minSize.width,
        minHeight: minSize.height,
        maxWidth: maxSize.width,
        maxHeight: maxSize.height,
        zIndex: 9999
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            aria-label="Close panel"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
        style={{
          background: 'transparent',
          transform: 'translate(50%, 50%)',
        }}
      />
    </div>
  );
};

FloatingPanel.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  initialPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  maxSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }),
  minSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  })
};

export default FloatingPanel;