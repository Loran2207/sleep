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

// ─── APP VERSION (v1 / v2 toggle in the header) ──────────────────
export type AppVersion = 'v1' | 'v2';
const versionStore = createStore<AppVersion>('v1');
export function useVersion(): [AppVersion, (v: AppVersion) => void] {
  const v = useSyncExternalStore(versionStore.subscribe, versionStore.get, versionStore.get);
  return [v, versionStore.set];
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
  text: string;
  context: string[];     // legacy free-text tags
  factors: string[];     // sleep factors from the wake-up survey
};

const journalStore = createStore<JournalEntry[]>([
  {
    id: 'j-1', moodX: 0.85, moodY: 0.55, feeling: 'Happy', feelingDesc: 'Light and clear',
    legacyMood: 'great', date: '2026-02-19', time: '09:12', whenLabel: 'Today, 09:12',
    text: 'Took a morning stroll through Central Park. The air was so fresh and the sun felt amazing. Total connection with nature. Perfect way to start the day, feeling super recharged and ready for anything.',
    context: ['outdoors', 'exercise'],
    factors: ['sunlight', 'workout'],
  },
  {
    id: 'j-2', moodX: 0.5, moodY: 0.75, feeling: 'Alert', feelingDesc: 'Wired and busy',
    legacyMood: 'meh', date: '2025-12-17', time: '23:12', whenLabel: '17 December, 23:12',
    text: "Big presentation for the new launch next week. Honestly, I'm freaking out a bit! I've been staring at the slides for hours, but that \"what if\" voice won't shut up. Just need to breathe, visualize the win, and remember why I started.",
    context: ['work'],
    factors: ['stress', 'screens', 'coffee-late'],
  },
  {
    id: 'j-3', moodX: 0.7, moodY: 0.4, feeling: 'Calm', feelingDesc: 'At ease',
    legacyMood: 'good', date: '2025-12-15', time: '21:40', whenLabel: '15 December, 21:40',
    text: "Finally saw the sun after days of rain! It felt like the world was giving me a massive high-five. Just a reminder that the tough bits don't last forever. Things always get better if you just keep going.",
    context: ['outdoors'],
    factors: ['sunlight', 'read'],
  },
  {
    id: 'j-4', moodX: 0.3, moodY: 0.7, feeling: 'Anxious', feelingDesc: 'Worried',
    legacyMood: 'bad', date: '2025-12-13', time: '22:05', whenLabel: '13 December, 22:05',
    text: "Couldn't fall asleep again. Mind racing. Tried 4-7-8 breathing for ten minutes, helped a bit but still tossed for an hour after. Cutting caffeine after lunch from now on.",
    context: ['bed'],
    factors: ['coffee-late', 'stress', 'late-dinner'],
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
