import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

/**
 * Spinner Component
 * A versatile loading spinner with multiple variants and sizes
 */
const Spinner = ({
  size = 'md',
  variant = 'default',
  color = 'primary',
  className,
  text,
  centered = false,
  overlay = false,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  }

  // Color classes
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }

  const spinnerElement = (() => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner size={size} color={color} className={className} {...props} />
      case 'pulse':
        return <PulseSpinner size={size} color={color} className={className} {...props} />
      case 'bars':
        return <BarsSpinner size={size} color={color} className={className} {...props} />
      case 'ring':
        return <RingSpinner size={size} color={color} className={className} {...props} />
      default:
        return (
          <Loader2 
            className={clsx(
              'animate-spin',
              sizeClasses[size],
              colorClasses[color],
              className
            )}
            {...props}
          />
        )
    }
  })()

  const content = (
    <div className={clsx(
      'flex items-center gap-3',
      {
        'justify-center': centered,
        'flex-col': text && centered
      }
    )}>
      {spinnerElement}
      {text && (
        <span className={clsx(
          'text-sm',
          colorClasses[color],
          centered ? 'text-center' : ''
        )}>
          {text}
        </span>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-center">
          {content}
        </div>
      </div>
    )
  }

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[100px]">
        {content}
      </div>
    )
  }

  return content
}

/**
 * Dots Spinner
 * Three bouncing dots animation
 */
const DotsSpinner = ({ size, color, className, ...props }) => {
  const sizeMap = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-6 h-6'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
    white: 'bg-white',
    gray: 'bg-gray-600'
  }

  const dotVariants = {
    start: { y: '0%' },
    end: { y: '100%' }
  }

  return (
    <div className={clsx('flex space-x-1', className)} {...props}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={clsx(
            'rounded-full',
            sizeMap[size],
            colorClasses[color]
          )}
          variants={dotVariants}
          initial="start"
          animate="end"
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )
}

/**
 * Pulse Spinner
 * Expanding circle animation
 */
const PulseSpinner = ({ size, color, className, ...props }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
    white: 'bg-white',
    gray: 'bg-gray-600'
  }

  return (
    <div className={clsx('relative', sizeClasses[size], className)} {...props}>
      {[0, 1].map((index) => (
        <motion.div
          key={index}
          className={clsx(
            'absolute inset-0 rounded-full opacity-75',
            colorClasses[color]
          )}
          animate={{
            scale: [0, 1],
            opacity: [1, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.5
          }}
        />
      ))}
    </div>
  )
}

/**
 * Bars Spinner
 * Animated bars
 */
const BarsSpinner = ({ size, color, className, ...props }) => {
  const heightMap = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
    white: 'bg-white',
    gray: 'bg-gray-600'
  }

  return (
    <div className={clsx('flex items-end space-x-1', className)} {...props}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={clsx(
            'w-1',
            heightMap[size],
            colorClasses[color]
          )}
          animate={{
            scaleY: [1, 0.3, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )
}

/**
 * Ring Spinner
 * Circular loading ring
 */
const RingSpinner = ({ size, color, className, ...props }) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-4',
    '2xl': 'w-16 h-16 border-4'
  }

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-secondary-600 border-t-transparent',
    success: 'border-success-600 border-t-transparent',
    warning: 'border-warning-600 border-t-transparent',
    error: 'border-error-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  }

  return (
    <div
      className={clsx(
        'animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    />
  )
}

/**
 * Loading Container
 * Wrapper component that shows spinner while content is loading
 */
export const LoadingContainer = ({
  loading = false,
  children,
  spinner,
  fallback,
  className,
  ...props
}) => {
  if (loading) {
    return (
      <div className={clsx('relative', className)} {...props}>
        {fallback || spinner || <Spinner centered />}
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Inline Spinner
 * Small spinner for inline loading states
 */
export const InlineSpinner = ({ className, ...props }) => (
  <Spinner
    size="sm"
    className={clsx('inline-block', className)}
    {...props}
  />
)

/**
 * Page Spinner
 * Full page loading spinner
 */
export const PageSpinner = ({ text = 'Loading...', ...props }) => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
    <Spinner
      size="xl"
      text={text}
      centered
      {...props}
    />
  </div>
)

/**
 * Button Spinner
 * Spinner specifically for button loading states
 */
export const ButtonSpinner = ({ className, ...props }) => (
  <Loader2 
    className={clsx('animate-spin w-4 h-4', className)}
    {...props}
  />
)

/**
 * Card Spinner
 * Spinner for card loading states
 */
export const CardSpinner = ({ className, ...props }) => (
  <div className={clsx('p-8', className)}>
    <Spinner centered {...props} />
  </div>
)

export default Spinner