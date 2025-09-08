import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, placeholder, ...props }, ref) => {
    const baseClasses = `
      block w-full rounded-md border-0 py-1.5 px-3
      text-gray-900 shadow-sm ring-1 ring-inset 
      focus:ring-2 focus:ring-inset 
      sm:text-sm sm:leading-6 transition-colors
      ${error 
        ? 'ring-red-300 focus:ring-red-500' 
        : 'ring-gray-300 focus:ring-blue-600'
      }
      disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
    `.replace(/\s+/g, ' ').trim();

    return (
      <select
        ref={ref}
        className={`${baseClasses} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';