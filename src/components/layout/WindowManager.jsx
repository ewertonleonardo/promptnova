import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * WindowManager component for managing Electron window behavior
 * 
 * This component provides integration with Electron's window management features,
 * including stay-on-top functionality, window positioning, and state persistence.
 * 
 * @component
 * @param {Object} props
 * @param {ReactNode} props.children - Content to be rendered inside the managed window
 * @param {boolean} props.alwaysOnTop - Whether the window should stay on top of other windows
 * @param {boolean} props.rememberPosition - Whether to remember the window position between sessions
 * @param {Object} props.defaultPosition - Default position for the window
 */
const WindowManager = ({
  children,
  alwaysOnTop = false,
  rememberPosition = true,
  defaultPosition = { x: 100, y: 100 }
}) => {
  const [isElectron, setIsElectron] = useState(false);
  const [windowPosition, setWindowPosition] = useState(defaultPosition);

  // Check if running in Electron environment
  useEffect(() => {
    setIsElectron(window?.electron !== undefined);
  }, []);

  // Set up Electron window behavior
  useEffect(() => {
    if (!isElectron) return;

    const electronWindow = window.electron;

    // Set always-on-top behavior
    if (electronWindow.setAlwaysOnTop) {
      electronWindow.setAlwaysOnTop(alwaysOnTop);
    }

    // Load saved position if available
    if (rememberPosition && electronWindow.getSavedPosition) {
      const savedPosition = electronWindow.getSavedPosition();
      if (savedPosition) {
        setWindowPosition(savedPosition);
      }
    }

    // Save position when window is moved
    const handleWindowMove = (newPosition) => {
      if (rememberPosition && electronWindow.savePosition) {
        electronWindow.savePosition(newPosition);
      }
      setWindowPosition(newPosition);
    };

    if (electronWindow.onWindowMove) {
      electronWindow.onWindowMove(handleWindowMove);
    }

    return () => {
      // Clean up event listeners
      if (electronWindow.removeWindowMoveListener) {
        electronWindow.removeWindowMoveListener(handleWindowMove);
      }
    };
  }, [isElectron, alwaysOnTop, rememberPosition]);

  return (
    <div className="window-manager">
      {children}
    </div>
  );
};

WindowManager.propTypes = {
  children: PropTypes.node.isRequired,
  alwaysOnTop: PropTypes.bool,
  rememberPosition: PropTypes.bool,
  defaultPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })
};

export default WindowManager;