import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/globals.css'
import './styles/ux-overrides.css'
import App from './App'
import { AuthProvider } from '@/context/auth-context'
import { Toaster } from '@/components/ui/toaster'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
