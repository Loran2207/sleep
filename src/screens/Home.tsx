import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { startTracking } from '../state/tracking';
import {
  CheckIcon, NightShiftIcon, PhoneOffIcon, PencilIcon, PlusIcon,
  PlayIcon, TrashIcon, WindIcon, HabitGlyph,
} from '../components/icons';
import {
  StickyTopBar, DayStrip, LiquidGlassNav, SectionHeader, SettingsCard,
  NightShiftCard,
  type Day,
} from '../components/shared';
import { MoodFace } from '../components/MoodFace';
import { useHabits, useSchedules, useVersion, pickScheduleForDay, type Habit } from '../state/store';
import { readMood } from '../data/mood';
import { lookupFactor } from '../data/factors';

const days: Day[] = [
  { dow: 'M', n: 9, mood: 'good', sleep: '7h 12m' },
  { dow: 'T', n: 10, mood: 'meh', sleep: '6h 02m' },
  { dow: 'W', n: 11, mood: 'great', sleep: '7h 48m' },
  { dow: 'T', n: 12, mood: 'good', sleep: '7h 04m' },
  { dow: 'F', n: 13, mood: 'bad', sleep: '5h 41m' },
  { dow: 'S', n: 14, mood: 'great', sleep: '8h 12m' },
  { dow: 'S', n: 15, mood: 'good', sleep: '7h 30m' },
  { dow: 'M', n: 16, mood: 'meh', sleep: '6h 42m' },
  { dow: 'T', n: 17, mood: 'good', sleep: '7h 04m' },
  { dow: 'W', n: 18, mood: 'bad', sleep: '5h 58m' },
  { dow: 'T', n: 19, mood: null, sleep: null },
  { dow: 'F', n: 20, mood: null, sleep: null },
  { dow: 'S', n: 21, mood: null, sleep: null },
  { dow: 'S', n: 22, mood: null, sleep: null },
];
const todayIdx = 10;

export function Home() {
  const [version] = useVersion();
  if (version === 'v2') return <HomeV2 />;
  return <HomeV1 />;
}

function HomeV1() {
  const [selected, setSelected] = useState(todayIdx);
  const sel = days[selected];
  const isToday = selected === todayIdx;

  const stripRef = useRef<HTMLDivElement | null>(null);
  const didCenter = useRef(false);
  useEffect(() => {
    if (didCenter.current) return;
    const container = stripRef.current?.firstChild as HTMLDivElement | undefined;
    const el = stripRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
    if (container && el) {
      container.scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      didCenter.current = true;
    }
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <StickyTopBar />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>
        <div style={{ paddingTop: 4 }}>
          <div ref={stripRef}>
            <DayStrip days={days} todayIdx={todayIdx} selectedIdx={selected} onSelect={setSelected} />
          </div>

          {isToday ? <RoutineHero /> : <PastNightCard day={sel} />}

          <div style={{ padding: '8px 16px 0' }}>
            {isToday
              ? <HabitsBlock />
              : (
                <>
                  <HabitsBlock readOnly pastDay={sel} />
                  <div style={{ height: 12 }} />
                  <NotesCard day={sel} />
                </>
              )}
          </div>
        </div>

        <div style={{ height: 1, background: W.fill, margin: '32px 16px 8px' }} />

        <div style={{ padding: '0 16px' }}>
          <SectionHeader>Wind down</SectionHeader>
          <SettingsCard
            icon={<PhoneOffIcon size={22} stroke={W.ink} />}
            title="Block distracting apps"
            desc="Social and games go silent 30 min before bedtime, until you wake up"
            onClick={() => go('routine')}
          />
          <SettingsCard
            icon={<NightShiftIcon size={22} stroke={W.ink} />}
            title="Night Shift"
            desc="Please turn on Night Shift in your system settings to warm your screen at sunset and protect melatonin."
          />
        </div>
      </div>

      <LiquidGlassNav active="home" />
    </div>
  );
}

function RoutineHero() {
  const { list: schedules } = useSchedules();
  // Prototype "today" is a weekday (Thursday) — pick the matching schedule.
  const todaySchedule = pickScheduleForDay(schedules, 4);

  const countdown = '4h 12m';
  const sleepEst = '8h 30m';

  const [napOpen, setNapOpen] = useState(false);
  const [napMin, setNapMin] = useState(20);

  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <div style={{ padding: '14px 20px 10px', color: W.ink, fontFamily: W.font }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 28,
      }}>
        <TimeSlot
          label="Bedtime"
          time={fmt(todaySchedule.bedHour, todaySchedule.bedMinute)}
          on
          caption={<>in <span style={{ color: W.ink, fontWeight: 600 }}>{countdown}</span></>}
        />
        <EditScheduleButton />
        <TimeSlot
          label="Wake up"
          time={fmt(todaySchedule.wakeHour, todaySchedule.wakeMinute)}
          on
          caption={<>sleep ~ <span style={{ color: W.ink, fontWeight: 600 }}>{sleepEst}</span></>}
        />
      </div>

      <div style={{ marginTop: 22, display: 'flex', gap: 8 }}>
        <div onClick={() => startTracking()} style={{
          flex: 1, padding: '18px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999,
          fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
        }}>Track sleep</div>

        <div onClick={() => setNapOpen(true)} style={{
          flex: 1, padding: '18px 0', textAlign: 'center',
          background: 'transparent', color: W.ink,
          border: `1px solid ${W.fill}`, borderRadius: 999,
          fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
          cursor: 'pointer',
        }}>Quick nap</div>
      </div>

      {napOpen && <QuickNapSheet selected={napMin} onSelect={setNapMin} onClose={() => setNapOpen(false)} />}
    </div>
  );
}

function QuickNapSheet({ selected, onSelect, onClose }: {
  selected: number; onSelect: (n: number) => void; onClose: () => void;
}) {
  const options = [10, 15, 20, 30];
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(14,14,17,0.45)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: W.bg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 20px 28px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: W.fill, margin: '0 auto 14px',
        }} />
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Take a quick nap</div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.5 }}>
          Pick how long you want to rest. We'll wake you gently.
        </div>
        <div style={{
          marginTop: 18,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
        }}>
          {options.map((min) => {
            const active = selected === min;
            return (
              <div key={min} onClick={() => onSelect(min)} style={{
                padding: '16px 0', textAlign: 'center',
                borderRadius: 16, cursor: 'pointer',
                background: active ? W.ink : W.paper,
                color: active ? W.bg : W.ink,
                border: `1px solid ${active ? W.ink : W.fill}`,
                transition: 'all .12s ease',
              }}>
                <div style={{
                  fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                }}>{min}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>min</div>
              </div>
            );
          })}
        </div>
        <div onClick={() => startTracking()} style={{
          marginTop: 16, padding: '16px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <PlayIcon size={12} stroke={W.bg} />
          Start nap · {selected} min
        </div>
        <div onClick={onClose} style={{
          marginTop: 8, padding: '12px 0', textAlign: 'center',
          color: W.weak, fontSize: 13, cursor: 'pointer',
        }}>Cancel</div>
      </div>
    </div>
  );
}

function TimeSlot({ label, time, on, caption }: {
  label: string; time: string; on: boolean; caption?: ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{
        fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em',
        lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        color: on ? W.ink : W.weak,
      }}>{time}</div>
      {caption && (
        <div style={{
          marginTop: 8, fontSize: 12, color: W.weak,
          fontVariantNumeric: 'tabular-nums',
        }}>{caption}</div>
      )}
    </div>
  );
}

function EditScheduleButton() {
  return (
    <div
      onClick={() => go('sleep-schedule')}
      aria-label="Edit schedule"
      style={{
        // Vertically centered against the 36px time numbers (which sit ~18px from the label baseline).
        marginTop: 22,
        width: 30, height: 30, borderRadius: 15,
        background: W.fill, border: `1px solid ${W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      <PencilIcon size={14} stroke={W.ink} />
    </div>
  );
}

function PastNightCard({ day }: { day: Day }) {
  const seed = (day.n || 0) % 5;
  const bedActual = ['23:14', '22:48', '00:12', '23:35', '22:10'][seed];
  const wakeActual = ['06:56', '07:02', '07:18', '06:40', '07:25'][seed];
  const sleepDur = day.sleep || '7h 42m';
  const hasData = day.mood && day.mood !== null;

  return (
    <div style={{ padding: '14px 20px 10px', color: W.ink, fontFamily: W.font }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 56,
      }}>
        <TimeSlot
          label="Went to bed"
          time={bedActual}
          on={!!hasData}
          caption={hasData ? <>slept <span style={{ color: W.ink, fontWeight: 600 }}>{sleepDur}</span></> : <span>no data</span>}
        />
        <TimeSlot
          label="Woke up"
          time={wakeActual}
          on={!!hasData}
          caption={hasData ? <><span style={{ color: W.ink, fontWeight: 600 }}>2</span> wakeups</> : <span>—</span>}
        />
      </div>
    </div>
  );
}

// ─── Habits block ────────────────────────────────────────────────
function HabitsBlock({ readOnly = false, pastDay = null }: {
  readOnly?: boolean;
  pastDay?: Day | null;
}) {
  const [list, setList] = useHabits();

  const toggle = (id: string) =>
    setList((l) => l.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  const remove = (id: string) =>
    setList((l) => l.filter((h) => h.id !== id));

  const pastDoneSet = useMemo<Set<string> | null>(() => {
    if (!readOnly || !pastDay) return null;
    const seed = (pastDay.n || 0) % 5;
    const counts = [3, 2, 1, list.length, 0];
    const k = Math.min(counts[seed], list.length);
    const set = new Set<string>();
    for (let i = 0; i < k; i++) set.add(list[(seed + i) % list.length].id);
    return set;
  }, [readOnly, pastDay && pastDay.n, list.length]);

  const resolved = readOnly && pastDoneSet
    ? list.map((h) => ({ ...h, done: pastDoneSet.has(h.id) }))
    : list;

  const doneCount = resolved.filter((h) => h.done).length;
  const missedCount = resolved.length - doneCount;

  return (
    <div style={{ fontFamily: W.font }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 4px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: W.ink }}>Habits</div>
          <div style={{ fontSize: 12, color: W.weak, fontVariantNumeric: 'tabular-nums' }}>
            {readOnly
              ? <>{doneCount} done · {missedCount} missed</>
              : <>{doneCount}/{resolved.length} tonight</>}
          </div>
        </div>
        {!readOnly && (
          <div onClick={() => go('habit-library')} style={{
            width: 32, height: 32, borderRadius: 16,
            background: W.fill, border: `1px solid ${W.veryweak}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }} aria-label="Add habit"><PlusIcon size={14} stroke={W.ink} /></div>
        )}
      </div>

      {resolved.length === 0 ? (
        readOnly ? (
          <div style={{
            padding: '18px 16px', borderRadius: 16,
            border: `1px dashed ${W.fill}`, color: W.weak,
            fontSize: 13, lineHeight: 1.4, textAlign: 'center',
          }}>No habits tracked.</div>
        ) : (
          <div onClick={() => go('habit-library')} style={{
            padding: '18px 16px', borderRadius: 16,
            border: `1px dashed ${W.fill}`, color: W.weak,
            fontSize: 13, lineHeight: 1.4, textAlign: 'center', cursor: 'pointer',
          }}>
            No habits yet. Tap <span style={{ color: W.ink, fontWeight: 600 }}>+</span> to add one.
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {resolved.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              readOnly={readOnly}
              onToggle={() => toggle(h.id)}
              onRemove={() => remove(h.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HabitRow({ habit, onToggle, onRemove, readOnly = false }: {
  habit: Habit;
  onToggle: () => void;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const dx = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    if (readOnly) return;
    // Capture so move/up keep firing if the finger leaves the 64px row.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    startX.current = e.clientX;
    dx.current = 0;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (readOnly) return;
    if (startX.current === null) return;
    dx.current = e.clientX - startX.current;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (readOnly) return;
    if (startX.current === null) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    if (dx.current < -28) setOpen(true);
    else if (dx.current > 28) setOpen(false);
    startX.current = null;
  }

  const handleEdit = (e: React.MouseEvent) => { e.stopPropagation(); setOpen(false); };
  const handleRemove = (e: React.MouseEvent) => { e.stopPropagation(); onRemove(); };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, height: 64 }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, height: '100%',
        display: 'flex', gap: 6, alignItems: 'stretch',
      }}>
        <div onClick={handleEdit} style={{
          width: 56, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4,
          background: W.fill, color: W.ink, fontSize: 10, cursor: 'pointer',
          borderRadius: 14,
        }}><PencilIcon size={16} stroke={W.ink} />Edit</div>
        <div onClick={handleRemove} style={{
          width: 56, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4,
          background: W.ink, color: W.bg, fontSize: 10, cursor: 'pointer',
          borderRadius: 14,
        }}><TrashIcon size={16} stroke={W.bg} />Remove</div>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => {
          if (readOnly) return;
          if (open) { setOpen(false); return; }
          if (habit.linkTo && !habit.done) { go(habit.linkTo); return; }
          onToggle();
        }}
        style={{
          position: 'absolute', inset: 0,
          background: W.paper, border: `1px solid ${W.fill}`, borderRadius: 16,
          padding: '0 14px 0 12px',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: readOnly ? 'default' : 'pointer',
          transform: `translateX(${open ? -124 : 0}px)`,
          transition: 'transform .18s ease',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          opacity: habit.done ? 0.55 : 1,
        }}><HabitGlyph name={habit.glyph} size={20} stroke={W.ink} /></div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: W.ink, lineHeight: 1.25,
            opacity: habit.done ? 0.5 : 1,
            textDecoration: habit.done ? 'line-through' : 'none',
            textDecorationColor: W.weak,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{habit.title}</div>
          {habit.desc && (
            <div style={{
              fontSize: 11, color: W.weak, marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {habit.desc}
            </div>
          )}
        </div>

        <div onClick={(e) => { if (readOnly) return; e.stopPropagation(); onToggle(); }} style={{
          width: 26, height: 26, borderRadius: 13, flexShrink: 0,
          border: `1.5px ${habit.done ? 'solid' : 'dashed'} ${habit.done ? W.ink : W.veryweak}`,
          background: habit.done ? W.ink : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: readOnly ? 'default' : 'pointer',
        }}>{habit.done && <CheckIcon size={14} stroke={W.bg} />}</div>
      </div>
    </div>
  );
}

function NotesCard({ day }: { day: Day }) {
  const seedByMood: Record<string, string> = {
    great: 'Felt rested and clear-headed all morning. The early lights-off really paid off — fell asleep within minutes.',
    good: 'Solid night. A little slow getting going but felt good by mid-morning.',
    meh: 'Average — woke up once around 3am but fell back asleep quickly. Slightly groggy after coffee.',
    bad: "Tossed and turned for almost an hour. Mind kept racing about tomorrow's meeting. Felt drained all day.",
    awful: 'Barely slept. Woke up multiple times feeling anxious. Need to set a real wind-down routine.',
  };
  const seed = day.mood ? seedByMood[day.mood] || '' : '';
  const [text, setText] = useState(() => seed);
  const [editing, setEditing] = useState(false);
  useEffect(() => { setText(day.mood ? seedByMood[day.mood] || '' : ''); setEditing(false); }, [day.n]);

  return (
    <div style={{
      background: W.paper, borderRadius: 18, padding: 16,
      border: `1px solid ${W.fill}`, fontFamily: W.font,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: W.weak }}>How I felt</div>
        <div onClick={() => setEditing((e) => !e)} style={{
          fontSize: 12, color: W.ink, cursor: 'pointer', fontWeight: 500,
        }}>{editing ? 'Done' : 'Edit'}</div>
      </div>
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{
            width: '100%', background: 'transparent', color: W.ink,
            border: 'none', outline: 'none', resize: 'none',
            fontSize: 14, lineHeight: 1.5, fontFamily: W.font, padding: 0,
          }}
        />
      ) : (
        <div style={{ fontSize: 14, lineHeight: 1.5, color: W.ink, whiteSpace: 'pre-wrap' }}>
          {text || <span style={{ color: W.weak }}>Add a note about how you slept…</span>}
        </div>
      )}
    </div>
  );
}

// ─── HOME v2 ─────────────────────────────────────────────────────
// Simplified dashboard: day strip with moods, bedtime hero with
// a single Go-to-sleep button, past-day summary card with mood
// face + factors chips, and the wind-down recommendation cards.
function HomeV2() {
  const [selected, setSelected] = useState(todayIdx);
  const sel = days[selected];
  const isToday = selected === todayIdx;

  const stripRef = useRef<HTMLDivElement | null>(null);
  const didCenter = useRef(false);
  useEffect(() => {
    if (didCenter.current) return;
    const container = stripRef.current?.firstChild as HTMLDivElement | undefined;
    const el = stripRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
    if (container && el) {
      container.scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      didCenter.current = true;
    }
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <StickyTopBar />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>
        <div style={{ paddingTop: 4 }}>
          <div ref={stripRef}>
            <DayStrip days={days} todayIdx={todayIdx} selectedIdx={selected} onSelect={setSelected} />
          </div>
        </div>

        {isToday ? <RoutineHeroV2 /> : <PastDayCard day={sel} />}

        <div style={{ height: 1, background: W.fill, margin: '32px 16px 8px' }} />

        <div style={{ padding: '0 16px' }}>
          <SectionHeader>Wind down</SectionHeader>
          <NightShiftCard />
        </div>
      </div>
      <LiquidGlassNav active="home" />
    </div>
  );
}

// Mock per-day summary used by the v2 past-day card. Real data would come
// from the journal entry for that date — for the prototype we map the
// existing day-strip mood to a 2D position and seed factors deterministically.
function pastSummary(day: Day) {
  const mood = day.mood;
  const positions: Record<string, { x: number; y: number; bed: string; wake: string; sleep: string }> = {
    great: { x: 0.85, y: 0.55, bed: '22:48', wake: '07:02', sleep: '8h 14m' },
    good: { x: 0.7, y: 0.4, bed: '23:14', wake: '06:56', sleep: '7h 42m' },
    meh: { x: 0.5, y: 0.45, bed: '00:12', wake: '07:18', sleep: '6h 02m' },
    bad: { x: 0.3, y: 0.7, bed: '23:35', wake: '06:40', sleep: '5h 41m' },
    awful: { x: 0.15, y: 0.5, bed: '01:10', wake: '07:25', sleep: '4h 30m' },
  };
  const factorPool = ['coffee-late', 'screens', 'late-dinner', 'stress', 'workout', 'sunlight', 'read', 'alcohol'];
  const seed = ((day.n || 0) * 7) % factorPool.length;
  const count = mood === 'great' ? 2 : mood === 'good' ? 2 : mood === 'meh' ? 3 : 3;
  const factors = Array.from({ length: count }, (_, i) => factorPool[(seed + i) % factorPool.length]);
  const pos = positions[mood ?? 'meh'];
  return { ...pos, factors };
}

function PastDayCard({ day }: { day: Day }) {
  if (!day.mood) {
    return (
      <div style={{ padding: '14px 20px 10px' }}>
        <div style={{
          background: W.paper, border: `1px dashed ${W.fill}`,
          borderRadius: 22, padding: '28px 18px', textAlign: 'center',
          color: W.weak, fontSize: 13, lineHeight: 1.5,
        }}>
          No data for this day yet.
        </div>
      </div>
    );
  }
  const summary = pastSummary(day);
  const reading = readMood(summary.x, summary.y);

  return (
    <div style={{ padding: '14px 20px 10px' }}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: W.paper, border: `1px solid ${hexA(reading.tint, 0.35)}`,
        borderRadius: 22, padding: '20px 18px 18px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(70% 60% at 80% 0%, ${hexA(reading.tint, 0.22)}, transparent 70%)`,
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          <MoodFace tint={reading.tint} x={summary.x} y={summary.y} size={72} glow />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>How you felt</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 4 }}>
              {reading.feeling}
            </div>
            <div style={{ fontSize: 13, color: W.weak, marginTop: 2 }}>{reading.desc}</div>
          </div>
        </div>

        <div style={{
          position: 'relative', marginTop: 18, display: 'flex',
          alignItems: 'flex-start', justifyContent: 'space-around', gap: 12,
        }}>
          <PastTimeSlot label="Bed" value={summary.bed} />
          <div style={{ alignSelf: 'center', textAlign: 'center', minWidth: 60 }}>
            <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Slept</div>
            <div style={{
              fontSize: 14, fontWeight: 600, marginTop: 4,
              fontVariantNumeric: 'tabular-nums', color: W.ink,
            }}>{summary.sleep}</div>
          </div>
          <PastTimeSlot label="Wake" value={summary.wake} />
        </div>

        {summary.factors.length > 0 && (
          <div style={{
            position: 'relative', marginTop: 18, paddingTop: 14,
            borderTop: `1px solid ${W.fill}`,
            display: 'flex', flexWrap: 'wrap', gap: 6,
          }}>
            {summary.factors.map((id) => {
              const f = lookupFactor(id);
              if (!f) return null;
              return (
                <span key={id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 999,
                  background: W.fill, border: `1px solid ${W.veryweak}`,
                  fontSize: 11, color: W.ink,
                }}>
                  <HabitGlyph name={f.glyph} size={11} stroke={W.weak} />
                  {f.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PastTimeSlot({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 11, color: W.weak, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums', color: W.ink, lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function RoutineHeroV2() {
  const { list: schedules } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const countdown = '4h 12m';
  const sleepEst = '8h 30m';

  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <div style={{ padding: '14px 20px 10px', color: W.ink, fontFamily: W.font }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 28,
      }}>
        <TimeSlot
          label="Bedtime"
          time={fmt(todaySchedule.bedHour, todaySchedule.bedMinute)}
          on
          caption={<>in <span style={{ color: W.ink, fontWeight: 600 }}>{countdown}</span></>}
        />
        <EditScheduleButton />
        <TimeSlot
          label="Wake up"
          time={fmt(todaySchedule.wakeHour, todaySchedule.wakeMinute)}
          on
          caption={<>sleep ~ <span style={{ color: W.ink, fontWeight: 600 }}>{sleepEst}</span></>}
        />
      </div>

      <div style={{ marginTop: 26 }}>
        <div onClick={() => go('wind-down')} style={{
          padding: '20px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999,
          fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
          cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(0,0,0,0.22)',
        }}>Go to sleep</div>
      </div>
    </div>
  );
}

// Convenience export of the line-art icon for outside callers
export { WindIcon };
