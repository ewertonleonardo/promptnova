import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

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
  minSize = { width: 300, height: 200 }
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e) => {
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
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isOpen]);

  const handleMouseDown = (e) => {
    if (panelRef.current) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        minWidth: minSize.width,
        minHeight: minSize.height,
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
  minSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  })
};

export default FloatingPanel;