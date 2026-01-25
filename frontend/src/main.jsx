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
    console.log('--- SYSTEM BOOT INIT ---');
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ErrorBoundary>
      </StrictMode>,
    )
    console.log('App Version: 3.1 - BOOT SUCCESS');
  } catch (error) {
    const errorMsg = `CRITICAL BOOT ERROR: ${error.stack || error.message}`;
    document.body.innerHTML = `<div style="color:red; padding:40px; font-family:monospace; background:white; position:fixed; inset:0; z-index:999999; overflow:auto;"><h1>SYSTEM FAILURE</h1><pre>${errorMsg}</pre></div>`;
    console.error(errorMsg);
  }
}

// Global debug handlers
window.onerror = function (message, source, lineno, colno, error) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:rgba(255,0,0,0.9);color:white;padding:10px;z-index:999999;font-family:monospace;font-size:12px;max-height:50vh;overflow:auto;';
  div.innerHTML = `<b>Runtime Error:</b> ${message}<br><small>${source}:${lineno}:${colno}</small><br><pre>${error?.stack || ''}</pre>`;
  document.body.appendChild(div);
  return false;
};

window.onunhandledrejection = function (event) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;background:rgba(0,0,0,0.8);color:orange;padding:10px;z-index:999999;font-family:monospace;font-size:12px;';
  div.innerHTML = `<b>Unhandled Promise Rejection:</b> ${event.reason}`;
  document.body.appendChild(div);
};


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
