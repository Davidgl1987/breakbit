import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { initInstallPrompt } from '@/services/pwa/install';
import { registerServiceWorker } from '@/services/pwa/serviceWorker';
import '@/ui/styles/global.css';

// Before rendering: the browser offers installing early.
initInstallPrompt();

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
