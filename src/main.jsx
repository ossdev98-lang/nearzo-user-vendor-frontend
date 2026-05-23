import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { AppProvider } from './context/AppContext'
import 'virtual:pwa-register'

window.deferredPwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPwaPrompt = e;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg)',
            color: 'var(--text-dark)',
            borderRadius: '16px',
            padding: '14px 20px',
            boxShadow: 'var(--glass-shadow)',
            border: '1px solid var(--border)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-primary, #6C4CF1)',
              secondary: 'var(--bg, #fff)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error, #EF4444)',
              secondary: 'var(--bg, #fff)',
            },
          },
        }}
      />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
)