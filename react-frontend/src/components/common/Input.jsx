import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * 通用输入框组件
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'medium',
  variant = 'default',
  className,
  containerClassName,
  labelClassName,
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const baseClasses = 'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-5 py-3 text-lg',
  };
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-transparent bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500',
    underlined: 'border-0 border-b-2 border-gray-300 rounded-none focus:border-blue-500 focus:ring-0 px-0',
  };
  
  const errorClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : '';
  
  const disabledClasses = disabled 
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
    : '';

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label className={clsx(
          'block text-sm font-medium text-gray-700 mb-1',
          disabled && 'text-gray-500',
          labelClassName
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={clsx(
              'text-gray-400',
              iconSizeClasses[size],
              error && 'text-red-500'
            )}>
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          className={clsx(
            baseClasses,
            sizeClasses[size],
            variantClasses[variant],
            errorClasses,
            disabledClasses,
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={clsx(
              'text-gray-400',
              iconSizeClasses[size],
              error && 'text-red-500'
            )}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={clsx(
          'mt-1 text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;