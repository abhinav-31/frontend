import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Enable React 19 concurrent features
const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)