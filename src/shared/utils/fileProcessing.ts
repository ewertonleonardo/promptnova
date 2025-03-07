import { ipcRenderer } from 'electron';

/**
 * File Processing Utilities
 * 
 * A collection of utility functions for handling file operations and processing
 * in the PromptNova application. These utilities handle common file operations,
 * validation, and processing tasks.
 */

/**
 * Maximum file size in bytes (default: 10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Supported file types for text processing
 */
export const SUPPORTED_TEXT_TYPES = [
  'text/plain',
  'text/javascript',
  'application/javascript',
  'text/typescript',
  'application/typescript',
  'text/html',
  'text/css',
  'application/json',
  'text/markdown',
  'text/x-python',
  'text/x-java',
];

/**
 * Error types for file processing
 */
export enum FileProcessingError {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_TYPE = 'UNSUPPORTED_TYPE',
  READ_ERROR = 'READ_ERROR',
  WRITE_ERROR = 'WRITE_ERROR',
}

/**
 * Interface for file validation result
 */
interface FileValidationResult {
  isValid: boolean;
  error?: FileProcessingError;
  message?: string;
}

/**
 * Validates a file against size and type constraints
 * 
 * @param file - The file to validate
 * @param maxSize - Maximum allowed file size in bytes
 * @param allowedTypes - Array of allowed MIME types
 * @returns FileValidationResult object
 */
export const validateFile = (
  file: File,
  maxSize: number = MAX_FILE_SIZE,
  allowedTypes?: string[]
): FileValidationResult => {
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: FileProcessingError.FILE_TOO_LARGE,
      message: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
    };
  }

  // Check file type if restrictions are provided
  if (allowedTypes && allowedTypes.length > 0) {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: FileProcessingError.UNSUPPORTED_TYPE,
        message: `File type '${file.type}' is not supported`
      };
    }
  }

  return { isValid: true };
};

/**
 * Reads a text file and returns its content
 * 
 * @param file - The file to read
 * @returns Promise resolving to the file content
 * @throws Error if file reading fails
 */
export const readTextFile = async (file: File): Promise<string> => {
  try {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  } catch (error) {
    throw new Error(`Error reading file: ${error.message}`);
  }
};

/**
 * Saves a file to the local filesystem using Electron's IPC
 * 
 * @param content - The content to save
 * @param fileName - Name for the saved file
 * @param fileType - MIME type of the file
 * @returns Promise resolving to the saved file path
 */
export const saveFile = async (
  content: string | Buffer,
  fileName: string,
  fileType: string
): Promise<string> => {
  try {
    const filePath = await ipcRenderer.invoke('save-file', {
      content,
      fileName,
      fileType
    });
    return filePath;
  } catch (error) {
    throw new Error(`Error saving file: ${error.message}`);
  }
};

/**
 * Processes text content by removing unnecessary whitespace and comments
 * 
 * @param content - The text content to process
 * @returns Processed text content
 */
export const processTextContent = (content: string): string => {
  // Remove multiple empty lines
  const processedContent = content
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove trailing whitespace
    .replace(/[ \t]+$/gm, '')
    // Normalize line endings
    .replace(/\r\n/g, '\n');

  return processedContent.trim();
};

/**
 * Extracts file extension from filename
 * 
 * @param fileName - Name of the file
 * @returns File extension (lowercase, without dot)
 */
export const getFileExtension = (fileName: string): string => {
  const match = fileName.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
};

/**
 * Generates a unique filename by appending a number if necessary
 * 
 * @param fileName - Original filename
 * @param existingFiles - Array of existing filenames
 * @returns Unique filename
 */
export const generateUniqueFileName = (
  fileName: string,
  existingFiles: string[]
): string => {
  if (!existingFiles.includes(fileName)) {
    return fileName;
  }

  const ext = getFileExtension(fileName);
  const baseName = fileName.slice(0, -(ext.length + 1));
  let counter = 1;

  while (existingFiles.includes(`${baseName} (${counter}).${ext}`)) {
    counter++;
  }

  return `${baseName} (${counter}).${ext}`;
};