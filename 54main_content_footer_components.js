// components/layout/MainContent/MainContent.jsx
import { Breadcrumb } from '../../common/Navigation'
import { ContentHeader } from './ContentHeader'

const MainContent = ({
  children,
  breadcrumbs,
  className = '',
  ...props
}) => {
  const baseClasses = [
    'flex-1 flex flex-col overflow-hidden bg-secondary-50 dark:bg-secondary-900',
    className
  ].filter(Boolean).join(' ')

  return (
    <main className={baseClasses} {...props}>
      {/* Breadcrumb navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="h-full">
          {children}
        </div>
      </div>
    </main>
  )
}

export default MainContent

// components/layout/MainContent/ContentHeader.jsx
export const ContentHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className = '',
  ...props
}) => {
  return (
    <div className={`bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 ${className}`} {...props}>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="py-3 border-b border-secondary-200 dark:border-secondary-700">
            {breadcrumbs}
          </div>
        )}

        {/* Header content */}
        <div className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 sm:truncate">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                  {description}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// components/layout/Footer/Footer.jsx
const Footer = ({ className = '', ...props }) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className={`bg-white dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700 ${className}`}
      {...props}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          {/* Left side - Copyright */}
          <div className="flex items-center space-x-4">
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              © {currentYear} Staff Portal. All rights reserved.
            </p>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-4">
            <a
              href="/help"
              className="text-sm text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Help
            </a>
            <a
              href="/privacy"
              className="text-sm text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-sm text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer