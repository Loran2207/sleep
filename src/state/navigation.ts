import { useEffect, useSyncExternalStore } from 'react';
import type { ScreenId } from '../tokens';

type Listener = () => void;

let history: ScreenId[] = ['home'];
const listeners = new Set<Listener>();

function emit() { listeners.forEach((l) => l()); }
function subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l); }
function getSnapshot() { return history; }

export function useNavigation() {
  const stack = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    stack,
    screenId: stack[stack.length - 1],
    canBack: stack.length > 1,
  };
}

export function go(id: ScreenId) {
  if (history[history.length - 1] === id) return;
  history = [...history, id];
  emit();
}

export function back() {
  if (history.length <= 1) return;
  history = history.slice(0, -1);
  emit();
}

export function goHome() {
  history = ['home'];
  emit();
}

export function replace(id: ScreenId) {
  history = [...history.slice(0, -1), id];
  emit();
}

// Listen for browser back-button / Esc as a courtesy on desktop
export function useBrowserBack() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && history.length > 1) back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
