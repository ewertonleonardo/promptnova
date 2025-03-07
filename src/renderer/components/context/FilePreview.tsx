import React, { useState, useEffect } from 'react';
import { FiFile, FiFileText, FiImage, FiCode, FiX } from 'react-icons/fi';

interface FilePreviewProps {
  /**
   * The file to preview
   */
  file: File;
  
  /**
   * Optional callback when remove button is clicked
   */
  onRemove?: () => void;
  
  /**
   * Optional class name for styling
   */
  className?: string;
  
  /**
   * Maximum preview size in bytes
   * @default 5242880 (5MB)
   */
  maxPreviewSize?: number;
}

/**
 * FilePreview Component
 * 
 * A component that displays a preview of a file with appropriate icon and metadata.
 * For text and image files, it attempts to show a preview of the content.
 * 
 * @component
 */
const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  className = '',
  maxPreviewSize = 5 * 1024 * 1024 // 5MB default
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Determine file type and icon
  const getFileIcon = () => {
    const type = file.type;
    
    if (type.startsWith('image/')) return <FiImage className="text-blue-500" size={24} />;
    if (type.startsWith('text/')) return <FiFileText className="text-green-500" size={24} />;
    if (type.includes('javascript') || type.includes('json') || type.includes('html') || type.includes('css')) {
      return <FiCode className="text-purple-500" size={24} />;
    }
    
    return <FiFile className="text-gray-500" size={24} />;
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Generate preview based on file type
  useEffect(() => {
    // Clear previous preview
    setPreview(null);
    setError(null);
    
    // Skip large files
    if (file.size > maxPreviewSize) {
      setError(`File too large to preview (${formatFileSize(file.size)})`); 
      return;
    }
    
    const fileType = file.type;
    
    // Handle image files
    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      
      reader.onerror = () => {
        setError('Failed to load image preview');
      };
      
      reader.readAsDataURL(file);
      return;
    }
    
    // Handle text files
    if (fileType.startsWith('text/') || 
        fileType.includes('javascript') || 
        fileType.includes('json') || 
        fileType.includes('css') || 
        fileType.includes('html')) {
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Truncate long text files
        setPreview(content.length > 500 ? `${content.substring(0, 500)}...` : content);
      };
      
      reader.onerror = () => {
        setError('Failed to load text preview');
      };
      
      reader.readAsText(file);
      return;
    }
    
    // No preview available for other file types
    setPreview(null);
  }, [file, maxPreviewSize]);
  
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          {getFileIcon()}
          <div className="ml-3 truncate max-w-xs">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        
        {onRemove && (
          <button 
            onClick={onRemove}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Remove file"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
      
      {/* Preview content */}
      <div className="mt-3">
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        
        {!error && preview && fileType.startsWith('image/') && (
          <div className="mt-2 flex justify-center">
            <img 
              src={preview} 
              alt={file.name} 
              className="max-h-48 max-w-full object-contain rounded"
            />
          </div>
        )}
        
        {!error && preview && !fileType.startsWith('image/') && (
          <div className="mt-2 bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap">{preview}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;