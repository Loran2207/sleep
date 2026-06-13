import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
import { go, back, goHome, replace } from './state/navigation';
import { completeOnboarding, resetOnboarding } from './state/store';

// DEV-only capture hook: lets the Playwright capture harness skip
// onboarding and jump straight to any screen. Stripped from prod builds.
if ((import.meta as any).env?.DEV) {
  (window as any).__sleep = { go, back, goHome, replace, completeOnboarding, resetOnboarding };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
