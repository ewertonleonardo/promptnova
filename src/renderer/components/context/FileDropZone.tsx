import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileDropZoneProps {
  /**
   * Callback function triggered when files are dropped or selected
   * @param files - Array of selected files
   */
  onFilesSelected: (files: File[]) => void;
  
  /**
   * Optional class name for styling the drop zone
   */
  className?: string;
  
  /**
   * Optional accepted file types
   * @default undefined - accepts all file types
   */
  acceptedFileTypes?: string[];
  
  /**
   * Maximum number of files that can be selected
   * @default undefined - no limit
   */
  maxFiles?: number;
}

/**
 * FileDropZone Component
 * 
 * A reusable component that provides drag and drop functionality for files.
 * It supports file type filtering, multiple file selection, and custom styling.
 * 
 * @component
 */
const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesSelected,
  className = '',
  acceptedFileTypes,
  maxFiles
}) => {
  // State to track drag active status
  const [isDragActive, setIsDragActive] = useState(false);

  // Configure dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes?.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  // Determine border color based on drag state
  const getBorderColor = () => {
    if (isDragReject) return 'border-red-500';
    if (isDragActive) return 'border-blue-500';
    return 'border-gray-300';
  };

  return (
    <div
      {...getRootProps()}
      className={`
        p-6 border-2 border-dashed rounded-lg
        transition-colors duration-200
        ${getBorderColor()}
        ${isDragActive ? 'bg-blue-50' : 'bg-gray-50'}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <p className="text-gray-600">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        {acceptedFileTypes && (
          <p className="text-sm text-gray-500 mt-2">
            Accepted file types: {acceptedFileTypes.join(', ')}
          </p>
        )}
        {maxFiles && (
          <p className="text-sm text-gray-500 mt-1">
            Maximum files allowed: {maxFiles}
          </p>
        )}
        {isDragReject && (
          <p className="text-sm text-red-500 mt-2">
            Some files will be rejected. Please check the file type and count.
          </p>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;