import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AccessibilityProvider } from '@a11y-toolkit/core';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </StrictMode>,
);
