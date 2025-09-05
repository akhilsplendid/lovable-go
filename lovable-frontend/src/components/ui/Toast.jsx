import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X,
  Loader2 
} from 'lucide-react'
import { clsx } from 'clsx'

/**
 * Toast Variants
 * Pre-configured toast variants with icons and colors
 */
export const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'notification-success border-l-4 border-l-success-500'
  },
  error: {
    icon: XCircle,
    className: 'notification-error border-l-4 border-l-error-500'
  },
  warning: {
    icon: AlertCircle,
    className: 'notification-warning border-l-4 border-l-warning-500'
  },
  info: {
    icon: Info,
    className: 'notification-info border-l-4 border-l-blue-500'
  },
  loading: {
    icon: Loader2,
    className: 'bg-white dark:bg-gray-800 border-l-4 border-l-primary-500'
  }
}

/**
 * Custom Toast Component
 * Enhanced toast with animations and custom styling
 */
const CustomToast = ({ 
  t, 
  message, 
  variant = 'info', 
  title, 
  action,
  persistent = false,
  onClose
}) => {
  const { icon: Icon, className } = toastVariants[variant]
  
  const handleDismiss = () => {
    toast.dismiss(t.id)
    onClose?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ 
        opacity: t.visible ? 1 : 0,
        y: t.visible ? 0 : 50,
        scale: t.visible ? 1 : 0.3
      }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden',
        className
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon 
              className={clsx(
                'h-6 w-6',
                variant === 'loading' && 'animate-spin',
                variant === 'success' && 'text-success-400',
                variant === 'error' && 'text-error-400',
                variant === 'warning' && 'text-warning-400',
                variant === 'info' && 'text-blue-400'
              )}
            />
          </div>
          
          <div className="ml-3 flex-1">
            {title && (
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {title}
              </p>
            )}
            <p className={clsx(
              'text-sm text-gray-500 dark:text-gray-400',
              title ? 'mt-1' : ''
            )}>
              {message}
            </p>
            
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!persistent && (
        <div className="flex border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={handleDismiss}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </motion.div>
  )
}

/**
 * Toast Service
 * Enhanced wrapper around react-hot-toast with custom variants
 */
export const showToast = {
  success: (message, options = {}) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        message={message} 
        variant="success" 
        {...options} 
      />
    ), {
      duration: 4000,
      ...options.toastOptions
    })
  },

  error: (message, options = {}) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        message={message} 
        variant="error" 
        {...options} 
      />
    ), {
      duration: 6000,
      ...options.toastOptions
    })
  },

  warning: (message, options = {}) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        message={message} 
        variant="warning" 
        {...options} 
      />
    ), {
      duration: 5000,
      ...options.toastOptions
    })
  },

  info: (message, options = {}) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        message={message} 
        variant="info" 
        {...options} 
      />
    ), {
      duration: 4000,
      ...options.toastOptions
    })
  },

  loading: (message, options = {}) => {
    return toast.custom((t) => (
      <CustomToast 
        t={t} 
        message={message} 
        variant="loading" 
        persistent 
        {...options} 
      />
    ), {
      duration: Infinity,
      ...options.toastOptions
    })
  },

  promise: async (promise, messages, options = {}) => {
    const loadingToast = showToast.loading(messages.loading || 'Loading...', options)
    
    try {
      const result = await promise
      toast.dismiss(loadingToast)
      showToast.success(messages.success || 'Success!', options)
      return result
    } catch (error) {
      toast.dismiss(loadingToast)
      showToast.error(messages.error || 'Something went wrong', options)
      throw error
    }
  },

  custom: (component, options = {}) => {
    return toast.custom(component, options)
  }
}

/**
 * Enhanced Toaster Component
 * Customized Toaster with better positioning and styling
 */
export const CustomToaster = ({
  position = 'top-right',
  reverseOrder = false,
  gutter = 8,
  containerClassName,
  toastOptions = {},
  ...props
}) => {
  const defaultToastOptions = {
    duration: 4000,
    style: {
      background: 'transparent',
      boxShadow: 'none',
      padding: 0,
      margin: 0,
    },
    className: 'toast-container',
    ...toastOptions
  }

  return (
    <Toaster
      position={position}
      reverseOrder={reverseOrder}
      gutter={gutter}
      containerClassName={clsx(
        'toast-container-wrapper',
        containerClassName
      )}
      toastOptions={defaultToastOptions}
      {...props}
    />
  )
}

/**
 * Notification Toast
 * Rich notification with avatar and actions
 */
export const NotificationToast = ({
  t,
  title,
  message,
  avatar,
  timestamp,
  actions = [],
  onDismiss,
  ...props
}) => {
  const handleDismiss = () => {
    toast.dismiss(t.id)
    onDismiss?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ 
        opacity: t.visible ? 1 : 0,
        x: t.visible ? 0 : 300
      }}
      transition={{ duration: 0.3 }}
      className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      {...props}
    >
      <div className="p-4">
        <div className="flex items-start">
          {avatar && (
            <div className="flex-shrink-0">
              <img 
                className="h-10 w-10 rounded-full" 
                src={avatar} 
                alt="" 
              />
            </div>
          )}
          
          <div className={clsx('flex-1', avatar ? 'ml-3' : '')}>
            <div className="flex items-center justify-between">
              {title && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {title}
                </p>
              )}
              
              {timestamp && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {timestamp}
                </p>
              )}
            </div>
            
            {message && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            )}
            
            {actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick?.()
                      if (action.dismiss !== false) {
                        handleDismiss()
                      }
                    }}
                    className={clsx(
                      'text-xs font-medium px-2 py-1 rounded',
                      action.variant === 'primary' 
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'text-primary-600 hover:text-primary-700'
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Progress Toast
 * Toast with progress indicator
 */
export const ProgressToast = ({
  t,
  message,
  progress = 0,
  onCancel,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: t.visible ? 1 : 0,
        y: t.visible ? 0 : 50
      }}
      transition={{ duration: 0.3 }}
      className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      {...props}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
          
          {onCancel && (
            <button
              onClick={() => {
                onCancel()
                toast.dismiss(t.id)
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Re-export toast functions for backward compatibility
export { toast }
export default showToast