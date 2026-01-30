import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      containerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400 dark:text-gray-400">{leftIcon}</span>
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'block w-full px-4 py-2.5 rounded-lg transition-all duration-200',
              'bg-white dark:bg-slate-800/50',
              'border border-slate-300 dark:border-slate-700',
              'text-slate-900 dark:text-gray-100',
              'placeholder-slate-400 dark:placeholder-gray-500',
              'focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500',
              'hover:border-slate-400 dark:hover:border-slate-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-400 dark:text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
