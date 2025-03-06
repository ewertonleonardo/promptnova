import { CodeCleaner, CleaningOptions } from '../CodeCleaner';
import { SupportedLanguage } from '../models/SupportedLanguage';

describe('CodeCleaner', () => {
  describe('clean', () => {
    it('should remove excessive empty lines while preserving spacing around functions', () => {
      const code = `
function test() {
  console.log('test');
}



function another() {
  return true;
}
`;
      const cleaned = CodeCleaner.clean(code, 'javascript');
      expect(cleaned).toBe(`
function test() {
  console.log('test');
}

function another() {
  return true;
}
`);
    });

    it('should preserve documentation spacing', () => {
      const code = `
/** 
 * Test function
 */


function test() {
  return true;
}
`;
      const cleaned = CodeCleaner.clean(code, 'javascript');
      expect(cleaned).toBe(`
/** 
 * Test function
 */

function test() {
  return true;
}
`);
    });

    it('should respect maxConsecutiveEmptyLines option', () => {
      const code = `
class Test {



  method() {}
}
`;
      const options: CleaningOptions = {
        maxConsecutiveEmptyLines: 1
      };
      const cleaned = CodeCleaner.clean(code, 'typescript', options);
      expect(cleaned).toBe(`
class Test {

  method() {}
}
`);
    });

    it('should handle different language patterns correctly', () => {
      const pythonCode = `
class TestClass:


    def test_method(self):
        pass


    def another_method(self):
        return True
`;
      const cleaned = CodeCleaner.clean(pythonCode, 'python');
      expect(cleaned).toBe(`
class TestClass:

    def test_method(self):
        pass

    def another_method(self):
        return True
`);
    });

    it('should throw error for unsupported language', () => {
      expect(() => {
        CodeCleaner.clean('code', 'unsupported' as SupportedLanguage);
      }).toThrow('Unsupported language: unsupported');
    });
  });

  describe('batchClean', () => {
    it('should process multiple files with the same options', () => {
      const files = [
        {
          code: 'function test() {\n\n\n}',
          language: 'javascript' as SupportedLanguage
        },
        {
          code: 'class Test {\n\n\n}',
          language: 'typescript' as SupportedLanguage
        }
      ];

      const options: CleaningOptions = {
        maxConsecutiveEmptyLines: 1
      };

      const cleaned = CodeCleaner.batchClean(files, options);
      expect(cleaned).toEqual([
        'function test() {\n\n}',
        'class Test {\n\n}'
      ]);
    });
  });
});