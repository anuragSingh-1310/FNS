import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler to catch module evaluation errors and display them
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="min-height: 100vh; background-color: #fafaf9; display: flex; align-items: center; justify-content: center; padding: 1rem; font-family: sans-serif;">
        <div style="background-color: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); max-width: 32rem; width: 100%; border: 1px solid #fee2e2;">
          <h2 style="font-size: 1.5rem; font-weight: bold; color: #dc2626; margin-bottom: 1rem;">Critical Application Error</h2>
          <p style="color: #57534e; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.875rem; word-break: break-word;">
            ${event.error?.message || event.message || 'Unknown error occurred during initialization.'}
          </p>
          <p style="color: #78716c; font-size: 0.875rem;">
            Please check the browser console for more details.
          </p>
        </div>
      </div>
    `;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
