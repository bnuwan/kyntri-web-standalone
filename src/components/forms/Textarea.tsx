import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses = `
      block w-full rounded-md border-0 py-1.5 px-3
      text-gray-900 shadow-sm ring-1 ring-inset 
      placeholder:text-gray-400 focus:ring-2 focus:ring-inset 
      sm:text-sm sm:leading-6 transition-colors resize-vertical
      ${error 
        ? 'ring-red-300 focus:ring-red-500' 
        : 'ring-gray-300 focus:ring-blue-600'
      }
      disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
    `.replace(/\s+/g, ' ').trim();

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${className}`}
        rows={3}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';