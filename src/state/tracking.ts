// Entry helper: routes Track-sleep CTAs through the place-device prep
// screen unless the user has dismissed it ("Don't show again").
import { go } from './navigation';

// When the wind-down "breathing" toggle is on, Continue runs the breathing
// flow first; this flag tells practice-complete to start tracking afterwards
// instead of returning to wind-down.
let breathThenTrack = false;

export function startTracking() {
  let dismissed = false;
  try { dismissed = localStorage.getItem('place-device-dismissed') === '1'; } catch {}
  go(dismissed ? 'tracking-active' : 'place-device');
}

export function startBreathingThenTrack() {
  breathThenTrack = true;
  go('practice-intro');
}

export function consumeBreathThenTrack(): boolean {
  const v = breathThenTrack;
  breathThenTrack = false;
  return v;
}
