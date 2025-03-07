import React, { useState } from 'react';
import { ProcessingOptions as IProcessingOptions } from '../../../shared/CodeProcessor';
import { Switch } from '../ui/Switch';
import { Label } from '../ui/Label';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';

interface ProcessingOptionsProps {
  initialOptions?: IProcessingOptions;
  onChange: (options: IProcessingOptions) => void;
}

export const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  initialOptions,
  onChange,
}) => {
  const [options, setOptions] = useState<IProcessingOptions>({
    stripComments: true,
    preserveDocComments: true,
    removeEmptyLines: false,
    trimWhitespace: true,
    normalizeIndentation: false,
    maxLineLength: 0,
    minifyCode: false,
    ...initialOptions,
  });

  const handleOptionChange = (key: keyof IProcessingOptions, value?: any) => {
    const newOptions = {
      ...options,
      [key]: value !== undefined ? value : !options[key],
    };
    setOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Code Processing Options</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="stripComments">
            Strip Comments
            <p className="text-sm text-gray-500">Remove all code comments</p>
          </Label>
          <Switch
            id="stripComments"
            checked={options.stripComments}
            onCheckedChange={() => handleOptionChange('stripComments')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="preserveDocComments">
            Preserve Documentation
            <p className="text-sm text-gray-500">Keep documentation comments</p>
          </Label>
          <Switch
            id="preserveDocComments"
            checked={options.preserveDocComments}
            onCheckedChange={() => handleOptionChange('preserveDocComments')}
            disabled={!options.stripComments}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="removeEmptyLines">
            Remove Empty Lines
            <p className="text-sm text-gray-500">Remove all empty lines</p>
          </Label>
          <Switch
            id="removeEmptyLines"
            checked={options.removeEmptyLines}
            onCheckedChange={() => handleOptionChange('removeEmptyLines')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="trimWhitespace">
            Trim Whitespace
            <p className="text-sm text-gray-500">Remove leading/trailing whitespace</p>
          </Label>
          <Switch
            id="trimWhitespace"
            checked={options.trimWhitespace}
            onCheckedChange={() => handleOptionChange('trimWhitespace')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="normalizeIndentation">
            Normalize Indentation
            <p className="text-sm text-gray-500">Standardize code indentation</p>
          </Label>
          <Switch
            id="normalizeIndentation"
            checked={options.normalizeIndentation}
            onCheckedChange={() => handleOptionChange('normalizeIndentation')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="minifyCode">
            Minify Code
            <p className="text-sm text-gray-500">Compress code by removing whitespace</p>
          </Label>
          <Switch
            id="minifyCode"
            checked={options.minifyCode}
            onCheckedChange={() => handleOptionChange('minifyCode')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxLineLength">
            Max Line Length: {options.maxLineLength === 0 ? 'No limit' : options.maxLineLength}
            <p className="text-sm text-gray-500">Set maximum characters per line (0 = no limit)</p>
          </Label>
          <div className="flex items-center gap-2">
            <Slider
              id="maxLineLength"
              min={0}
              max={200}
              step={10}
              value={[options.maxLineLength || 0]}
              onValueChange={(value) => handleOptionChange('maxLineLength', value[0])}
              className="flex-grow"
            />
            <Input
              type="number"
              min={0}
              max={500}
              value={options.maxLineLength || 0}
              onChange={(e) => handleOptionChange('maxLineLength', parseInt(e.target.value) || 0)}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};