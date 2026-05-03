// Entry helper: routes Track-sleep CTAs through the place-device prep
// screen unless the user has dismissed it ("Don't show again").
import { go } from './navigation';

export function startTracking() {
  let dismissed = false;
  try { dismissed = localStorage.getItem('place-device-dismissed') === '1'; } catch {}
  go(dismissed ? 'tracking-active' : 'place-device');
}
