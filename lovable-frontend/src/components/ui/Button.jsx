import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

/**
 * Button Component
 * A versatile button component with multiple variants, sizes, and states
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loadingText,
  fullWidth = false,
  as: Component = 'button',
  className,
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'btn inline-flex items-center justify-center font-medium transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'bg-success-600 hover:bg-success-700 text-white shadow-sm hover:shadow-md',
    warning: 'bg-warning-600 hover:bg-warning-700 text-white shadow-sm hover:shadow-md'
  }
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'px-8 py-4 text-lg'
  }

  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-50': disabled || loading,
    },
    className
  )

  const isDisabled = disabled || loading

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  const buttonContent = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4 mr-2" />
      ) : null}
      
      <span>
        {loading && loadingText ? loadingText : children}
      </span>
      
      {!loading && RightIcon && (
        <RightIcon className="w-4 h-4 ml-2" />
      )}
    </>
  )

  if (Component === 'button') {
    return (
      <motion.button
        ref={ref}
        type="button"
        className={buttonClasses}
        disabled={isDisabled}
        onClick={handleClick}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        {...props}
      >
        {buttonContent}
      </motion.button>
    )
  }

  return (
    <motion.div
      ref={ref}
      as={Component}
      className={buttonClasses}
      onClick={handleClick}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {buttonContent}
    </motion.div>
  )
})

Button.displayName = 'Button'

/**
 * Button Group Component
 * Groups multiple buttons together with consistent styling
 */
export const ButtonGroup = ({ 
  children, 
  orientation = 'horizontal',
  className,
  ...props 
}) => {
  const groupClasses = clsx(
    'inline-flex',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
      'rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600': true
    },
    className
  )

  return (
    <div className={groupClasses} role="group" {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: clsx(
              child.props.className,
              orientation === 'horizontal' ? 'rounded-none border-0' : 'rounded-none border-0',
              index > 0 && orientation === 'horizontal' && 'border-l border-gray-300 dark:border-gray-600',
              index > 0 && orientation === 'vertical' && 'border-t border-gray-300 dark:border-gray-600'
            )
          })
        }
        return child
      })}
    </div>
  )
}

/**
 * Icon Button Component
 * A button specifically designed for icons
 */
export const IconButton = forwardRef(({
  icon: Icon,
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}, ref) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const buttonSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={clsx('!p-0 rounded-full', buttonSizes[size], className)}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  )
})

IconButton.displayName = 'IconButton'

/**
 * Link Button Component
 * A button that looks like a link
 */
export const LinkButton = forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={clsx(
      'p-0 h-auto font-normal text-primary-600 hover:text-primary-700 hover:underline hover:bg-transparent',
      className
    )}
    {...props}
  >
    {children}
  </Button>
))

LinkButton.displayName = 'LinkButton'

/**
 * Floating Action Button Component
 * A prominent circular button typically used for primary actions
 */
export const FloatingActionButton = forwardRef(({
  icon: Icon,
  className,
  size = 'md',
  ...props
}, ref) => {
  const fabSizes = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Button
      ref={ref}
      variant="primary"
      className={clsx(
        'rounded-full shadow-lg hover:shadow-xl fixed bottom-6 right-6 z-50',
        fabSizes[size],
        className
      )}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  )
})

FloatingActionButton.displayName = 'FloatingActionButton'

export default Button