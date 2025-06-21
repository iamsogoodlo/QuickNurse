
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  containerClassName?: string;
  placeholder?: string;
  isRequired?: boolean; // New prop
  id: string; // Ensure id is always provided
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  id, 
  error, 
  options, 
  className = '', 
  containerClassName = '', 
  placeholder,
  isRequired,
  ...restProps 
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} bg-gray-50 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${className}`}
        defaultValue={placeholder && restProps.value === undefined ? "" : restProps.value}
        {...restProps}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Select;