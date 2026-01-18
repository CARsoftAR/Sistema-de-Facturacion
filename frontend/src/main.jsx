import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Sidebar from './components/Sidebar.jsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

// Scenario 1: Full SPA App (e.g., Home Page)
const rootElement = document.getElementById('root')
if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ErrorBoundary>
      </StrictMode>,
    )
    console.log('App Version: 2.9 - FORCE REFRESH HASH ' + Date.now());
  } catch (error) {
    document.body.innerHTML = `<div style="color:red; padding:20px; font-size:24px;"><h1>CRITICAL ERROR</h1><pre>${error.message}</pre></div>`;
    console.error("Critical Boot Error:", error);
  }
}

// Scenario 2: Sidebar Only (Legacy Django Pages)
// Necesita BrowserRouter para que useNavigate funcione
const sidebarElement = document.getElementById('sidebar-root')
if (sidebarElement) {
  createRoot(sidebarElement).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <Sidebar standalone={true} />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}
