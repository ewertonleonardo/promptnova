/**
 * Utility functions for stripping comments from code
 * Supports various programming languages and comment styles
 */

import { SupportedLanguage } from '../models/SupportedLanguage';

interface CommentPatterns {
  singleLine: RegExp;
  multiLine: RegExp;
  docComment: RegExp;
}

interface LanguagePatterns {
  [key: string]: CommentPatterns;
}

// Language-specific comment patterns
const LANGUAGE_PATTERNS: LanguagePatterns = {
  javascript: {
    singleLine: /\/\/.*/g,
    multiLine: /\/\*[\s\S]*?\*\//g,
    docComment: /\/\*\*[\s\S]*?\*\//g
  },
  typescript: {
    singleLine: /\/\/.*/g,
    multiLine: /\/\*[\s\S]*?\*\//g,
    docComment: /\/\*\*[\s\S]*?\*\//g
  },
  python: {
    singleLine: /#.*/g,
    multiLine: /'''[\s\S]*?'''|"""[\s\S]*?"""/g,
    docComment: /'''[\s\S]*?'''|"""[\s\S]*?"""/g
  },
  java: {
    singleLine: /\/\/.*/g,
    multiLine: /\/\*[\s\S]*?\*\//g,
    docComment: /\/\*\*[\s\S]*?\*\//g
  },
  csharp: {
    singleLine: /\/\/.*/g,
    multiLine: /\/\*[\s\S]*?\*\//g,
    docComment: /\/\*\*[\s\S]*?\*\//g
  },
  ruby: {
    singleLine: /#.*/g,
    multiLine: /=begin[\s\S]*?=end/g,
    docComment: /=begin[\s\S]*?=end/g
  },
  php: {
    singleLine: /(?:\/\/|#).*/g,
    multiLine: /\/\*[\s\S]*?\*\//g,
    docComment: /\/\*\*[\s\S]*?\*\//g
  },
  go: {
    singleLine: /\/\/.*/g,
    multiLine: /\/\*[\s\S]*?\*\//g,
    docComment: /\/\*[\s\S]*?\*\//g
  },
  rust: {
    singleLine: /\/\/.*/g,
    multiLine: /\/\*[\s\S]*?\*\//g,
    docComment: /\/\/\/.*|/g
  },
  html: {
    singleLine: /<!--.*-->/g,
    multiLine: /<!--[\s\S]*?-->/g,
    docComment: /<!--[\s\S]*?-->/g
  },
  css: {
    singleLine: null,
    multiLine: /\/\*[\s\S]*?\*\//g,
    docComment: /\/\*[\s\S]*?\*\//g
  }
};

/**
 * Detect the programming language from code content
 * @param code Source code to analyze
 * @returns Detected language or default to JavaScript
 */
export function detectLanguage(code: string): SupportedLanguage {
  // Simple language detection based on file extensions and content patterns
  if (code.includes('<?php')) {
    return SupportedLanguage.PHP;
  } else if (code.includes('import React') || code.includes('React.') || code.includes('useState')) {
    return SupportedLanguage.JavaScript;
  } else if (code.includes('interface ') || code.includes('namespace ') || code.includes(': string') || code.includes(': number')) {
    return SupportedLanguage.TypeScript;
  } else if (code.includes('def ') && code.includes(':') && (code.includes('self') || code.includes('__init__'))) {
    return SupportedLanguage.Python;
  } else if (code.includes('public class ') || code.includes('private class ') || code.includes('protected class ')) {
    return SupportedLanguage.Java;
  } else if (code.includes('<!DOCTYPE html') || code.includes('<html')) {
    return SupportedLanguage.HTML;
  } else if (code.includes('@media') || code.includes('@keyframes') || /[.#][a-zA-Z][^{]*\{/.test(code)) {
    return SupportedLanguage.CSS;
  } else if (code.includes('using System;') || code.includes('namespace ') && code.includes('class ') && code.includes('{')) {
    return SupportedLanguage.CSharp;
  } else if (code.includes('fn ') && code.includes('-> ') || code.includes('impl ') || code.includes('pub struct ')) {
    return SupportedLanguage.Rust;
  } else if (code.includes('package ') && code.includes('func ') && code.includes('import (')) {
    return SupportedLanguage.Go;
  } else if (code.includes('class ') && code.includes('end') && code.includes('def ')) {
    return SupportedLanguage.Ruby;
  }
  
  // Default to JavaScript if no match
  return SupportedLanguage.JavaScript;
}

/**
 * Strip all comments from code
 * @param code Source code to process
 * @param language Programming language of the code
 * @returns Code with all comments removed
 */
export function stripAllComments(code: string, language: SupportedLanguage): string {
  const patterns = LANGUAGE_PATTERNS[language];
  if (!patterns) {
    throw new Error(`Unsupported language: ${language}`);
  }

  let result = code;
  
  // Remove multi-line comments first
  if (patterns.multiLine) {
    result = result.replace(patterns.multiLine, '');
  }
  
  // Then remove single-line comments
  if (patterns.singleLine) {
    result = result.replace(patterns.singleLine, '');
  }
  
  return result;
}

/**
 * Strip comments but preserve documentation comments
 * @param code Source code to process
 * @param language Programming language of the code
 * @returns Code with non-documentation comments removed
 */
export function stripNonDocComments(code: string, language: SupportedLanguage): string {
  const patterns = LANGUAGE_PATTERNS[language];
  if (!patterns) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Extract and save documentation comments
  const docComments: {content: string, index: number}[] = [];
  if (patterns.docComment) {
    let match;
    const docPattern = new RegExp(patterns.docComment);
    while ((match = docPattern.exec(code)) !== null) {
      docComments.push({
        content: match[0],
        index: match.index
      });
    }
  }

  // Remove all comments
  let result = stripAllComments(code, language);

  // Restore documentation comments
  if (docComments.length > 0) {
    // Sort by index in descending order to avoid position shifts
    docComments.sort((a, b) => b.index - a.index);
    
    // Insert documentation comments back at their original positions
    for (const comment of docComments) {
      result = result.slice(0, comment.index) + comment.content + result.slice(comment.index);
    }
  }

  return result;
}

/**
 * Strip comments but preserve documentation comments
 * @param code Source code to process
 * @param language Programming language of the code
 * @returns Code with non-documentation comments removed
 */
export function stripNonDocComments(code: string, language: SupportedLanguage): string {
  const patterns = LANGUAGE_PATTERNS[language];
  if (!patterns) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Extract and save documentation comments
  const docComments: {content: string, index: number}[] = [];
  if (patterns.docComment) {
    let match;
    const docPattern = new RegExp(patterns.docComment);
    while ((match = docPattern.exec(code)) !== null) {
      docComments.push({
        content: match[0],
        index: match.index
      });
    }
  }

  // Remove all comments
  let result = stripAllComments(code, language);

  // Restore documentation comments
  if (docComments.length > 0) {
    // Sort by index in descending order to avoid position shifts
    docComments.sort((a, b) => b.index - a.index);
    
    // Insert documentation comments back at their original positions
    for (const comment of docComments) {
      result = result.slice(0, comment.index) + comment.content + result.slice(comment.index);
    }
  }

  return result;
}

/**
 * Strip comments but preserve documentation comments
 * @param code Source code to process
 * @param language Programming language of the code
 * @returns Code with non-documentation comments removed
 */
export function stripNonDocComments(code: string, language: SupportedLanguage): string {
  const patterns = LANGUAGE_PATTERNS[language];
  if (!patterns) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Extract and save documentation comments
  const docComments: {content: string, index: number}[] = [];
  if (patterns.docComment) {
    let match;
    const docPattern = new RegExp(patterns.docComment);
    while ((match = docPattern.exec(code)) !== null) {
      docComments.push({
        content: match[0],
        index: match.index
      });
    }
  }

  // Remove all comments
  let result = stripAllComments(code, language);

  // Restore documentation comments
  if (docComments.length > 0) {
    // Sort by index in descending order to avoid position shifts
    docComments.sort((a, b) => b.index - a.index);
    
    // Insert documentation comments back at their original positions
    for (const comment of docComments) {
      result = result.slice(0, comment.index) + comment.content + result.slice(comment.index);
    }
  }

  return result;
}

/**
 * Detect the most likely language of code based on content
 * @param code Source code to analyze
 * @returns Best guess of the language or 'javascript' as fallback
 */
export function detectLanguage(code: string): SupportedLanguage {
  // Simple heuristics to detect language
  if (code.includes('import React') || code.includes('useState') || code.includes('export interface')) {
    return 'typescript';
  }
  if (code.includes('func ') && code.includes('package ')) {
    return 'go';
  }
  if (code.includes('def ') && code.includes(':') && (code.includes('self') || code.includes('#'))) {
    return 'python';
  }
  if (code.includes('public class ') || code.includes('private void')) {
    return 'java';
  }
  if (code.includes('namespace ') || code.includes('using System;')) {
    return 'csharp';
  }
  if (code.includes('<?php')) {
    return 'php';
  }
  if (code.includes('<!DOCTYPE html') || code.includes('<html>')) {
    return 'html';
  }
  if (code.includes('@media') || code.includes('{') && code.includes('}') && code.includes(':')) {
    return 'css';
  }
  
  // Default to JavaScript if we can't determine
  return 'javascript';
}