
import React from 'react';

interface CheckboxGroupProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (value: string) => void;
  error?: string;
  name: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, options, selectedValues, onChange, error, name }) => {
  return (
    <fieldset className="mb-4">
      <legend className="block text-sm font-medium text-gray-700 mb-1">{label}</legend>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="checkbox"
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </fieldset>
  );
};

export default CheckboxGroup;
