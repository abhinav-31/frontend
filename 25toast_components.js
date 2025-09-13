import { toast, ToastContainer } from 'react-toastify'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import 'react-toastify/dist/ReactToastify.css'

const ToastContent = ({ type, title, message, action }) => {
  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0" }
    
    const icons = {
      success: <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-success-500" />,
      error: <XCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-error-500" />,
      warning: <AlertTriangle {...iconProps} className="w-5 h-5 flex-shrink-0 text-warning-500" />,
      info: <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-primary-500" />
    }
    return icons[type] || icons.info
  }

  return (
    <div className="flex items-start space-x-3">
      {getIcon()}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
            {title}
          </p>
        )}
        {message && (
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
            {message}
          </p>
        )}
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

const CustomCloseButton = ({ closeToast }) => (
  <button
    onClick={closeToast}
    className="text-secondary-400 hover:text-secondary-600 transition-colors p-1"
    aria-label="Close notification"
  >
    <X className="w-4 h-4" />
  </button>
)

export const showToast = {
  success: (title, message, options = {}) => {
    return toast.success(
      <ToastContent type="success" title={title} message={message} action={options.action} />,
      {
        className: 'border-l-4 border-success-500',
        ...options
      }
    )
  },
  
  error: (title, message, options = {}) => {
    return toast.error(
      <ToastContent type="error" title={title} message={message} action={options.action} />,
      {
        className: 'border-l-4 border-error-500',
        autoClose: false,
        ...options
      }
    )
  },
  
  warning: (title, message, options = {}) => {
    return toast.warning(
      <ToastContent type="warning" title={title} message={message} action={options.action} />,
      {
        className: 'border-l-4 border-warning-500',
        ...options
      }
    )
  },
  
  info: (title, message, options = {}) => {
    return toast.info(
      <ToastContent type="info" title={title} message={message} action={options.action} />,
      {
        className: 'border-l-4 border-primary-500',
        ...options
      }
    )
  }
}

export const ToastProvider = ({ children }) => (
  <>
    {children}
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      closeButton={CustomCloseButton}
      toastClassName="bg-white dark:bg-secondary-800 shadow-lg rounded-lg border border-secondary-200 dark:border-secondary-700"
      bodyClassName="text-secondary-900 dark:text-secondary-100 p-3"
      progressClassName="bg-primary-500"
    />
  </>
)