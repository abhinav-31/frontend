// components/common/Layout/Container/index.js
export { default as Container, PageContainer } from './Container'

// components/common/Layout/Grid/index.js
export { default as Grid, GridItem } from './Grid'

// components/common/Layout/Stack/index.js
export { HStack, VStack } from './HStack'

// components/common/Layout/Divider/index.js
export const Divider = ({ orientation = 'horizontal', className = '', ...props }) => {
  const orientationClasses = {
    horizontal: 'w-full h-px bg-secondary-200 dark:bg-secondary-700',
    vertical: 'h-full w-px bg-secondary-200 dark:bg-secondary-700'
  }
  
  return (
    <div 
      className={`${orientationClasses[orientation]} ${className}`} 
      role="separator"
      {...props} 
    />
  )
}

// components/common/Layout/index.js
export { Container, PageContainer } from './Container'
export { Grid, GridItem } from './Grid'
export { HStack, VStack } from './Stack'
export { Divider } from './Divider'

// components/common/Modal/index.js
export { default as Modal, ModalHeader, ModalBody, ModalFooter, ConfirmDialog } from './Modal'

// components/common/Navigation/Breadcrumb/index.js
export { default as Breadcrumb, BreadcrumbItem } from './Breadcrumb'

// components/common/Navigation/ContextualSelector/index.js
export { ContextualSelector } from './ContextualSelector'

// components/common/Navigation/Pagination/index.js
export { Pagination } from './Pagination'

// components/common/Navigation/Tabs/index.js
export const Tab = ({ children, isActive = false, onClick, disabled = false, className = '', ...props }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive 
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
        : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    aria-selected={isActive}
    role="tab"
    {...props}
  >
    {children}
  </button>
)

export const TabList = ({ children, className = '', ...props }) => (
  <div
    className={`flex space-x-1 border-b border-secondary-200 dark:border-secondary-700 ${className}`}
    role="tablist"
    {...props}
  >
    {children}
  </div>
)

export const TabPanel = ({ children, isActive = false, className = '', ...props }) => (
  <div
    className={`py-4 ${isActive ? 'block' : 'hidden'} ${className}`}
    role="tabpanel"
    {...props}
  >
    {children}
  </div>
)

export const TabPanels = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
)

// components/common/Navigation/index.js
export { Breadcrumb, BreadcrumbItem } from './Breadcrumb'
export { ContextualSelector } from './ContextualSelector'
export { Pagination } from './Pagination'
export { Tab, TabList, TabPanel, TabPanels } from './Tabs'

// components/common/Table/index.js
export { 
  default as Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableHeader, 
  TableCell, 
  TableActions 
} from './Table'

// components/common/SearchBar/index.js
export { default as SearchBar, SearchFilters } from './SearchBar'

// components/common/ErrorBoundary/index.js
export { default as ErrorBoundary, ErrorFallback } from './ErrorBoundary'

// components/common/index.js - Master Common Components Export
export * from './Button'
export * from './DataDisplay'
export * from './ErrorBoundary'
export * from './Feedback'
export * from './Form'
export * from './Layout'
export * from './Modal'
export * from './Navigation'
export * from './SearchBar'
export * from './Skeleton'
export * from './Table'