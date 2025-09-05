import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import Button, { IconButton } from './Button'

/**
 * Modal Component
 * A flexible modal dialog with animations and accessibility features
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventBodyScroll = true,
  className,
  overlayClassName,
  contentClassName,
  ...props
}) => {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Size variants
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  }

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, isOpen, onClose])

  // Handle body scroll lock
  useEffect(() => {
    if (!preventBodyScroll || !isOpen) return

    const originalStyle = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [preventBodyScroll, isOpen])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      
      // Focus modal after opening
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)
    } else if (previousFocusRef.current) {
      // Return focus to previous element
      previousFocusRef.current.focus()
    }
  }, [isOpen])

  // Handle overlay click
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.()
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: -20 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  }

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      x: '100%',
      transition: {
        duration: 0.3
      }
    }
  }

  const variants = variant === 'drawer' ? drawerVariants : modalVariants

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className={clsx(
            'flex items-center justify-center min-h-full p-4',
            variant === 'drawer' ? 'justify-end p-0' : '',
            overlayClassName
          )}
        >
          <motion.div
            className={clsx(
              'fixed inset-0 bg-black',
              variant === 'drawer' ? 'bg-opacity-25' : 'bg-opacity-50'
            )}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
          />

          <motion.div
            ref={modalRef}
            className={clsx(
              'relative bg-white dark:bg-gray-800 rounded-lg shadow-xl',
              variant === 'drawer' 
                ? 'h-full w-full max-w-md rounded-none' 
                : sizeClasses[size],
              'focus:outline-none',
              className
            )}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            tabIndex={-1}
            {...props}
          >
            <div className={clsx(
              'p-6',
              variant === 'drawer' ? 'h-full flex flex-col' : '',
              contentClassName
            )}>
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between mb-4">
                  {title && (
                    <h2 
                      id="modal-title"
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {title}
                    </h2>
                  )}
                  
                  {showCloseButton && (
                    <IconButton
                      icon={X}
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      aria-label="Close modal"
                      className="ml-auto -mr-2"
                    />
                  )}
                </div>
              )}

              {/* Content */}
              <div className={clsx(
                variant === 'drawer' ? 'flex-1 overflow-y-auto' : ''
              )}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

/**
 * Confirmation Modal Component
 * Pre-configured modal for confirmation dialogs
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  ...props
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

/**
 * Alert Modal Component
 * Pre-configured modal for alerts
 */
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  type = 'info',
  buttonText = 'OK',
  ...props
}) => {
  const typeClasses = {
    info: 'text-blue-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="mb-6">
        <p className={clsx('font-medium', typeClasses[type])}>
          {message}
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>
          {buttonText}
        </Button>
      </div>
    </Modal>
  )
}

/**
 * Loading Modal Component
 * Modal with loading state
 */
export const LoadingModal = ({
  isOpen,
  message = 'Loading...',
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      size="sm"
      {...props}
    >
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </Modal>
  )
}

/**
 * Form Modal Component
 * Modal specifically for forms with form actions
 */
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      {...props}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          {children}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={submitDisabled || isSubmitting}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/**
 * Image Modal Component
 * Modal for displaying images
 */
export const ImageModal = ({
  isOpen,
  onClose,
  src,
  alt,
  title,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="2xl"
      className="p-0 overflow-hidden"
      {...props}
    >
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[80vh] object-contain"
        />
        
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default Modal