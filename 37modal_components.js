// components/common/Modal/Modal.jsx
import { forwardRef, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'

const Modal = forwardRef(({
  isOpen = false,
  onClose,
  children,
  size = 'md',
  centered = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
  backdropClassName = '',
  preventBodyScroll = true,
  ...props
}, ref) => {
  const modalRef = useRef()
  const previouslyFocusedElement = useRef()

  const getSizeClasses = () => {
    const sizes = {
      xs: 'max-w-md',
      sm: 'max-w-lg', 
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full mx-4'
    }
    return sizes[size] || sizes.md
  }

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && closeOnEsc) {
      onClose?.()
    }
  }

  const handleClose = () => {
    onClose?.()
  }

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement
      modalRef.current?.focus()
      
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      if (preventBodyScroll) {
        document.body.style.overflow = ''
      }
      
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }

    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, preventBodyScroll])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeOnEsc])

  if (!isOpen) return null

  const modal = (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${backdropClassName}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`flex min-h-screen items-center justify-center p-4 ${centered ? 'items-center' : 'items-start pt-16'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        
        <div
          ref={modalRef}
          className={`relative bg-white dark:bg-secondary-800 rounded-lg shadow-xl transform transition-all w-full ${getSizeClasses()} ${className}`}
          tabIndex={-1}
          {...props}
        >
          {showCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 z-10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
})

Modal.displayName = 'Modal'

// Modal Header Component
export const ModalHeader = forwardRef(({
  children,
  title,
  subtitle,
  divider = true,
  className = '',
  ...props
}, ref) => {
  const baseClasses = [
    'px-6 py-4',
    divider ? 'border-b border-secondary-200 dark:border-secondary-700' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {title && (
        <h2 id="modal-title" className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )
})

ModalHeader.displayName = 'ModalHeader'

// Modal Body Component
export const ModalBody = forwardRef(({
  children,
  padding = 'md',
  className = '',
  ...props
}, ref) => {
  const getPaddingClasses = () => {
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }
    return paddings[padding] || paddings.md
  }

  const baseClasses = [
    getPaddingClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {children}
    </div>
  )
})

ModalBody.displayName = 'ModalBody'

// Modal Footer Component  
export const ModalFooter = forwardRef(({
  children,
  divider = true,
  justify = 'end',
  className = '',
  ...props
}, ref) => {
  const getJustifyClasses = () => {
    const justifications = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between'
    }
    return justifications[justify] || justifications.end
  }

  const baseClasses = [
    'px-6 py-4 flex items-center space-x-3',
    getJustifyClasses(),
    divider ? 'border-t border-secondary-200 dark:border-secondary-700' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {children}
    </div>
  )
})

ModalFooter.displayName = 'ModalFooter'

// Confirm Dialog Component
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false,
  ...props
}) => {
  const getIcon = () => {
    const iconProps = { className: "w-6 h-6" }
    
    const icons = {
      warning: <AlertTriangle {...iconProps} className="w-6 h-6 text-warning-500" />,
      danger: <AlertCircle {...iconProps} className="w-6 h-6 text-error-500" />,
      success: <CheckCircle {...iconProps} className="w-6 h-6 text-success-500" />,
      info: <Info {...iconProps} className="w-6 h-6 text-primary-500" />
    }
    return icons[type] || icons.warning
  }

  const getConfirmButtonVariant = () => {
    const variants = {
      warning: 'warning',
      danger: 'error', 
      success: 'success',
      info: 'primary'
    }
    return variants[type] || 'warning'
  }

  const handleConfirm = () => {
    onConfirm?.()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xs"
      closeOnBackdropClick={!loading}
      closeOnEsc={!loading}
      {...props}
    >
      <ModalBody>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              {title}
            </h3>
            {message && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {message}
              </p>
            )}
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter justify="end">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            type === 'danger' 
              ? 'bg-error-600 hover:bg-error-700 focus:ring-error-500'
              : type === 'success'
              ? 'bg-success-600 hover:bg-success-700 focus:ring-success-500' 
              : type === 'warning'
              ? 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500'
              : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </div>
          ) : (
            confirmText
          )}
        </button>
      </ModalFooter>
    </Modal>
  )
}

export default Modal