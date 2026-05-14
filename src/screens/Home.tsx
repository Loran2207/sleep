import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  PhoneOffIcon, PencilIcon, HabitGlyph,
} from '../components/icons';
import {
  StickyTopBar, DayStrip, LiquidGlassNav, SettingsCard,
  NightShiftCard,
  type Day,
} from '../components/shared';
import { MoodFace } from '../components/MoodFace';
import { useSchedules, useWindDownStep, usePracticeDone, useEditingJournalId, useEditingScheduleId, useJournal, useBreathSessions, useQuizSession, pickScheduleForDay } from '../state/store';
import { QUIZZES, type Quiz } from '../data/quizzes';
import { readMood } from '../data/mood';
import { lookupFactor } from '../data/factors';
import { DAYS as days, TODAY_IDX as todayIdx, TODAY_DATE, dayToDate, dayLabel } from '../data/days';

export { dayToDate, dayLabel };

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
          <BreathingCard />
          <SoundsCard />

          <ToolsSectionHeader title="Wind down" style={{ marginTop: 20 }} />
          <SettingsCard
            icon={<PhoneOffIcon size={22} stroke={W.ink} />}
            title="Block distracting apps"
            desc="Social and games go silent 30 min before bedtime, until you wake up."
            onClick={() => go('routine')}
          />
          <NightShiftCard />
        </div>

        <QuizSection />
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
  const { list: schedules } = useSchedules();
  const [, setEditingId] = useEditingScheduleId();
  const today = pickScheduleForDay(schedules, 4); // Prototype "today" is Thursday.

  function open() {
    setEditingId(today.id);
    go('sleep-schedule');
  }

  return (
    <div
      onClick={open}
      aria-label="Edit schedule"
      style={{
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
        position: 'relative', overflow: 'hidden',
        background: W.paper, border: `1px dashed ${W.veryweak}`,
        borderRadius: 22, padding: '28px 22px 26px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          margin: '0 auto',
          background: W.fill, border: `1.5px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
            stroke={W.weak} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.1 9a3 3 0 1 1 4.9 2.3c-1 .7-2 1.5-2 2.7" />
            <circle cx="12" cy="17.5" r="0.7" fill={W.weak} stroke="none" />
          </svg>
        </div>
        <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginTop: 14 }}>{dayLabel(day.n)}</div>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 4 }}>
          Missed this day
        </div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 6, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
          Add when you went to bed, when you woke up and how you felt.
        </div>
        <div onClick={fillIn} style={{
          display: 'inline-block', marginTop: 18,
          padding: '12px 24px', borderRadius: 999,
          background: W.ink, color: W.bg,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
        }}>Fill in</div>
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

// Shared anim keyframes used by the paired Home tiles. Defined once so
// both tiles share definitions and we don't ship duplicate <style> blocks.
function ToolCardKeyframes() {
  return (
    <style>{`
      @keyframes breath-pulse {
        0%, 100% { transform: scale(0.78); opacity: 0.55; }
        50% { transform: scale(1); opacity: 1; }
      }
      @keyframes sound-bar {
        0%, 100% { transform: scaleY(0.32); }
        50% { transform: scaleY(1); }
      }
      @keyframes sound-ring {
        0% { transform: scale(0.7); opacity: 0.6; }
        100% { transform: scale(1.5); opacity: 0; }
      }
    `}</style>
  );
}

const TILE_BASE: React.CSSProperties = {
  position: 'relative', overflow: 'hidden',
  borderRadius: 18, padding: '16px',
  marginBottom: 10, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 14,
};

function BreathingCard() {
  const { forDate } = useBreathSessions();
  const todaySessions = forDate(TODAY_DATE);
  const breaths = todaySessions.reduce((s, x) => s + x.breaths, 0);

  return (
    <div onClick={() => go('practice-intro')} style={{
      ...TILE_BASE,
      background: `
        radial-gradient(70% 70% at 14% 30%, rgba(127,194,255,0.32) 0%, rgba(127,194,255,0) 70%),
        radial-gradient(120% 90% at 95% 100%, rgba(127,194,255,0.08) 0%, rgba(127,194,255,0) 60%),
        linear-gradient(180deg, #141A26 0%, #0F121A 100%)`,
      border: '1px solid rgba(127,194,255,0.24)',
      boxShadow: '0 14px 30px rgba(127,194,255,0.08)',
    }}>
      <ToolCardKeyframes />
      <BreathRing />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em' }}>
          Breathing
        </div>
        <div style={{
          fontSize: 12, color: W.weak, marginTop: 3, lineHeight: 1.4,
        }}>
          {todaySessions.length === 0
            ? '4‑7‑8 breath. Slow down anytime.'
            : <>
                <span style={{ color: '#7FC2FF', fontWeight: 600 }}>
                  {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} today
                </span>
                <span> · {breaths} breaths</span>
              </>}
        </div>
      </div>
      <div style={{
        padding: '8px 14px', borderRadius: 999,
        background: 'rgba(127,194,255,0.14)',
        border: '1px solid rgba(127,194,255,0.35)',
        color: '#B8DCFF', fontSize: 12, fontWeight: 600,
        flexShrink: 0,
      }}>Start</div>
    </div>
  );
}

function SoundsCard() {
  return (
    <div onClick={() => go('sounds-player')} style={{
      ...TILE_BASE,
      background: `
        radial-gradient(70% 70% at 14% 30%, rgba(255,180,122,0.34) 0%, rgba(255,180,122,0) 70%),
        radial-gradient(120% 90% at 95% 100%, rgba(255,180,122,0.08) 0%, rgba(255,180,122,0) 60%),
        linear-gradient(180deg, #1C1814 0%, #15110F 100%)`,
      border: '1px solid rgba(255,180,122,0.26)',
      boxShadow: '0 14px 30px rgba(255,180,122,0.10)',
    }}>
      <ToolCardKeyframes />
      <SoundOrb />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em' }}>
          Sounds
        </div>
        <div style={{
          fontSize: 12, color: W.weak, marginTop: 3, lineHeight: 1.4,
        }}>
          Drift off to rain, fire or waves.
        </div>
      </div>
      <div style={{
        padding: '8px 14px', borderRadius: 999,
        background: 'rgba(255,180,122,0.14)',
        border: '1px solid rgba(255,180,122,0.40)',
        color: '#FFD3B0', fontSize: 12, fontWeight: 600,
        flexShrink: 0,
      }}>Listen</div>
    </div>
  );
}

// Equalizer bars cradled inside a soft orange disc. Mirrors BreathRing's
// presentation so the paired tiles read as siblings.
function SoundOrb() {
  return (
    <div style={{
      width: 44, height: 44, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%', border: '1px dashed rgba(255,180,122,0.45)',
      }} />
      <div style={{
        position: 'absolute', width: 32, height: 32, borderRadius: 16,
        background: 'radial-gradient(circle at 35% 30%, rgba(255,225,196,0.55), rgba(255,180,122,0.10) 65%, transparent 80%)',
        border: '1px solid rgba(255,180,122,0.55)',
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2 }}>
        {[0, 0.18, 0.36].map((d, i) => (
          <div key={i} style={{
            width: 2, height: 12, borderRadius: 1,
            background: '#FFE2C7',
            transformOrigin: 'center',
            animation: `sound-bar 1.${4 + i}s ease-in-out infinite`,
            animationDelay: `${d}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

function ToolsSectionHeader({ title, style }: { title: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      padding: '12px 4px 10px',
      fontSize: 13, color: W.weak, fontWeight: 600,
      ...style,
    }}>{title}</div>
  );
}

function QuizSection() {
  const { start } = useQuizSession();
  function openQuiz(q: Quiz) {
    start(q.id);
    go('quiz-intro');
  }
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{
        padding: '0 16px 12px 16px',
        fontSize: 13, color: W.weak, fontWeight: 600,
      }}>Self-checks</div>
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto',
        padding: '4px 16px 8px 16px',
        scrollSnapType: 'x mandatory',
        scrollPaddingLeft: 16,
        WebkitOverflowScrolling: 'touch',
      }}>
        {QUIZZES.map((q) => (
          <QuizCard key={q.id} quiz={q} onClick={() => openQuiz(q)} />
        ))}
      </div>
    </div>
  );
}

function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
  const Icon = quiz.icon;
  return (
    <div onClick={onClick} style={{
      flex: '0 0 148px', minHeight: 148,
      scrollSnapAlign: 'start',
      position: 'relative', overflow: 'hidden',
      borderRadius: 20, padding: '14px 14px 14px',
      background: `
        radial-gradient(95% 70% at 22% 18%, ${quizHexA(quiz.accent, 0.42)} 0%, ${quizHexA(quiz.accent, 0)} 70%),
        radial-gradient(120% 90% at 90% 100%, ${quizHexA(quiz.accent, 0.10)} 0%, ${quizHexA(quiz.accent, 0)} 60%),
        linear-gradient(180deg, ${quizHexA(quiz.accent, 0.08)} 0%, #14141A 100%)`,
      border: `1px solid ${quizHexA(quiz.accent, 0.28)}`,
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      boxShadow: `0 14px 30px ${quizHexA(quiz.accent, 0.10)}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `linear-gradient(135deg, ${quizHexA(quiz.accent, 0.40)} 0%, ${quizHexA(quiz.accent, 0.12)} 100%)`,
        border: `1px solid ${quizHexA(quiz.accent, 0.55)}`,
        color: quiz.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 18px ${quizHexA(quiz.accent, 0.32)}, inset 0 1px 0 ${quizHexA(quiz.accent, 0.20)}`,
      }}>
        <Icon size={19} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{
        fontSize: 14, fontWeight: 700, color: W.ink,
        letterSpacing: '-0.01em', lineHeight: 1.25,
      }}>{quiz.title}</div>
      <div style={{
        marginTop: 4, fontSize: 11, color: W.weak, lineHeight: 1.3,
        fontWeight: 500,
      }}>{quizDuration(quiz)}</div>
    </div>
  );
}

// Pulls "2 min" (or whatever the time portion is) from a quiz's meta
// string so the card shows expected duration without re-stating the
// question count.
function quizDuration(quiz: Quiz): string {
  const parts = quiz.meta.split('·').map((p) => p.trim());
  return parts[parts.length - 1] || quiz.meta;
}

function quizHexA(hex: string, a: number) {
  return hexA(hex, a);
}

function BreathRing() {
  return (
    <div style={{
      width: 44, height: 44, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%', border: '1px dashed rgba(127,194,255,0.45)',
      }} />
      <div style={{
        width: 32, height: 32, borderRadius: 16,
        background: 'radial-gradient(circle at 35% 30%, rgba(184,220,255,0.65), rgba(127,194,255,0.10) 65%, transparent 80%)',
        border: '1px solid rgba(127,194,255,0.55)',
        animation: 'breath-pulse 4.2s ease-in-out infinite',
      }} />
    </div>
  );
}

