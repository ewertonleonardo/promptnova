/**
 * Advanced code processing utilities
 * Provides functionality for code transformation, optimization, and analysis
 */

import { SupportedLanguage } from '../models/SupportedLanguage';
import { stripAllComments, stripNonDocComments, detectLanguage } from './commentStripping';

interface CodeProcessingOptions {
  removeComments?: boolean;
  preserveDocComments?: boolean;
  removeEmptyLines?: boolean;
  trimWhitespace?: boolean;
  normalizeIndentation?: boolean;
  maxLineLength?: number;
  minifyCode?: boolean;
}

const DEFAULT_OPTIONS: CodeProcessingOptions = {
  removeComments: false,
  preserveDocComments: true,
  removeEmptyLines: false,
  trimWhitespace: true,
  normalizeIndentation: false,
  maxLineLength: 0, // 0 means no limit
  minifyCode: false
};

/**
 * Process code with advanced options
 * @param code Source code to process
 * @param language Programming language of the code
 * @param options Processing options
 * @returns Processed code
 */
export function processCode(code: string, language: SupportedLanguage, options?: CodeProcessingOptions): string {
  // Merge with default options
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = code;

  // Auto-detect language if not specified
  const detectedLanguage = language || detectLanguage(code);
  
  // Remove comments if requested
  if (opts.removeComments) {
    result = opts.preserveDocComments 
      ? stripNonDocComments(result, detectedLanguage)
      : stripAllComments(result, detectedLanguage);
  }

  // Process whitespace and line breaks
  if (opts.trimWhitespace) {
    // Trim each line
    result = result.split('\n')
      .map(line => line.trim())
      .join('\n');
  }

  // Remove empty lines if requested
  if (opts.removeEmptyLines) {
    result = result.split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');
  }

  // Normalize indentation if requested
  if (opts.normalizeIndentation) {
    result = normalizeIndentation(result);
  }

  // Apply line length limit if specified
  if (opts.maxLineLength && opts.maxLineLength > 0) {
    result = applyLineLength(result, opts.maxLineLength);
  }

  // Minify code if requested
  if (opts.minifyCode) {
    result = minifyCode(result, detectedLanguage);
  }

  return result;
}

/**
 * Normalize indentation in code
 * @param code Source code
 * @returns Code with normalized indentation
 */
function normalizeIndentation(code: string): string {
  const lines = code.split('\n');
  const indentSizes: number[] = [];
  
  // Determine the indentation level of each non-empty line
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    
    const indent = line.search(/\S/);
    if (indent > 0) {
      indentSizes.push(indent);
    }
  }
  
  // Calculate the most common indentation size
  const indentSize = calculateMostCommonIndent(indentSizes) || 2;
  
  // Re-indent the code
  let currentIndentLevel = 0;
  const result = lines.map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return '';
    
    // Adjust indent level based on brackets
    if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(') || trimmedLine.endsWith('[')) {
      const indented = ' '.repeat(currentIndentLevel * indentSize) + trimmedLine;
      currentIndentLevel++;
      return indented;
    } else if (trimmedLine.startsWith('}') || trimmedLine.startsWith(')') || trimmedLine.startsWith(']')) {
      currentIndentLevel = Math.max(0, currentIndentLevel - 1);
      return ' '.repeat(currentIndentLevel * indentSize) + trimmedLine;
    }
    
    return ' '.repeat(currentIndentLevel * indentSize) + trimmedLine;
  });
  
  return result.join('\n');
}

/**
 * Calculate the most common indentation size
 * @param indentSizes Array of indentation sizes
 * @returns Most common indentation size
 */
function calculateMostCommonIndent(indentSizes: number[]): number | null {
  if (indentSizes.length === 0) return null;
  
  const counts: Record<number, number> = {};
  let maxCount = 0;
  let mostCommon = indentSizes[0];
  
  for (const size of indentSizes) {
    counts[size] = (counts[size] || 0) + 1;
    if (counts[size] > maxCount) {
      maxCount = counts[size];
      mostCommon = size;
    }
  }
  
  return mostCommon;
}

/**
 * Apply line length limit to code
 * @param code Source code
 * @param maxLength Maximum line length
 * @returns Code with limited line length
 */
function applyLineLength(code: string, maxLength: number): string {
  const lines = code.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    if (line.length <= maxLength) {
      result.push(line);
      continue;
    }
    
    // Simple line breaking for long lines
    let currentLine = line;
    while (currentLine.length > maxLength) {
      // Find a good breaking point
      let breakPoint = currentLine.lastIndexOf(' ', maxLength);
      if (breakPoint === -1) breakPoint = maxLength;
      
      result.push(currentLine.substring(0, breakPoint));
      currentLine = currentLine.substring(breakPoint).trimStart();
    }
    
    if (currentLine.length > 0) {
      result.push(currentLine);
    }
  }
  
  return result.join('\n');
}

/**
 * Basic code minification
 * @param code Source code
 * @param language Programming language
 * @returns Minified code
 */
function minifyCode(code: string, language: SupportedLanguage): string {
  // Remove all comments
  let result = stripAllComments(code, language);
  
  // Remove all empty lines
  result = result.split('\n')
    .filter(line => line.trim().length > 0)
    .join('\n');
  
  // Remove unnecessary whitespace
  result = result.replace(/\s+/g, ' ');
  
  // Language-specific optimizations
  switch (language) {
    case 'javascript':
    case 'typescript':
      // Remove spaces around operators
      result = result.replace(/\s*([\+\-\*\/\=\<\>\!\?\:\;\,\{\}\[\]])\s*/g, '$1');
      break;
    case 'css':
      // Remove spaces in CSS
      result = result.replace(/\s*([\{\}\:\;\,])\s*/g, '$1');
      break;
    case 'html':
      // Preserve spaces in HTML content but remove between tags
      result = result.replace(/\>\s+\</g, '><');
      break;
  }
  
  return result;
}

/**
 * Extract imports/includes from code
 * @param code Source code
 * @param language Programming language
 * @returns Array of import statements
 */
export function extractImports(code: string, language: SupportedLanguage): string[] {
  const imports: string[] = [];
  const lines = code.split('\n');
  
  // Language-specific import patterns
  const importPatterns: Record<string, RegExp> = {
    javascript: /^\s*import\s+.+\s+from\s+['"].*['"];?$/,
    typescript: /^\s*import\s+.+\s+from\s+['"].*['"];?$/,
    python: /^\s*(?:import|from)\s+.+$/,
    java: /^\s*import\s+.+;$/,
    csharp: /^\s*using\s+.+;$/,
    ruby: /^\s*require\s+['"].*['"]$/,
    php: /^\s*(?:require|include|use)\s+.+;$/,
    go: /^\s*import\s+(?:\([\s\S]*?\)|['"].*['"])$/
  };
  
  const pattern = importPatterns[language];
  if (!pattern) return imports;
  
  for (const line of lines) {
    if (pattern.test(line)) {
      imports.push(line.trim());
    }
  }
  
  return imports;
}

/**
 * Analyze code complexity
 * @param code Source code
 * @returns Complexity metrics
 */
export function analyzeComplexity(code: string): { lines: number, complexity: number } {
  const lines = code.split('\n').filter(line => line.trim().length > 0).length;
  
  // Simple complexity metric based on control structures
  const controlStructures = (
    code.match(/if|else|for|while|switch|case|try|catch|\?|\:|\&\&|\|\||function|=>|class/g) || []
  ).length;
  
  // Normalize complexity on a scale of 1-10
  const complexity = Math.min(10, Math.ceil(controlStructures / (lines / 10)));
  
  return { lines, complexity };
}