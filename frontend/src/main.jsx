import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router';
import { store } from './store/store.js';
import { Provider } from 'react-redux';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
       <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ToastProvider>
          <ErrorBoundary>
            <App />
            <CommandPalette />
          </ErrorBoundary>
        </ToastProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);