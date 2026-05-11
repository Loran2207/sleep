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
  { id: 'practice', label: 'Breathing practice', glyph: 'breath', positive: true },
];

// Maps the structured diary answers onto the legacy factor IDs that
// the past-day card and journal entries already render as chips.
// Lives next to SLEEP_FACTORS so additions stay in one place.
export function factorsFromDiary(diary: Record<string, string | string[]>, extras?: { practiceDone?: boolean }): string[] {
  const result: string[] = [];

  const neg = (diary['factors'] as string[] | undefined) ?? [];
  const negMap: Record<string, string> = {
    'caffeine-late': 'coffee-late',
    'alcohol': 'alcohol',
    'late-dinner': 'late-dinner',
    'screens': 'screens',
    'stress': 'stress',
    'long-nap': 'long-nap',
  };
  for (const x of neg) if (negMap[x]) result.push(negMap[x]);

  const pos = (diary['helpers'] as string[] | undefined) ?? [];
  const posMap: Record<string, string> = {
    'sunlight': 'sunlight',
    'read': 'read',
  };
  for (const x of pos) if (posMap[x]) result.push(posMap[x]);

  const ex = diary['exercise-yesterday'];
  if (ex === 'light' || ex === 'intense') result.push('workout');

  if (extras?.practiceDone || pos.includes('wind-down')) result.push('practice');

  return Array.from(new Set(result));
}

export function lookupFactor(id: string): SleepFactor | undefined {
  return SLEEP_FACTORS.find((f) => f.id === id);
}
