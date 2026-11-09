import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppSettingsProvider } from './contexts/AppSettingsContext.tsx'
import { fitDesktopWindowToMobile } from './desktopWindow'

fitDesktopWindowToMobile()
// Certains navigateurs ignorent le redimensionnement tant que la fenêtre n'est pas affichée.
window.addEventListener('load', fitDesktopWindowToMobile, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSettingsProvider>
      <App />
    </AppSettingsProvider>
  </StrictMode>,
)
