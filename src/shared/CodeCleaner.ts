import { SupportedLanguage } from './models/SupportedLanguage';

export interface CleaningOptions {
  preserveDocumentationSpacing?: boolean;
  preserveFunctionSpacing?: boolean;
  preserveClassSpacing?: boolean;
  minConsecutiveEmptyLines?: number;
  maxConsecutiveEmptyLines?: number;
}

export class CodeCleaner {
  private static readonly DEFAULT_OPTIONS: CleaningOptions = {
    preserveDocumentationSpacing: true,
    preserveFunctionSpacing: true,
    preserveClassSpacing: true,
    minConsecutiveEmptyLines: 1,
    maxConsecutiveEmptyLines: 2
  };

  private static readonly LANGUAGE_PATTERNS = {
    javascript: {
      functionDeclaration: /^\s*(async\s+)?function\s+\w+|^\s*\w+\s*=\s*(async\s+)?function/gm,
      classDeclaration: /^\s*class\s+\w+/gm,
      documentation: /\/\*\*[\s\S]*?\*\//gm
    },
    typescript: {
      functionDeclaration: /^\s*(async\s+)?function\s+\w+|^\s*\w+\s*=\s*(async\s+)?function|^\s*(public|private|protected)?(\s+static)?\s+\w+\s*\(/gm,
      classDeclaration: /^\s*(export\s+)?class\s+\w+/gm,
      documentation: /\/\*\*[\s\S]*?\*\//gm
    },
    python: {
      functionDeclaration: /^\s*def\s+\w+/gm,
      classDeclaration: /^\s*class\s+\w+/gm,
      documentation: /'''[\s\S]*?'''|"""|[\s\S]*?"""/gm
    }
  };

  /**
   * Clean code by removing empty lines according to specified rules
   * @param code The source code to clean
   * @param language The programming language of the code
   * @param options Cleaning options
   * @returns Cleaned code
   */
  public static clean(code: string, language: SupportedLanguage, options?: CleaningOptions): string {
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const lines = code.split('\n');
    const patterns = this.LANGUAGE_PATTERNS[language];

    if (!patterns) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Mark lines that should preserve spacing
    const preserveSpacingBefore = new Set<number>();
    if (finalOptions.preserveDocumentationSpacing) {
      this.markPreserveSpacing(code, patterns.documentation, preserveSpacingBefore);
    }
    if (finalOptions.preserveFunctionSpacing) {
      this.markPreserveSpacing(code, patterns.functionDeclaration, preserveSpacingBefore);
    }
    if (finalOptions.preserveClassSpacing) {
      this.markPreserveSpacing(code, patterns.classDeclaration, preserveSpacingBefore);
    }

    // Process empty lines
    const result: string[] = [];
    let consecutiveEmptyLines = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isEmpty = line.length === 0;

      if (isEmpty) {
        consecutiveEmptyLines++;
        if (preserveSpacingBefore.has(i + 1) ||
            consecutiveEmptyLines <= finalOptions.maxConsecutiveEmptyLines) {
          result.push('');
        }
      } else {
        consecutiveEmptyLines = 0;
        result.push(lines[i]);
      }
    }

    return result.join('\n');
  }

  /**
   * Process multiple code files in batch
   * @param files Array of {code: string, language: SupportedLanguage} objects
   * @param options Cleaning options
   * @returns Array of cleaned code strings
   */
  public static batchClean(
    files: Array<{ code: string; language: SupportedLanguage }>,
    options?: CleaningOptions
  ): string[] {
    return files.map(file => this.clean(file.code, file.language, options));
  }

  /**
   * Mark positions where spacing should be preserved
   * @param code Source code
   * @param pattern Regex pattern to match
   * @param preserveSet Set to store line numbers
   */
  private static markPreserveSpacing(code: string, pattern: RegExp, preserveSet: Set<number>): void {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const linesBefore = code.substring(0, match.index).split('\n').length;
      preserveSet.add(linesBefore);
    }
  }
}