import type { Day } from '../components/shared';

// Single source of truth for the prototype day-strip data. Both Home
// and Journal render the same days so switching between the two views
// feels continuous. "Yesterday" (the day right before todayIdx) is
// intentionally left empty so the user can see the "fill in" affordance
// — both screens fall back to a missed-day card when mood is null.
export const DAYS: Day[] = [
  { dow: 'M', n: 9, mood: 'good', sleep: '7h 12m' },
  { dow: 'T', n: 10, mood: 'meh', sleep: '6h 02m' },
  { dow: 'W', n: 11, mood: 'great', sleep: '7h 48m' },
  { dow: 'T', n: 12, mood: null, sleep: null },
  { dow: 'F', n: 13, mood: 'bad', sleep: '5h 41m' },
  { dow: 'S', n: 14, mood: 'great', sleep: '8h 12m' },
  { dow: 'S', n: 15, mood: 'good', sleep: '7h 30m' },
  { dow: 'M', n: 16, mood: 'meh', sleep: '6h 42m' },
  { dow: 'T', n: 17, mood: 'good', sleep: '7h 04m' },
  { dow: 'W', n: 18, mood: null, sleep: null },
  { dow: 'T', n: 19, mood: null, sleep: null },
  { dow: 'F', n: 20, mood: null, sleep: null },
  { dow: 'S', n: 21, mood: null, sleep: null },
  { dow: 'S', n: 22, mood: null, sleep: null },
];

export const TODAY_IDX = 10;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const dayToDate = (n: number) => `2026-02-${String(n).padStart(2, '0')}`;
export const dayLabel = (n: number) => `${MONTHS_SHORT[1]} ${n}`;

// Mock "today" used by the prototype so seeded entries and new actions
// share the same date. The day strip's TODAY_IDX maps to n = 19.
export const TODAY_DATE = dayToDate(DAYS[TODAY_IDX].n);
