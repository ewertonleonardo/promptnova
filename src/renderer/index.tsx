/**
 * Renderer process entry point for PromptNova
 * 
 * This file initializes the React application and renders it to the DOM.
 * It serves as the entry point for the renderer process in our Electron app.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

// Import the main App component (to be created later)
const App = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">PromptNova</h1>
        <p className="text-gray-600">
          A desktop application for centralized prompt management and utilization.
        </p>
      </div>
    </div>
  );
};

// Create the root element for React
const rootElement = document.getElementById('root');

// Ensure the root element exists
if (!rootElement) {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
}

// Render the React application
ReactDOM.createRoot(rootElement || document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);