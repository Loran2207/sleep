// Lightweight shared stores — replaces window-globals from the prototype.
import { useSyncExternalStore } from 'react';

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next: T | ((prev: T) => T)) => {
      state = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  };
}

// ─── SLEEP MODE (sleep vs quick nap) ─────────────────────────────
// In production this would be picked automatically from the time of day —
// during waking hours only "nap" is offered. The toggle on Wind down lets
// testers flip between the two without waiting for the clock.
export type SleepMode = 'sleep' | 'nap';
const sleepModeStore = createStore<SleepMode>('sleep');
export function useSleepMode(): [SleepMode, (m: SleepMode) => void] {
  const v = useSyncExternalStore(sleepModeStore.subscribe, sleepModeStore.get, sleepModeStore.get);
  return [v, sleepModeStore.set];
}

const napDurationStore = createStore<number>(30);
export function useNapDuration(): [number, (n: number) => void] {
  const v = useSyncExternalStore(napDurationStore.subscribe, napDurationStore.get, napDurationStore.get);
  return [v, napDurationStore.set];
}

// ─── WIND-DOWN STATE ────────────────────────────────────────────
// Current step (1 = routine / breathing, 2 = sounds + timer) and a
// flag the practice flow flips on completion. Both reset when the
// user taps "Go to sleep" from Home, so each evening starts fresh.
const windDownStepStore = createStore<1 | 2>(1);
export function useWindDownStep(): [1 | 2, (s: 1 | 2) => void] {
  const v = useSyncExternalStore(windDownStepStore.subscribe, windDownStepStore.get, windDownStepStore.get);
  return [v, windDownStepStore.set];
}

const practiceDoneStore = createStore<boolean>(false);
export function usePracticeDone(): [boolean, (v: boolean) => void] {
  const v = useSyncExternalStore(practiceDoneStore.subscribe, practiceDoneStore.get, practiceDoneStore.get);
  return [v, practiceDoneStore.set];
}

// ─── NIGHT SHIFT ENABLED FLAG (Home card) ───────────────────────
const nightShiftStore = createStore<boolean>(false);
export function useNightShiftDone(): [boolean, (v: boolean) => void] {
  const v = useSyncExternalStore(nightShiftStore.subscribe, nightShiftStore.get, nightShiftStore.get);
  return [v, nightShiftStore.set];
}

// ─── PROFILE PREFS ──────────────────────────────────────────────
// Target hours of sleep — shown on Profile, used as guidance when
// editing schedules.
const sleepGoalStore = createStore<number>(8);
export function useSleepGoal(): [number, (v: number) => void] {
  const v = useSyncExternalStore(sleepGoalStore.subscribe, sleepGoalStore.get, sleepGoalStore.get);
  return [v, sleepGoalStore.set];
}

// Mock language preference. The picker on Profile rotates this value
// but doesn't actually localise the UI yet.
const languageStore = createStore<string>('English');
export function useLanguage(): [string, (v: string) => void] {
  const v = useSyncExternalStore(languageStore.subscribe, languageStore.get, languageStore.get);
  return [v, languageStore.set];
}

// Notifications preference (mock toggle on Profile).
const notificationsStore = createStore<boolean>(true);
export function useNotifications(): [boolean, (v: boolean) => void] {
  const v = useSyncExternalStore(notificationsStore.subscribe, notificationsStore.get, notificationsStore.get);
  return [v, notificationsStore.set];
}

// Mock subscription state. Manage screen flips active / billing period.
export type BillingPeriod = 'monthly' | 'yearly';
export type Subscription = {
  active: boolean;
  period: BillingPeriod;
  renewsOn: string; // YYYY-MM-DD
};
const subscriptionStore = createStore<Subscription>({
  active: false,
  period: 'yearly',
  renewsOn: '2027-05-14',
});
export function useSubscription(): [Subscription, (patch: Partial<Subscription>) => void] {
  const v = useSyncExternalStore(subscriptionStore.subscribe, subscriptionStore.get, subscriptionStore.get);
  const update = (patch: Partial<Subscription>) => subscriptionStore.set({ ...subscriptionStore.get(), ...patch });
  return [v, update];
}

// ─── HABITS ──────────────────────────────────────────────────────
import type { ScreenId } from '../tokens';

export type HabitGlyphName =
  | 'tea' | 'book' | 'shower' | 'bulb' | 'phone' | 'breath'
  | 'sparkle' | 'leaf' | 'pen' | 'walk' | 'sun' | 'drop' | 'cup' | 'fork';

export type Habit = {
  id: string;
  glyph: HabitGlyphName;
  title: string;
  desc?: string;
  linkTo?: ScreenId;
  done: boolean;
};

const habitsStore = createStore<Habit[]>([
  { id: 'h-breath', glyph: 'breath', title: 'Breathe yourself to sleep', desc: '4-7-8, 5 min', linkTo: 'practice-intro', done: false },
  { id: 'h-read', glyph: 'book', title: 'Read for 15 min or more', done: false },
  { id: 'h-tea', glyph: 'tea', title: 'Have a cup of herbal tea', done: true },
]);

export function useHabits(): [Habit[], (next: Habit[] | ((prev: Habit[]) => Habit[])) => void] {
  const list = useSyncExternalStore(habitsStore.subscribe, habitsStore.get, habitsStore.get);
  return [list, habitsStore.set];
}

// User-created habits available to add. Distinct from `useHabits` (the daily
// list) — these are recipes that can be added to the daily list multiple times.
export type CustomHabit = { id: string; glyph: HabitGlyphName; title: string };

const customLibStore = createStore<CustomHabit[]>([]);

export function useCustomLibrary() {
  const list = useSyncExternalStore(customLibStore.subscribe, customLibStore.get, customLibStore.get);
  return {
    list,
    add: (h: Omit<CustomHabit, 'id'>) =>
      customLibStore.set((prev) => [...prev, { ...h, id: `c-${Date.now()}` }]),
    remove: (id: string) =>
      customLibStore.set((prev) => prev.filter((x) => x.id !== id)),
  };
}

// ─── SLEEP DRAFT (track-nap / track-night setup) ─────────────────
export type SleepDraft = {
  kind: 'nap' | 'night' | null;
  napMinutes: number;
  wakeHour: number;
  wakeMinute: number;
  sounds: string[];
};

const draftStore = createStore<SleepDraft>({
  kind: null,
  napMinutes: 30,
  wakeHour: 7,
  wakeMinute: 0,
  sounds: ['Soft chimes'],
});

export function useDraft(): [SleepDraft, (patch: Partial<SleepDraft>) => void] {
  const s = useSyncExternalStore(draftStore.subscribe, draftStore.get, draftStore.get);
  return [s, (patch) => draftStore.set((prev) => ({ ...prev, ...patch }))];
}

// ─── JOURNAL ENTRIES ─────────────────────────────────────────────
export type JournalEntry = {
  id: string;
  // 2D mood — x ∈ [0,1] (sad → happy), y ∈ [0,1] (low → high energy)
  moodX: number;
  moodY: number;
  // Stored alongside the position so edits persist exactly even if the
  // mood-name table later drifts. Recomputed on every position change.
  feeling: string;
  feelingDesc: string;
  legacyMood: 'great' | 'good' | 'meh' | 'bad' | 'awful';
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM
  whenLabel: string;     // "Today, 09:12" / "17 December, 23:12"
  // Optional sleep-session times — when the user actually went to bed
  // and woke up. Used when filling in a missed day.
  bedTime?: string;      // HH:MM
  wakeTime?: string;     // HH:MM
  text: string;
  context: string[];     // legacy free-text tags
  factors: string[];     // sleep factors from the wake-up survey
  diary: Record<string, string | string[]>; // structured sleep-diary answers
};

const journalStore = createStore<JournalEntry[]>([
  // Today (Thu Feb 19) — already filled in.
  {
    id: 'j-1', moodX: 0.85, moodY: 0.55, feeling: 'Happy', feelingDesc: 'Light and clear',
    legacyMood: 'great', date: '2026-02-19', time: '09:12', whenLabel: 'Today, 09:12',
    bedTime: '23:05', wakeTime: '07:02',
    text: 'Took a morning stroll through Central Park. The air was so fresh and the sun felt amazing. Total connection with nature. Perfect way to start the day, feeling super recharged and ready for anything.',
    context: ['outdoors', 'exercise'],
    factors: ['sunlight', 'workout'],
    diary: {},
  },
  // Tue Feb 17 — solid sleep, good mood.
  {
    id: 'j-feb17', moodX: 0.7, moodY: 0.4, feeling: 'Calm', feelingDesc: 'At ease',
    legacyMood: 'good', date: '2026-02-17', time: '07:04', whenLabel: 'Feb 17, 07:04',
    bedTime: '23:00', wakeTime: '07:04',
    text: 'Better night. Cut caffeine after lunch and it actually paid off — fell asleep within twenty minutes and slept through.',
    context: [],
    factors: ['sunlight', 'workout'],
    diary: {},
  },
  // Mon Feb 16 — short night, average mood.
  {
    id: 'j-feb16', moodX: 0.5, moodY: 0.45, feeling: 'Neutral', feelingDesc: 'Just here',
    legacyMood: 'meh', date: '2026-02-16', time: '07:18', whenLabel: 'Feb 16, 07:18',
    bedTime: '00:00', wakeTime: '07:18',
    text: 'Monday is rough. Doom-scrolled too long, bed too late, woke up groggy.',
    context: [],
    factors: ['screens'],
    diary: {},
  },
  // Sun Feb 15 — good Sunday vibes.
  {
    id: 'j-feb15', moodX: 0.7, moodY: 0.4, feeling: 'Calm', feelingDesc: 'At ease',
    legacyMood: 'good', date: '2026-02-15', time: '07:00', whenLabel: 'Feb 15, 07:00',
    bedTime: '23:30', wakeTime: '07:00',
    text: 'Slept solid. Sunday vibes — read for half an hour before lights out and drifted off easily.',
    context: [],
    factors: ['read'],
    diary: {},
  },
  // Sat Feb 14 — great night.
  {
    id: 'j-feb14', moodX: 0.85, moodY: 0.55, feeling: 'Happy', feelingDesc: 'Light and clear',
    legacyMood: 'great', date: '2026-02-14', time: '07:18', whenLabel: 'Feb 14, 07:18',
    bedTime: '23:10', wakeTime: '07:18',
    text: 'Saturday morning, slept in a bit and woke up naturally. Felt great.',
    context: [],
    factors: ['sunlight'],
    diary: {},
  },
  // Fri Feb 13 — bad night.
  {
    id: 'j-feb13', moodX: 0.3, moodY: 0.7, feeling: 'Anxious', feelingDesc: 'Worried',
    legacyMood: 'bad', date: '2026-02-13', time: '06:40', whenLabel: 'Feb 13, 06:40',
    bedTime: '23:35', wakeTime: '06:40',
    text: "Couldn't fall asleep — mind racing about Monday. Tossed and turned for over an hour after lights out.",
    context: [],
    factors: ['coffee-late', 'stress', 'late-dinner'],
    diary: {},
  },
  // Wed Feb 11 — great night.
  {
    id: 'j-feb11', moodX: 0.85, moodY: 0.55, feeling: 'Happy', feelingDesc: 'Light and clear',
    legacyMood: 'great', date: '2026-02-11', time: '07:02', whenLabel: 'Feb 11, 07:02',
    bedTime: '22:48', wakeTime: '07:02',
    text: 'Excellent night. Woke up before the alarm feeling really refreshed and ready to go.',
    context: [],
    factors: ['sunlight', 'workout'],
    diary: {},
  },
  // Tue Feb 10 — meh.
  {
    id: 'j-feb10', moodX: 0.5, moodY: 0.45, feeling: 'Neutral', feelingDesc: 'Just here',
    legacyMood: 'meh', date: '2026-02-10', time: '07:18', whenLabel: 'Feb 10, 07:18',
    bedTime: '00:12', wakeTime: '07:18',
    text: 'Late to bed, average sleep. Feeling a bit tired this morning.',
    context: [],
    factors: ['screens', 'late-dinner'],
    diary: {},
  },
  // Mon Feb 9 — good.
  {
    id: 'j-feb09', moodX: 0.7, moodY: 0.4, feeling: 'Calm', feelingDesc: 'At ease',
    legacyMood: 'good', date: '2026-02-09', time: '06:56', whenLabel: 'Feb 9, 06:56',
    bedTime: '23:14', wakeTime: '06:56',
    text: 'Slept solid 7h+. Mind was quiet, body felt rested in the morning.',
    context: [],
    factors: ['sunlight', 'read'],
    diary: {},
  },
]);

export function useJournal() {
  const list = useSyncExternalStore(journalStore.subscribe, journalStore.get, journalStore.get);
  return {
    list,
    update: (id: string, patch: Partial<JournalEntry>) =>
      journalStore.set((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e)),
    add: (entry: Omit<JournalEntry, 'id'>): JournalEntry => {
      const next: JournalEntry = { ...entry, id: `j-${Date.now()}` };
      journalStore.set((prev) => [next, ...prev]);
      return next;
    },
    remove: (id: string) =>
      journalStore.set((prev) => prev.filter((e) => e.id !== id)),
  };
}

const editingJournalStore = createStore<string | null>(null);
export function useEditingJournalId(): [string | null, (id: string | null) => void] {
  const v = useSyncExternalStore(editingJournalStore.subscribe, editingJournalStore.get, editingJournalStore.get);
  return [v, editingJournalStore.set];
}

// ─── COURSE: currently viewed lesson ─────────────────────────────
const currentLessonStore = createStore<number>(3);
export function useCurrentLesson(): [number, (n: number) => void] {
  const v = useSyncExternalStore(currentLessonStore.subscribe, currentLessonStore.get, currentLessonStore.get);
  return [v, currentLessonStore.set];
}

// ─── PRACTICE CYCLES ─────────────────────────────────────────────
const practiceCyclesStore = createStore<number>(8);
export function usePracticeCycles(): [number, (n: number) => void] {
  const v = useSyncExternalStore(practiceCyclesStore.subscribe, practiceCyclesStore.get, practiceCyclesStore.get);
  return [v, practiceCyclesStore.set];
}

// ─── SOUND MIX (active tracking) ─────────────────────────────────
export type MixSound = { id: string; vol: number };
export type MixState = { mix: MixSound[]; playing: boolean; alarm: string; timerMin: number | null };

const mixStore = createStore<MixState>({
  mix: [
    { id: 'rain', vol: 0.65 },
    { id: 'campfire', vol: 0.45 },
    { id: 'flute', vol: 0.55 },
  ],
  playing: true,
  alarm: '07:00',
  timerMin: null,
});

export function useMix() {
  const state = useSyncExternalStore(mixStore.subscribe, mixStore.get, mixStore.get);
  return {
    state,
    setVol: (id: string, vol: number) =>
      mixStore.set((p) => ({ ...p, mix: p.mix.map((s) => s.id === id ? { ...s, vol } : s) })),
    removeSound: (id: string) =>
      mixStore.set((p) => ({ ...p, mix: p.mix.filter((s) => s.id !== id) })),
    addSound: (id: string) =>
      mixStore.set((p) => p.mix.some((s) => s.id === id) ? p : { ...p, mix: [...p.mix, { id, vol: 0.55 }] }),
    toggleSound: (id: string) =>
      mixStore.set((p) => p.mix.some((s) => s.id === id)
        ? { ...p, mix: p.mix.filter((s) => s.id !== id) }
        : { ...p, mix: [...p.mix, { id, vol: 0.55 }] }),
    clearAll: () => mixStore.set((p) => ({ ...p, mix: [] })),
    togglePlay: () => mixStore.set((p) => ({ ...p, playing: !p.playing })),
    setTimer: (min: number | null) => mixStore.set((p) => ({ ...p, timerMin: min })),
    setAlarm: (alarm: string) => mixStore.set((p) => ({ ...p, alarm })),
  };
}

// ─── SLEEP SCHEDULES (Weekdays / Weekends on Home) ───────────────
export type Schedule = {
  id: string;
  name: string;
  days: number[];          // 0=Sun … 6=Sat
  bedHour: number;
  bedMinute: number;
  wakeHour: number;
  wakeMinute: number;
  sounds: MixSound[];      // sounds that play while falling asleep
  timerMin: number | null; // how long the sounds stay on, null = until alarm
};

const schedulesStore = createStore<Schedule[]>([
  { id: 'weekdays', name: 'Weekdays', days: [1, 2, 3, 4, 5], bedHour: 22, bedMinute: 30, wakeHour: 6, wakeMinute: 30, sounds: [{ id: 'rain', vol: 0.65 }, { id: 'chimes', vol: 0.45 }], timerMin: 30 },
  { id: 'weekends', name: 'Weekends', days: [0, 6], bedHour: 0, bedMinute: 0, wakeHour: 8, wakeMinute: 30, sounds: [{ id: 'chimes', vol: 0.55 }], timerMin: null },
]);

export function useSchedules() {
  const list = useSyncExternalStore(schedulesStore.subscribe, schedulesStore.get, schedulesStore.get);
  return {
    list,
    update: (id: string, patch: Partial<Schedule>) =>
      schedulesStore.set((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s)),
  };
}

// Which schedule the mixer / sounds-catalog screens are currently editing.
const editingScheduleStore = createStore<string | null>(null);
export function useEditingScheduleId(): [string | null, (id: string | null) => void] {
  const v = useSyncExternalStore(editingScheduleStore.subscribe, editingScheduleStore.get, editingScheduleStore.get);
  return [v, editingScheduleStore.set];
}

// Same shape as `useMix`, but bound to the schedule currently being edited.
// Returns `null` for `schedule` if nothing is being edited.
export function useScheduleMix() {
  const id = useSyncExternalStore(editingScheduleStore.subscribe, editingScheduleStore.get, editingScheduleStore.get);
  const list = useSyncExternalStore(schedulesStore.subscribe, schedulesStore.get, schedulesStore.get);
  const schedule = id ? list.find((s) => s.id === id) ?? null : null;
  const mutate = (fn: (s: Schedule) => Schedule) =>
    schedulesStore.set((prev) => prev.map((s) => s.id === id ? fn(s) : s));
  return {
    schedule,
    mix: schedule?.sounds ?? [],
    setVol: (sid: string, vol: number) =>
      mutate((s) => ({ ...s, sounds: s.sounds.map((x) => x.id === sid ? { ...x, vol } : x) })),
    removeSound: (sid: string) =>
      mutate((s) => ({ ...s, sounds: s.sounds.filter((x) => x.id !== sid) })),
    addSound: (sid: string) =>
      mutate((s) => s.sounds.some((x) => x.id === sid) ? s : { ...s, sounds: [...s.sounds, { id: sid, vol: 0.55 }] }),
    toggleSound: (sid: string) =>
      mutate((s) => s.sounds.some((x) => x.id === sid)
        ? { ...s, sounds: s.sounds.filter((x) => x.id !== sid) }
        : { ...s, sounds: [...s.sounds, { id: sid, vol: 0.55 }] }),
    clearAll: () => mutate((s) => ({ ...s, sounds: [] })),
    setTimer: (min: number | null) => mutate((s) => ({ ...s, timerMin: min })),
  };
}

// Returns the schedule whose `days` includes the given JS day-of-week
// (0=Sun … 6=Sat). Falls back to the first schedule.
export function pickScheduleForDay(list: Schedule[], jsDow: number): Schedule {
  return list.find((s) => s.days.includes(jsDow)) ?? list[0];
}

// ─── PRESETS (Track sleep main screen) ───────────────────────────
export type Preset = {
  id: string;
  name: string;
  type: 'nap' | 'night';
  alarmOn: boolean;
  alarmMode: 'time' | 'duration';
  wakeHour: number;
  wakeMinute: number;
  duration: number;
  smartWakeup: boolean;
  audioRecordings: boolean;
  sleepAid: { on: boolean; name: string; kind: string };
  liveActivity: boolean;
};

function uid() { return Math.random().toString(36).slice(2, 9); }
function defaultPreset(seed: Partial<Preset> = {}): Preset {
  return {
    id: uid(),
    name: 'Untitled',
    type: 'nap',
    alarmOn: true,
    alarmMode: 'duration',
    wakeHour: 7,
    wakeMinute: 0,
    duration: 20,
    smartWakeup: false,
    audioRecordings: true,
    sleepAid: { on: false, name: 'Meditative State', kind: 'MUSIC' },
    liveActivity: true,
    ...seed,
  };
}

const presetsStore = createStore<Preset[]>([
  defaultPreset({ name: 'Power Nap', type: 'nap', alarmMode: 'duration', duration: 20 }),
  defaultPreset({
    name: 'Full Night',
    type: 'night',
    alarmMode: 'time',
    wakeHour: 7,
    wakeMinute: 0,
    smartWakeup: true,
    sleepAid: { on: true, name: 'Meditative State', kind: 'MUSIC' },
  }),
]);

export function usePresets() {
  const list = useSyncExternalStore(presetsStore.subscribe, presetsStore.get, presetsStore.get);
  return {
    list,
    add: (p: Partial<Preset> = {}): Preset => {
      const next = defaultPreset(p);
      presetsStore.set((prev) => [...prev, next]);
      return next;
    },
    update: (id: string, patch: Partial<Preset>) =>
      presetsStore.set((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p)),
    remove: (id: string) =>
      presetsStore.set((prev) => prev.filter((p) => p.id !== id)),
  };
}
