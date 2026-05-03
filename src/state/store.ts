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

// ─── PRACTICE CYCLES ─────────────────────────────────────────────
const practiceCyclesStore = createStore<number>(8);
export function usePracticeCycles(): [number, (n: number) => void] {
  const v = useSyncExternalStore(practiceCyclesStore.subscribe, practiceCyclesStore.get, practiceCyclesStore.get);
  return [v, practiceCyclesStore.set];
}

// ─── SOUND MIX (active tracking) ─────────────────────────────────
export type MixSound = { id: string; vol: number };
export type MixState = { mix: MixSound[]; playing: boolean; alarm: string };

const mixStore = createStore<MixState>({
  mix: [
    { id: 'rain', vol: 0.65 },
    { id: 'campfire', vol: 0.45 },
    { id: 'flute', vol: 0.55 },
  ],
  playing: true,
  alarm: '07:00',
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
  sound: string;           // sound that plays while falling asleep
};

const schedulesStore = createStore<Schedule[]>([
  { id: 'weekdays', name: 'Weekdays', days: [1, 2, 3, 4, 5], bedHour: 22, bedMinute: 30, wakeHour: 6, wakeMinute: 30, sound: 'Rain' },
  { id: 'weekends', name: 'Weekends', days: [0, 6], bedHour: 0, bedMinute: 0, wakeHour: 8, wakeMinute: 30, sound: 'Soft chimes' },
]);

export function useSchedules() {
  const list = useSyncExternalStore(schedulesStore.subscribe, schedulesStore.get, schedulesStore.get);
  return {
    list,
    update: (id: string, patch: Partial<Schedule>) =>
      schedulesStore.set((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s)),
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
