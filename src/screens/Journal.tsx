import { useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  TopPad, DayStrip, LiquidGlassNav, type Day,
} from '../components/shared';
import { HabitGlyph, PencilIcon } from '../components/icons';
import { MoodFace } from '../components/MoodFace';
import {
  useEditingJournalId, useJournal, useBreathSessions, useSleepGoal,
  type JournalEntry, type BreathSession,
} from '../state/store';
import { lookupFactor } from '../data/factors';
import { readMood } from '../data/mood';
import { DAYS, TODAY_IDX, dayToDate, dayLabel } from '../data/days';

// Show the last 7 days ending at today on the strip. Anything further
// back stays in the data set (so historic entries are still findable)
// but the strip itself reads as "this week" rather than a paginated
// month — same convention Apple Health's Sleep tab uses.
const STRIP_DAYS = DAYS.slice(Math.max(0, TODAY_IDX - 6), TODAY_IDX + 1);
const STRIP_TODAY_IDX = STRIP_DAYS.length - 1;

// Journal is one continuous per-day surface. The day strip at the top
// is the only navigation; picking a day rebuilds the body. The mood
// reading, sleep numbers and reflection (note + factors) all live
// inside the same card so the page reads as one block per day.
//
// What we surface mirrors what Apple Health gives you when no Apple
// Watch (or third-party tracker) is connected: bed time, wake time,
// time in bed, sleep goal. Heart rate, sleep stages and respiratory
// rate need a watch, so we don't pretend.
export function Journal() {
  const [selected, setSelected] = useState(STRIP_TODAY_IDX);
  const selectedDay = STRIP_DAYS[selected];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad h={6} />
      <DayStrip days={STRIP_DAYS} todayIdx={STRIP_TODAY_IDX} selectedIdx={selected} onSelect={setSelected} />
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ padding: '4px 16px 0' }}>
          <DayView day={selectedDay} />
        </div>
        <div style={{ height: 190 }} />
      </div>
      <LiquidGlassNav active="journal" />
    </div>
  );
}

// ─── DAY VIEW ──────────────────────────────────────────────────
// Renders the selected day. Missing days surface the fill-in card;
// logged days roll mood + sleep + reflection into one card and put
// any breath sessions in their own section underneath.
function DayView({ day }: { day: Day }) {
  const { list, add } = useJournal();
  const breath = useBreathSessions();
  const [, setEditingId] = useEditingJournalId();

  const date = dayToDate(day.n);
  const entry = list.find((e) => e.date === date);
  const sessions = breath.forDate(date);

  if (!entry) {
    function fillIn() {
      const stub = add({
        moodX: 0.5, moodY: 0.5,
        feeling: 'Neutral', feelingDesc: 'Just here',
        legacyMood: 'meh',
        date, time: '08:00',
        whenLabel: `${dayLabel(day.n)}, 08:00`,
        text: '', context: [], factors: [], diary: {},
      });
      setEditingId(stub.id);
      go('journal-entry');
    }
    return <MissingDayCard day={day} onFill={fillIn} sessions={sessions} />;
  }

  function openEntry() {
    setEditingId(entry!.id);
    go('journal-entry');
  }

  return (
    <>
      <DayCard day={day} entry={entry} onEdit={openEntry} />

      {sessions.length > 0 && (
        <>
          <SectionTitle>Breathing</SectionTitle>
          <BreathHistory sessions={sessions} />
        </>
      )}
    </>
  );
}

// ─── DAY CARD ──────────────────────────────────────────────────
// Single combined card holding mood + sleep + reflection. Sections
// are separated by hairline dividers; each section is hidden when it
// has no data so the card collapses cleanly for sparse days.
function DayCard({ day, entry, onEdit }: {
  day: Day; entry: JournalEntry; onEdit: () => void;
}) {
  const reading = readMood(entry.moodX, entry.moodY);
  const hasSleep = !!(entry.bedTime && entry.wakeTime);
  const totalMin = hasSleep ? minutesBetween(entry.bedTime!, entry.wakeTime!) : 0;
  const hasReflection = !!entry.text || entry.factors.length > 0;

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 22, padding: '22px 20px 20px',
      background: W.paper,
      border: `1px solid ${hexA(reading.tint, 0.32)}`,
      boxShadow: '0 14px 30px rgba(0,0,0,0.20)',
      marginTop: 8,
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(75% 70% at 80% 0%, ${hexA(reading.tint, 0.26)}, transparent 70%)`,
      }} />

      <MoodSection day={day} entry={entry} reading={reading} onEdit={onEdit} />

      {hasSleep && (
        <>
          <SectionDivider />
          <SleepSection bed={entry.bedTime!} wake={entry.wakeTime!} totalMin={totalMin} />
        </>
      )}

      {hasReflection && (
        <>
          <SectionDivider />
          <ReflectionSection text={entry.text} factors={entry.factors} onClick={onEdit} />
        </>
      )}
    </div>
  );
}

function SectionDivider() {
  return (
    <div style={{
      position: 'relative',
      height: 1, margin: '18px -20px',
      background: W.fill,
    }} />
  );
}

function MoodSection({ day, entry, reading, onEdit }: {
  day: Day; entry: JournalEntry;
  reading: ReturnType<typeof readMood>;
  onEdit: () => void;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
      <MoodFace tint={reading.tint} x={entry.moodX} y={entry.moodY} size={72} glow />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{dayLabel(day.n)}</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 4 }}>
          {reading.feeling}
        </div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 2 }}>{reading.desc}</div>
      </div>
      <div onClick={onEdit} aria-label="Edit" style={{
        position: 'relative',
        width: 32, height: 32, borderRadius: 16,
        background: W.fill, border: `1px solid ${W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
      }}>
        <PencilIcon size={14} stroke={W.ink} />
      </div>
    </div>
  );
}

function SleepSection({ bed, wake, totalMin }: { bed: string; wake: string; totalMin: number }) {
  const [goalH] = useSleepGoal();
  const goalMin = goalH * 60;
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  const ratio = goalMin > 0 ? totalMin / goalMin : 0;
  const ringPct = Math.min(100, Math.round(ratio * 100));

  let goalLabel: React.ReactNode;
  let goalColor: string = W.weak;
  if (totalMin >= goalMin) {
    goalLabel = <>Met your <strong style={{ color: W.ink, fontWeight: 600 }}>{goalH}h</strong> goal</>;
    goalColor = '#7FE3A1';
  } else {
    const short = goalMin - totalMin;
    const sh = Math.floor(short / 60);
    const sm = short % 60;
    const shortStr = sh > 0 ? `${sh}h ${String(sm).padStart(2, '0')}m` : `${sm}m`;
    goalLabel = <><strong style={{ color: W.ink, fontWeight: 600 }}>{shortStr}</strong> short of {goalH}h goal</>;
    goalColor = '#FFC9C0';
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <GoalRing pct={ringPct} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Time in bed</div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{
              fontSize: 28, fontWeight: 600, color: W.ink,
              letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {hh}<span style={{ fontSize: 16, fontWeight: 500, color: W.weak }}>h</span> {String(mm).padStart(2, '0')}<span style={{ fontSize: 16, fontWeight: 500, color: W.weak }}>m</span>
            </span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, marginTop: 8, color: W.weak,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 3,
              background: goalColor, boxShadow: `0 0 6px ${goalColor}`,
            }} />
            {goalLabel}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      }}>
        <TimeBlock label="Bed" time={bed} kind="moon" />
        <div style={{
          flex: 1, height: 1, margin: '0 16px',
          background: `linear-gradient(90deg, transparent, ${W.veryweak} 20%, ${W.veryweak} 80%, transparent)`,
        }} />
        <TimeBlock label="Wake" time={wake} kind="sun" />
      </div>
    </div>
  );
}

function ReflectionSection({ text, factors, onClick }: {
  text: string; factors: string[]; onClick: () => void;
}) {
  return (
    <div style={{ position: 'relative' }} onClick={onClick}>
      {text && (
        <div style={{
          fontSize: 14, lineHeight: 1.5, color: W.ink, cursor: 'pointer',
        }}>{text}</div>
      )}
      {factors.length > 0 && (
        <div style={{
          marginTop: text ? 14 : 0,
          display: 'flex', flexWrap: 'wrap', gap: 6,
        }}>
          {factors.map((id) => {
            const f = lookupFactor(id);
            if (!f) return null;
            return (
              <span key={id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999,
                background: W.fill, border: `1px solid ${W.veryweak}`,
                fontSize: 12, color: W.ink,
              }}>
                <HabitGlyph name={f.glyph} size={12} stroke={W.weak} />
                {f.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TimeBlock({ label, time, kind }: { label: string; time: string; kind: 'moon' | 'sun' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 15,
        background: kind === 'moon' ? 'rgba(122,105,240,0.14)' : 'rgba(255,185,92,0.16)',
        border: `1px solid ${kind === 'moon' ? 'rgba(122,105,240,0.32)' : 'rgba(255,185,92,0.34)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: kind === 'moon' ? '#B5A0FF' : '#FFD58A',
        flexShrink: 0,
      }}>
        {kind === 'moon'
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 14.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 10.5 10.5z" />
            </svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6L4.5 4.5M19.5 19.5L18 18M6 18l-1.5 1.5M19.5 4.5L18 6" />
            </svg>}
      </div>
      <div>
        <div style={{ fontSize: 10, color: W.weak, fontWeight: 500, lineHeight: 1 }}>{label}</div>
        <div style={{
          fontSize: 18, fontWeight: 600, color: W.ink, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginTop: 4,
        }}>{time}</div>
      </div>
    </div>
  );
}

function GoalRing({ pct }: { pct: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  return (
    <div style={{
      width: size, height: size, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r}
          stroke={W.fill} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r}
          stroke="url(#sleepGoalGrad)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
        <defs>
          <linearGradient id="sleepGoalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C4B0FF" />
            <stop offset="100%" stopColor="#7A69F0" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', fontSize: 14, fontWeight: 600, color: W.ink,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
        display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1,
      }}>
        <span>{pct}</span>
        <span style={{ fontSize: 9, color: W.weak, marginTop: 2, fontWeight: 500 }}>% goal</span>
      </div>
    </div>
  );
}

// ─── MISSING DAY PLACEHOLDER ───────────────────────────────────
function MissingDayCard({ day, onFill, sessions }: {
  day: Day; onFill: () => void; sessions: BreathSession[];
}) {
  return (
    <>
      <div style={{
        background: W.paper, border: `1px dashed ${W.veryweak}`,
        borderRadius: 22, padding: '28px 22px 24px',
        textAlign: 'center', marginTop: 8,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36,
          margin: '0 auto',
          background: W.fill, border: `1.5px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
            stroke={W.weak} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.1 9a3 3 0 1 1 4.9 2.3c-1 .7-2 1.5-2 2.7" />
            <circle cx="12" cy="17.5" r="0.7" fill={W.weak} stroke="none" />
          </svg>
        </div>
        <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginTop: 14 }}>{dayLabel(day.n)}</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em', marginTop: 4 }}>
          Nothing logged
        </div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 6, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
          Add when you went to bed, when you woke up and how you felt.
        </div>
        <div onClick={onFill} style={{
          display: 'inline-block', marginTop: 18,
          padding: '12px 26px', borderRadius: 999,
          background: W.ink, color: W.bg,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
        }}>Fill in</div>
      </div>

      {sessions.length > 0 && (
        <>
          <SectionTitle>Breathing</SectionTitle>
          <BreathHistory sessions={sessions} />
        </>
      )}
    </>
  );
}

// ─── BREATH HISTORY (per-day) ──────────────────────────────────
const FEELING_LABEL: Record<string, string> = {
  calmer: 'Calmer',
  same: 'About the same',
  restless: 'Still restless',
};

const FEELING_TINT: Record<string, string> = {
  calmer: '#7FE3A1',
  same: '#B7C8FF',
  restless: '#E59A6F',
};

function BreathHistory({ sessions }: { sessions: BreathSession[] }) {
  const totalBreaths = sessions.reduce((s, x) => s + x.breaths, 0);
  const totalMin = Math.round(sessions.reduce((s, x) => s + x.durationSec, 0) / 60);
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, fontWeight: 600,
        color: '#8AA1FF', marginBottom: 8,
      }}>
        <BreathDot />
        <span style={{ color: W.weak, fontWeight: 500 }}>
          {sessions.length} session{sessions.length === 1 ? '' : 's'} · {totalBreaths} breaths{totalMin > 0 ? ` · ${totalMin} min` : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.map((s) => <BreathSessionCard key={s.id} session={s} />)}
      </div>
    </div>
  );
}

function BreathSessionCard({ session }: { session: BreathSession }) {
  const mm = Math.floor(session.durationSec / 60);
  const ss = String(session.durationSec % 60).padStart(2, '0');
  const tint = session.feeling ? FEELING_TINT[session.feeling] : null;
  return (
    <div style={{
      background: 'rgba(138,161,255,0.05)',
      border: '1px solid rgba(138,161,255,0.22)',
      borderRadius: 14, padding: '12px 14px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, color: W.weak,
      }}>
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
          {session.time} · 4‑7‑8
        </span>
        {session.feeling && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            color: tint ?? W.ink, fontWeight: 600,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: tint ?? W.ink }} />
            {FEELING_LABEL[session.feeling]}
          </span>
        )}
      </div>
      <div style={{
        marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      }}>
        <Metric value={session.cycles}  label="cycles" />
        <Metric value={`${mm}:${ss}`}   label="minutes" />
        <Metric value={session.breaths} label="breaths" />
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 22, fontWeight: 500, color: W.ink,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: W.weak, marginTop: 5 }}>{label}</div>
    </div>
  );
}

function BreathDot() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 4,
      background: 'radial-gradient(circle, #B5C2FF, rgba(138,161,255,0.40) 70%)',
      boxShadow: '0 0 6px rgba(138,161,255,0.65)',
      flexShrink: 0,
    }} />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '20px 6px 10px',
      fontSize: 13, color: W.weak, fontWeight: 600,
    }}>{children}</div>
  );
}

function minutesBetween(a: string, b: string) {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  let diff = (bh * 60 + bm) - (ah * 60 + am);
  if (diff < 0) diff += 24 * 60;
  return diff;
}

function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
