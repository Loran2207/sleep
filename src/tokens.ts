// Dark wireframe palette. Skeleton, not visual design.
export const W = {
  ink: '#F5F5F7',
  line: '#F5F5F7',
  weak: '#8A8A92',
  veryweak: '#3A3A40',
  paper: '#1A1A1E',
  fill: '#26262C',
  fillDark: '#33333A',
  bg: '#0E0E11',
  font: '-apple-system, system-ui, "Helvetica Neue", sans-serif',
} as const;

export type ScreenId =
  | 'home'
  | 'track-mode'
  | 'track-nap'
  | 'track-night'
  | 'sounds'
  | 'place-device'
  | 'tracking-active'
  | 'tracking-mixer'
  | 'tracking-stop-confirm'
  | 'routine'
  | 'habit-library'
  | 'routine-checkin'
  | 'night-shift-guide'
  | 'sleep-schedule'
  | 'schedule-mix'
  | 'course'
  | 'lesson'
  | 'practice-intro'
  | 'practice-session'
  | 'practice-complete'
  | 'wind-down'
  | 'sounds-player'
  | 'wakeup-survey'
  | 'analytics'
  | 'journal'
  | 'journal-entry'
  | 'profile'
  | 'subscription'
  | 'quiz-intro'
  | 'quiz-session'
  | 'quiz-result';
