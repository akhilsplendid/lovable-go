import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

/**
 * Input Component
 * A versatile input component with icons, validation states, and various styles
 */
const Input = forwardRef(({
  type = 'text',
  placeholder,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  error,
  disabled = false,
  fullWidth = true,
  size = 'md',
  className,
  ...props
}, ref) => {
  const baseClasses = 'form-input block border border-gray-300 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const inputClasses = clsx(
    baseClasses,
    sizeClasses[size],
    {
      'w-full': fullWidth,
      'border-error-300 focus:ring-error-500 focus:border-error-300': error,
      'pl-10': LeftIcon,
      'pr-10': RightIcon,
    },
    className
  )

  const WrapperComponent = LeftIcon || RightIcon ? 'div' : React.Fragment
  const wrapperProps = LeftIcon || RightIcon ? { 
    className: clsx('relative', { 'w-full': fullWidth }) 
  } : {}

  return (
    <WrapperComponent {...wrapperProps}>
      {LeftIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <LeftIcon className={clsx(
            'w-5 h-5',
            error ? 'text-error-400' : 'text-gray-400 dark:text-gray-500'
          )} />
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      
      {RightIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <RightIcon className={clsx(
            'w-5 h-5',
            error ? 'text-error-400' : 'text-gray-400 dark:text-gray-500'
          )} />
        </div>
      )}
    </WrapperComponent>
  )
})

Input.displayName = 'Input'

/**
 * Textarea Component
 * A multiline text input component
 */
export const Textarea = forwardRef(({
  placeholder,
  error,
  disabled = false,
  fullWidth = true,
  rows = 4,
  resize = 'vertical',
  className,
  ...props
}, ref) => {
  const baseClasses = 'form-input block border border-gray-300 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }

  const textareaClasses = clsx(
    baseClasses,
    'px-3 py-2.5 text-sm',
    resizeClasses[resize],
    {
      'w-full': fullWidth,
      'border-error-300 focus:ring-error-500 focus:border-error-300': error,
    },
    className
  )

  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={textareaClasses}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${props.id}-error` : undefined}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'

/**
 * Select Component
 * A dropdown select component
 */
export const Select = forwardRef(({
  children,
  placeholder,
  error,
  disabled = false,
  fullWidth = true,
  size = 'md',
  className,
  ...props
}, ref) => {
  const baseClasses = 'form-input block border border-gray-300 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700'
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const selectClasses = clsx(
    baseClasses,
    sizeClasses[size],
    {
      'w-full': fullWidth,
      'border-error-300 focus:ring-error-500 focus:border-error-300': error,
    },
    className
  )

  return (
    <select
      ref={ref}
      disabled={disabled}
      className={selectClasses}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${props.id}-error` : undefined}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
})

Select.displayName = 'Select'

/**
 * Checkbox Component
 * A checkbox input component
 */
export const Checkbox = forwardRef(({
  label,
  description,
  error,
  disabled = false,
  className,
  ...props
}, ref) => {
  const checkboxClasses = clsx(
    'h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700',
    {
      'border-error-300 focus:ring-error-500': error,
    }
  )

  return (
    <div className={clsx('relative flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={checkboxClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : description ? `${props.id}-description` : undefined}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label htmlFor={props.id} className={clsx(
              'font-medium',
              disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300',
              error && 'text-error-600 dark:text-error-400'
            )}>
              {label}
            </label>
          )}
          {description && (
            <p 
              id={`${props.id}-description`}
              className={clsx(
                'text-gray-500 dark:text-gray-400',
                error && 'text-error-500 dark:text-error-400'
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

/**
 * Radio Component
 * A radio button input component
 */
export const Radio = forwardRef(({
  label,
  description,
  error,
  disabled = false,
  className,
  ...props
}, ref) => {
  const radioClasses = clsx(
    'h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700',
    {
      'border-error-300 focus:ring-error-500': error,
    }
  )

  return (
    <div className={clsx('relative flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="radio"
          disabled={disabled}
          className={radioClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : description ? `${props.id}-description` : undefined}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label htmlFor={props.id} className={clsx(
              'font-medium',
              disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300',
              error && 'text-error-600 dark:text-error-400'
            )}>
              {label}
            </label>
          )}
          {description && (
            <p 
              id={`${props.id}-description`}
              className={clsx(
                'text-gray-500 dark:text-gray-400',
                error && 'text-error-500 dark:text-error-400'
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Radio.displayName = 'Radio'

export default Input