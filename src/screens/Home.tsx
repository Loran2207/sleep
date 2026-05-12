import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  PhoneOffIcon, PencilIcon, HabitGlyph,
} from '../components/icons';
import {
  StickyTopBar, DayStrip, LiquidGlassNav, SectionHeader, SettingsCard,
  NightShiftCard,
  type Day,
} from '../components/shared';
import { MoodFace } from '../components/MoodFace';
import { useSchedules, useWindDownStep, usePracticeDone, useEditingJournalId, useJournal, pickScheduleForDay } from '../state/store';
import { readMood } from '../data/mood';
import { lookupFactor } from '../data/factors';

const days: Day[] = [
  { dow: 'M', n: 9, mood: 'good', sleep: '7h 12m' },
  { dow: 'T', n: 10, mood: 'meh', sleep: '6h 02m' },
  { dow: 'W', n: 11, mood: 'great', sleep: '7h 48m' },
  // n=12 left blank to demonstrate the "missed day" state.
  { dow: 'T', n: 12, mood: null, sleep: null },
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

// Maps a calendar day number into a journal date for the mock month.
// Real app would use proper date math.
export const dayToDate = (n: number) => `2026-02-${String(n).padStart(2, '0')}`;
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const dayLabel = (n: number) => `${MONTHS_SHORT[1]} ${n}`;

export function Home() {
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

        {isToday ? <RoutineHero /> : <PastDayCard day={sel} />}

        <div style={{ height: 1, background: W.fill, margin: '32px 16px 8px' }} />

        <div style={{ padding: '0 16px' }}>
          <SectionHeader>Wind down</SectionHeader>
          <SettingsCard
            icon={<PhoneOffIcon size={22} stroke={W.ink} />}
            title="Block distracting apps"
            desc="Social and games go silent 30 min before bedtime, until you wake up."
            onClick={() => go('routine')}
          />
          <NightShiftCard />
        </div>
      </div>
      <LiquidGlassNav active="home" />
    </div>
  );
}

function RoutineHero() {
  const { list: schedules } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const countdown = '4h 12m';
  const sleepEst = '8h 30m';
  const [, setStep] = useWindDownStep();
  const [, setPracticeDone] = usePracticeDone();

  function startWindDown() {
    setStep(1);
    setPracticeDone(false);
    go('wind-down');
  }

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
          caption={<>in <span style={{ color: W.ink, fontWeight: 600 }}>{countdown}</span></>}
        />
        <EditScheduleButton />
        <TimeSlot
          label="Wake up"
          time={fmt(todaySchedule.wakeHour, todaySchedule.wakeMinute)}
          caption={<>sleep ~ <span style={{ color: W.ink, fontWeight: 600 }}>{sleepEst}</span></>}
        />
      </div>

      <div style={{ marginTop: 26 }}>
        <div onClick={startWindDown} style={{
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

function TimeSlot({ label, time, caption }: {
  label: string; time: string; caption?: ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{
        fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em',
        lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: W.ink,
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
        // Vertically centered against the 36px time numbers.
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

// Mock per-day summary used by the past-day card. Real data would come from
// the journal entry for that date — for the prototype we map the existing
// day-strip mood to a 2D position and seed factors deterministically.
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
  // Show breathing practice on days the user "likely" did it — every
  // other day in the mock. On a real backend this would be a logged event.
  if ((day.n || 0) % 2 === 0) factors.push('practice');
  const pos = positions[mood ?? 'meh'];
  return { ...pos, factors };
}

function MissedDayCard({ day }: { day: Day }) {
  const { list, add } = useJournal();
  const [, setEditingId] = useEditingJournalId();
  const date = dayToDate(day.n);
  const existing = list.find((e) => e.date === date);

  function fillIn() {
    let id = existing?.id;
    if (!id) {
      const stub = add({
        moodX: 0.5, moodY: 0.5,
        feeling: 'Neutral', feelingDesc: 'Just here',
        legacyMood: 'meh',
        date, time: '08:00',
        whenLabel: `${dayLabel(day.n)}, 08:00`,
        text: '', context: [], factors: [], diary: {},
      });
      id = stub.id;
    }
    setEditingId(id);
    go('journal-entry');
  }

  return (
    <div style={{ padding: '14px 20px 10px' }}>
      <div style={{
        background: W.paper, border: `1px dashed ${W.veryweak}`,
        borderRadius: 22, padding: '24px 18px 22px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 28,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 600, color: W.weak,
          flexShrink: 0, lineHeight: 1,
        }}>?</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{dayLabel(day.n)}</div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 2 }}>
            Missed this day
          </div>
          <div style={{ fontSize: 12, color: W.weak, marginTop: 4, lineHeight: 1.45 }}>
            How did you sleep? Fill it in if you remember.
          </div>
          <div onClick={fillIn} style={{
            display: 'inline-block', marginTop: 12,
            padding: '8px 14px', borderRadius: 999,
            background: W.ink, color: W.bg,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Fill in</div>
        </div>
      </div>
    </div>
  );
}

function PastDayCard({ day }: { day: Day }) {
  if (!day.mood) {
    return <MissedDayCard day={day} />;
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

