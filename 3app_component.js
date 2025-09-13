import { AppProviders } from './providers'
import { AppRoutes } from './routes'
import { ErrorBoundary } from './components/common'

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
          <AppRoutes />
        </div>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App