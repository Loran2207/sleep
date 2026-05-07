import type { HabitGlyphName } from '../state/store';

export type SleepFactor = {
  id: string;
  label: string;
  glyph: HabitGlyphName;
  // Whether having the factor tends to hurt sleep (positive = good for sleep).
  positive?: boolean;
};

// Curated list of factors that empirically correlate with sleep quality.
// Toggled in the wake-up survey and shown as chips on past-day cards.
export const SLEEP_FACTORS: SleepFactor[] = [
  { id: 'coffee-late', label: 'Caffeine late', glyph: 'cup' },
  { id: 'alcohol', label: 'Alcohol', glyph: 'drop' },
  { id: 'late-dinner', label: 'Late dinner', glyph: 'fork' },
  { id: 'screens', label: 'Screens before bed', glyph: 'phone' },
  { id: 'stress', label: 'Stressful day', glyph: 'sparkle' },
  { id: 'long-nap', label: 'Long nap', glyph: 'breath' },
  { id: 'workout', label: 'Workout', glyph: 'walk', positive: true },
  { id: 'sunlight', label: 'Morning sunlight', glyph: 'sun', positive: true },
  { id: 'read', label: 'Read before bed', glyph: 'book', positive: true },
];

export function lookupFactor(id: string): SleepFactor | undefined {
  return SLEEP_FACTORS.find((f) => f.id === id);
}
