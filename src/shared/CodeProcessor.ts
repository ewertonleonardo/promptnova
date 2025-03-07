import { SupportedLanguage } from './models/SupportedLanguage';
import { stripAllComments, stripNonDocComments, detectLanguage } from './utils/commentStripping';

export interface ProcessingOptions {
  stripComments?: boolean;
  preserveDocComments?: boolean;
  removeEmptyLines?: boolean;
  trimWhitespace?: boolean;
  normalizeIndentation?: boolean;
  maxLineLength?: number;
  minifyCode?: boolean;
}

export class CodeProcessor {
  private static readonly DEFAULT_OPTIONS: ProcessingOptions = {
    stripComments: true,
    preserveDocComments: true,
    removeEmptyLines: false,
    trimWhitespace: true,
    normalizeIndentation: false,
    maxLineLength: 0, // 0 means no limit
    minifyCode: false
  };

  private static readonly LANGUAGE_PATTERNS = {
    javascript: {
      singleLine: /\/\/.*/g,
      multiLine: /\/\*[\s\S]*?\*\//g,
      docComment: /\/\*\*[\s\S]*?\*\//g
    },
    python: {
      singleLine: /#.*/g,
      multiLine: /'''[\s\S]*?'''|"""|[\s\S]*?"""/g,
      docComment: /'''[\s\S]*?'''|"""|[\s\S]*?"""/g
    },
    typescript: {
      singleLine: /\/\/.*/g,
      multiLine: /\/\*[\s\S]*?\*\//g,
      docComment: /\/\*\*[\s\S]*?\*\//g
    }
  };

  /**
   * Process code according to specified language and options
   * @param code The source code to process
   * @param language The programming language of the code
   * @param options Processing options
   * @returns Processed code
   */
  public static process(code: string, language: SupportedLanguage, options?: ProcessingOptions): string {
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };
    let processedCode = code;

    // Auto-detect language if not specified
    const detectedLanguage = language || detectLanguage(code);

    if (finalOptions.stripComments) {
      processedCode = finalOptions.preserveDocComments
        ? stripNonDocComments(processedCode, detectedLanguage)
        : stripAllComments(processedCode, detectedLanguage);
    }

    if (finalOptions.trimWhitespace) {
      processedCode = this.trimWhitespace(processedCode);
    }

    if (finalOptions.removeEmptyLines) {
      processedCode = this.removeEmptyLines(processedCode);
    }

    if (finalOptions.normalizeIndentation) {
      processedCode = this.normalizeIndentation(processedCode);
    }

    if (finalOptions.maxLineLength && finalOptions.maxLineLength > 0) {
      processedCode = this.applyLineLength(processedCode, finalOptions.maxLineLength);
    }

    if (finalOptions.minifyCode) {
      processedCode = this.minifyCode(processedCode, detectedLanguage);
    }

    return processedCode;
  }

  /**
   * Remove empty lines from code
   * @param code The source code
   * @returns Code with empty lines removed
   */
  private static removeEmptyLines(code: string): string {
    return code.split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');
  }

  /**
   * Trim whitespace from each line while preserving indentation
   * @param code The source code
   * @returns Code with trimmed whitespace
   */
  private static trimWhitespace(code: string): string {
    return code.split('\n')
      .map(line => line.trimEnd())
      .join('\n');
  }

  /**
   * Normalize indentation in code
   * @param code Source code
   * @returns Code with normalized indentation
   */
  private static normalizeIndentation(code: string): string {
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
    const indentSize = indentSizes.length > 0 
      ? Math.min(...indentSizes) 
      : 2; // Default to 2 spaces if no indentation found
    
    // Normalize indentation
    return lines.map(line => {
      if (line.trim().length === 0) return '';
      
      const currentIndent = line.search(/\S/);
      const indentLevel = Math.floor(currentIndent / indentSize);
      const normalizedIndent = ' '.repeat(indentLevel * 2); // Use 2 spaces as standard
      
      return normalizedIndent + line.trim();
    }).join('\n');
  }

  /**
   * Apply line length limit to code
   * @param code Source code
   * @param maxLength Maximum line length
   * @returns Code with lines wrapped to maximum length
   */
  private static applyLineLength(code: string, maxLength: number): string {
    const lines = code.split('\n');
    const result: string[] = [];
    
    for (const line of lines) {
      if (line.length <= maxLength) {
        result.push(line);
        continue;
      }
      
      // Simple line wrapping - this could be improved for specific languages
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
   * Minify code by removing unnecessary whitespace and formatting
   * @param code Source code
   * @param language Programming language
   * @returns Minified code
   */
  private static minifyCode(code: string, language: SupportedLanguage): string {
    // Basic minification - language-specific minifiers would be better
    let result = code;
    
    // Remove all comments
    result = stripAllComments(result, language);
    
    // Remove all empty lines
    result = result.split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');
    
    // Remove excess whitespace
    result = result.replace(/\s+/g, ' ');
    
    // Language-specific optimizations could be added here
    switch (language) {
      case SupportedLanguage.JavaScript:
      case SupportedLanguage.TypeScript:
        // Remove unnecessary semicolons and whitespace around operators
        result = result.replace(/\s*([\{\}\(\)\[\]\,\;\:\+\-\*\/\=\<\>\&\|\!])\s*/g, '$1');
        break;
      case SupportedLanguage.CSS:
        // Remove whitespace around CSS operators
        result = result.replace(/\s*([\{\}\:\;\,])\s*/g, '$1');
        break;
      // Add more language-specific optimizations as needed
    }
    
    return result;
  }

  /**
   * Remove empty lines from code
   * @param code The source code
   * @returns Code with empty lines removed
   */
  private static removeEmptyLines(code: string): string {
    return code.split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');
  }

  /**
   * Trim whitespace from each line while preserving indentation
   * @param code The source code
   * @returns Code with trimmed whitespace
   */
  private static trimWhitespace(code: string): string {
    return code.split('\n')
      .map(line => line.trimEnd())
      .join('\n');
  }
}