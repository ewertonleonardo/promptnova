import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * CodeBlock component for displaying formatted code with syntax highlighting
 * 
 * This component provides code preview functionality with copy-to-clipboard
 * and optional line numbers.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.children - The code content to display
 * @param {string} props.language - The programming language for syntax highlighting
 * @param {boolean} props.showLineNumbers - Whether to display line numbers
 * @param {string} props.filename - Optional filename to display above the code block
 * @param {boolean} props.showCopyButton - Whether to show the copy button
 */
const CodeBlock = ({
  children,
  language = 'plaintext',
  showLineNumbers = true,
  filename = '',
  showCopyButton = true
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Split code into lines for line numbering
  const codeLines = children.split('\n');

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg bg-zinc-900 dark:bg-zinc-800">
      {/* Optional filename header */}
      {filename && (
        <div className="flex items-center justify-between border-b border-black/10 bg-zinc-800 px-4 py-2 text-xs text-zinc-200 dark:border-white/10">
          <span>{filename}</span>
        </div>
      )}

      {/* Code content */}
      <div className="relative overflow-auto p-4">
        {/* Copy button */}
        {showCopyButton && (
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded bg-zinc-700 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity hover:bg-zinc-600 group-hover:opacity-100"
            onClick={handleCopy}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        )}

        {/* Code with optional line numbers */}
        <div className="flex">
          {showLineNumbers && (
            <div className="mr-4 flex flex-col items-end text-xs text-zinc-500">
              {codeLines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <pre className={clsx(
            'flex-1 overflow-auto text-xs',
            `language-${language}`
          )}>
            <code className={`language-${language}`}>{children}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

CodeBlock.propTypes = {
  children: PropTypes.string.isRequired,
  language: PropTypes.string,
  showLineNumbers: PropTypes.bool,
  filename: PropTypes.string,
  showCopyButton: PropTypes.bool
};

export default CodeBlock;