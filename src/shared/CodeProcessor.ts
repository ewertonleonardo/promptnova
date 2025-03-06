import { SupportedLanguage } from './models/SupportedLanguage';

export interface ProcessingOptions {
  stripComments?: boolean;
  preserveDocComments?: boolean;
  removeEmptyLines?: boolean;
  trimWhitespace?: boolean;
}

export class CodeProcessor {
  private static readonly DEFAULT_OPTIONS: ProcessingOptions = {
    stripComments: true,
    preserveDocComments: true,
    removeEmptyLines: false,
    trimWhitespace: true
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

    if (finalOptions.stripComments) {
      processedCode = this.stripComments(processedCode, language, finalOptions.preserveDocComments);
    }

    if (finalOptions.trimWhitespace) {
      processedCode = this.trimWhitespace(processedCode);
    }

    if (finalOptions.removeEmptyLines) {
      processedCode = this.removeEmptyLines(processedCode);
    }

    return processedCode;
  }

  /**
   * Strip comments from code while optionally preserving documentation comments
   * @param code The source code
   * @param language The programming language
   * @param preserveDocComments Whether to preserve documentation comments
   * @returns Code with comments removed
   */
  private static stripComments(code: string, language: SupportedLanguage, preserveDocComments: boolean): string {
    const patterns = this.LANGUAGE_PATTERNS[language];
    if (!patterns) {
      throw new Error(`Unsupported language: ${language}`);
    }

    let processedCode = code;

    // Preserve doc comments if needed
    const docComments: string[] = [];
    if (preserveDocComments) {
      let match;
      const docPattern = patterns.docComment;
      while ((match = docPattern.exec(code)) !== null) {
        docComments.push(match[0]);
      }
    }

    // Remove all comments
    processedCode = processedCode.replace(patterns.multiLine, '');
    processedCode = processedCode.replace(patterns.singleLine, '');

    // Restore doc comments if needed
    if (preserveDocComments && docComments.length > 0) {
      docComments.forEach(comment => {
        processedCode = comment + '\n' + processedCode;
      });
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
}