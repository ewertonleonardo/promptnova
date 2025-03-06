import { CodeProcessor, ProcessingOptions } from '../CodeProcessor';
import { SupportedLanguage } from '../models/SupportedLanguage';

describe('CodeProcessor', () => {
  describe('process', () => {
    it('should process JavaScript code with default options', () => {
      const code = `// This is a comment
const x = 5; // inline comment
/* Multi-line
   comment */
/**
 * Doc comment
 */
function test() {
  return x;
}
`;
      
      const result = CodeProcessor.process(code, SupportedLanguage.JavaScript);
      
      // Should strip regular comments but preserve doc comments
      expect(result).not.toContain('// This is a comment');
      expect(result).not.toContain('// inline comment');
      expect(result).not.toContain('/* Multi-line\n   comment */');
      expect(result).toContain('/**\n * Doc comment\n */');
      expect(result).toContain('function test() {');
    });

    it('should process TypeScript code with custom options', () => {
      const code = `// TypeScript comment
interface Test {
  prop: string; // property comment
}

/**
 * Doc comment for class
 */
class TestClass implements Test {
  prop = '';
}
`;
      
      const options: ProcessingOptions = {
        stripComments: true,
        preserveDocComments: false,
        removeEmptyLines: true,
        trimWhitespace: true
      };
      
      const result = CodeProcessor.process(code, SupportedLanguage.TypeScript, options);
      
      // Should strip all comments including doc comments
      expect(result).not.toContain('// TypeScript comment');
      expect(result).not.toContain('// property comment');
      expect(result).not.toContain('/**\n * Doc comment for class\n */');
      
      // Should remove empty lines
      expect(result.split('\n').length).toBeLessThan(code.split('\n').length);
    });

    it('should process Python code correctly', () => {
      const code = `# Python comment
def test_function():
    # Indented comment
    return True

'''
Multi-line
Python comment
'''

"""
Python docstring
"""
class TestClass:
    pass
`;
      
      const result = CodeProcessor.process(code, SupportedLanguage.Python);
      
      // Should strip regular comments but preserve docstrings
      expect(result).not.toContain('# Python comment');
      expect(result).not.toContain('# Indented comment');
      expect(result).not.toContain("'''\nMulti-line\nPython comment\n'''");
      expect(result).toContain('"""\nPython docstring\n"""');
    });
  });

  describe('stripComments', () => {
    it('should throw error for unsupported language', () => {
      // Using any to bypass TypeScript type checking for this test
      expect(() => {
        // @ts-ignore - Intentionally passing invalid language
        CodeProcessor['stripComments']('code', 'unsupported' as any, true);
      }).toThrow('Unsupported language: unsupported');
    });
  });

  describe('removeEmptyLines', () => {
    it('should remove all empty lines', () => {
      const code = 'line1\n\n\nline2\n  \nline3';
      const result = CodeProcessor['removeEmptyLines'](code);
      expect(result).toBe('line1\nline2\nline3');
    });
  });

  describe('trimWhitespace', () => {
    it('should trim trailing whitespace while preserving indentation', () => {
      const code = '  line1  \n\tline2\t  \nline3   ';
      const result = CodeProcessor['trimWhitespace'](code);
      expect(result).toBe('  line1\n\tline2\nline3');
    });
  });
});