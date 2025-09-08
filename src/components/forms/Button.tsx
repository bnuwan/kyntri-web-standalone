import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-md
      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
      transition-colors disabled:opacity-50 disabled:cursor-not-allowed
    `.replace(/\s+/g, ' ').trim();

    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-3 py-2 text-sm gap-2',
      lg: 'px-4 py-2.5 text-base gap-2.5'
    };

    const variantClasses = {
      primary: `
        bg-blue-600 text-white hover:bg-blue-500 
        focus-visible:outline-blue-600
        disabled:bg-blue-300
      `,
      secondary: `
        bg-gray-100 text-gray-900 hover:bg-gray-200
        focus-visible:outline-gray-600
        disabled:bg-gray-50
      `,
      danger: `
        bg-red-600 text-white hover:bg-red-500
        focus-visible:outline-red-600
        disabled:bg-red-300
      `,
      outline: `
        bg-white text-gray-700 ring-1 ring-inset ring-gray-300
        hover:bg-gray-50 focus-visible:outline-gray-600
        disabled:bg-gray-50 disabled:text-gray-400
      `
    };

    const classes = `
      ${baseClasses} 
      ${sizeClasses[size]} 
      ${variantClasses[variant]} 
      ${className}
    `.replace(/\s+/g, ' ').trim();

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';