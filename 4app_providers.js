import { Provider } from 'react-redux'
import { store } from '../store'
import { ThemeProvider } from './ThemeProvider'
import { BreadcrumbProvider } from './BreadcrumbProvider'
import { PermissionProvider } from './PermissionProvider'
import { NotificationProvider } from './NotificationProvider'

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <PermissionProvider>
            <BreadcrumbProvider>
              {children}
            </BreadcrumbProvider>
          </PermissionProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default AppProviders