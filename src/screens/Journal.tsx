import { useEffect, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  TopPad, DayStrip, LiquidGlassNav, type Day,
} from '../components/shared';
import { HabitGlyph, PencilIcon } from '../components/icons';
import { MoodFace } from '../components/MoodFace';
import {
  useEditingJournalId, useJournal, useBreathSessions,
  type JournalEntry, type BreathSession,
} from '../state/store';
import { lookupFactor } from '../data/factors';
import { readMood } from '../data/mood';
import { DAYS as days, TODAY_IDX as todayIdx, dayToDate, dayLabel } from '../data/days';

// Journal is one continuous per-day surface. The day strip at the top
// is the only navigation; today and any past day share the same
// layout — picking a day rebuilds the body with that day's mood
// reading, sleep card, stages, vitals, factors and breath log.
// Today shows last-night's data (Apple Health's convention).
export function Journal() {
  const [selected, setSelected] = useState(todayIdx);
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

  const selectedDay = days[selected];
  const isFuture = selected > todayIdx;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad h={6} />
      <div ref={stripRef}>
        <DayStrip days={days} todayIdx={todayIdx} selectedIdx={selected} onSelect={setSelected} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ padding: '4px 16px 0' }}>
          {isFuture ? <FutureDay day={selectedDay} /> : <DayView day={selectedDay} />}
        </div>
        <div style={{ height: 130 }} />
      </div>
      <LiquidGlassNav active="journal" />
    </div>
  );
}

// ─── DAY VIEW (same for today + past) ──────────────────────────
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

  const reading = readMood(entry.moodX, entry.moodY);
  const hasSleep = !!(entry.bedTime && entry.wakeTime);
  const totalMin = hasSleep ? minutesBetween(entry.bedTime!, entry.wakeTime!) : 0;
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  const vitals = vitalsFor(entry);
  const stages = stagesFor(entry, totalMin);

  return (
    <>
      <DayHero day={day} entry={entry} reading={reading} onEditMood={openEntry} />

      {hasSleep && (
        <>
          <SleepSummaryCard
            bed={entry.bedTime!} wake={entry.wakeTime!}
            hh={hh} mm={mm}
            efficiency={vitals.efficiency}
          />
          <StagesCard stages={stages} />
          <HeartRateCard vitals={vitals} />
          <RowMetrics
            metrics={[
              { label: 'Fell asleep in', value: `${vitals.timeToSleep}m`, accent: '#8AA1FF' },
              { label: 'Wake-ups',       value: `${vitals.wakeUps}`,      accent: '#FFC9C0' },
              { label: 'Respiration',    value: `${vitals.respRate}`, unit: '/min', accent: '#B5C2FF' },
            ]}
          />
        </>
      )}

      {entry.text && (
        <>
          <SectionTitle>Note</SectionTitle>
          <div onClick={openEntry} style={{
            background: W.paper, border: `1px solid ${W.fill}`,
            borderRadius: 18, padding: '16px 16px',
            fontSize: 14, lineHeight: 1.5, color: W.ink, cursor: 'pointer',
          }}>{entry.text}</div>
        </>
      )}

      {entry.factors.length > 0 && (
        <>
          <SectionTitle>Factors</SectionTitle>
          <FactorChips ids={entry.factors} />
        </>
      )}

      {sessions.length > 0 && (
        <>
          <SectionTitle>Breathing</SectionTitle>
          <BreathHistory sessions={sessions} />
        </>
      )}
    </>
  );
}

function DayHero({ day, entry, reading, onEditMood }: {
  day: Day; entry: JournalEntry;
  reading: ReturnType<typeof readMood>;
  onEditMood: () => void;
}) {
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
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
        <MoodFace tint={reading.tint} x={entry.moodX} y={entry.moodY} size={72} glow />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{dayLabel(day.n)}</div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 4 }}>
            {reading.feeling}
          </div>
          <div style={{ fontSize: 13, color: W.weak, marginTop: 2 }}>{reading.desc}</div>
        </div>
        <div onClick={onEditMood} aria-label="Edit" style={{
          position: 'relative',
          width: 32, height: 32, borderRadius: 16,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <PencilIcon size={14} stroke={W.ink} />
        </div>
      </div>
    </div>
  );
}

// ─── SLEEP SUMMARY (bed → wake + efficiency ring) ──────────────
function SleepSummaryCard({ bed, wake, hh, mm, efficiency }: {
  bed: string; wake: string; hh: number; mm: number; efficiency: number;
}) {
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '18px 16px',
      marginTop: 10,
      display: 'flex', alignItems: 'center', gap: 18,
    }}>
      <EfficiencyRing pct={efficiency} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 4,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ fontSize: 26, fontWeight: 600, color: W.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {hh}<span style={{ fontSize: 16, fontWeight: 500, color: W.weak }}>h</span> {String(mm).padStart(2, '0')}<span style={{ fontSize: 16, fontWeight: 500, color: W.weak }}>m</span>
          </span>
        </div>
        <div style={{ fontSize: 12, color: W.weak, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
          {bed} → {wake}
        </div>
      </div>
    </div>
  );
}

function EfficiencyRing({ pct }: { pct: number }) {
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
          stroke="url(#effGrad)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
        <defs>
          <linearGradient id="effGrad" x1="0" y1="0" x2="1" y2="1">
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
        <span style={{ fontSize: 9, color: W.weak, marginTop: 2, fontWeight: 500 }}>%</span>
      </div>
    </div>
  );
}

// ─── STAGES BAR (Awake / REM / Core / Deep) ────────────────────
function StagesCard({ stages }: { stages: { id: string; label: string; pct: number; color: string }[] }) {
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '16px 16px',
      marginTop: 10,
    }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginBottom: 10 }}>Stages</div>
      <div style={{
        display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden',
        background: W.fill,
      }}>
        {stages.map((s) => (
          <div key={s.id} style={{ width: `${s.pct}%`, background: s.color }} />
        ))}
      </div>
      <div style={{
        marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
      }}>
        {stages.map((s) => (
          <div key={s.id} style={{ textAlign: 'center' }}>
            <div style={{
              width: 8, height: 8, borderRadius: 2, background: s.color,
              margin: '0 auto 6px',
            }} />
            <div style={{
              fontSize: 14, fontWeight: 600, color: W.ink,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>{s.pct}%</div>
            <div style={{ fontSize: 11, color: W.weak, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HEART RATE OVERNIGHT ──────────────────────────────────────
function HeartRateCard({ vitals }: { vitals: Vitals }) {
  const { hrLine, restingHr, avgHr } = vitals;
  const minHr = Math.min(...hrLine);
  const maxHr = Math.max(...hrLine);
  const W_BOX = 280;
  const H_BOX = 80;
  const padX = 8;
  const padY = 10;
  const innerW = W_BOX - padX * 2;
  const innerH = H_BOX - padY * 2;
  const xy = (i: number, v: number) => {
    const x = padX + (innerW * i) / Math.max(1, hrLine.length - 1);
    const norm = (v - minHr) / Math.max(1, maxHr - minHr);
    const y = padY + innerH * (1 - norm);
    return { x, y };
  };
  const path = hrLine.map((v, i) => {
    const { x, y } = xy(i, v);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const fill = `${path} L ${padX + innerW} ${padY + innerH} L ${padX} ${padY + innerH} Z`;

  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '16px 14px',
      marginTop: 10,
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '0 4px 8px',
      }}>
        <div>
          <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>Heart rate</div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: W.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {restingHr}
            </span>
            <span style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>bpm · resting</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Avg</div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: W.ink, fontVariantNumeric: 'tabular-nums', marginTop: 4,
          }}>{avgHr}<span style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}> bpm</span></div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W_BOX} ${H_BOX}`} width="100%" height={H_BOX} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8E7C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF8E7C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hrStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFC9C0" />
            <stop offset="100%" stopColor="#FF8E7C" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#hrFill)" />
        <path d={path} stroke="url(#hrStroke)" strokeWidth="2" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '6px 6px 0', fontSize: 10, color: W.weak,
        fontVariantNumeric: 'tabular-nums', fontWeight: 500,
      }}>
        <span>Bed</span><span>Mid</span><span>Wake</span>
      </div>
    </div>
  );
}

// ─── ROW OF 3 MINI METRICS ─────────────────────────────────────
function RowMetrics({ metrics }: {
  metrics: { label: string; value: string; unit?: string; accent: string }[];
}) {
  return (
    <div style={{
      marginTop: 10, display: 'grid',
      gridTemplateColumns: `repeat(${metrics.length}, 1fr)`, gap: 10,
    }}>
      {metrics.map((m) => (
        <div key={m.label} style={{
          background: W.paper, border: `1px solid ${W.fill}`,
          borderRadius: 16, padding: '14px 12px',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: 3,
            background: m.accent, marginBottom: 8,
            boxShadow: `0 0 8px ${m.accent}`,
          }} />
          <div style={{
            fontSize: 18, fontWeight: 600, color: W.ink,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', lineHeight: 1,
          }}>
            {m.value}
            {m.unit && <span style={{ fontSize: 10, color: W.weak, marginLeft: 2, fontWeight: 500 }}>{m.unit}</span>}
          </div>
          <div style={{ fontSize: 10, color: W.weak, marginTop: 6, lineHeight: 1.3 }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

function FactorChips({ ids }: { ids: string[] }) {
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 14px',
      display: 'flex', flexWrap: 'wrap', gap: 6,
    }}>
      {ids.map((id) => {
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
  );
}

// ─── MISSING / FUTURE PLACEHOLDERS ─────────────────────────────
function MissingDayCard({ day, onFill, sessions }: {
  day: Day; onFill: () => void; sessions: BreathSession[];
}) {
  return (
    <>
      <div style={{
        background: W.paper, border: `1px dashed ${W.veryweak}`,
        borderRadius: 22, padding: '28px 22px 24px',
        textAlign: 'center',
        marginTop: 8,
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

function FutureDay({ day }: { day: Day }) {
  return (
    <div style={{
      background: W.paper, border: `1px dashed ${W.veryweak}`,
      borderRadius: 22, padding: '36px 22px',
      textAlign: 'center', marginTop: 8,
    }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{dayLabel(day.n)}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: W.ink, marginTop: 8 }}>Still ahead</div>
      <div style={{ fontSize: 13, color: W.weak, marginTop: 6, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
        Sleep happens here later. We'll log it when you do.
      </div>
    </div>
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

// ─── HELPERS: deterministic mock vitals from a journal entry ──
type Vitals = {
  restingHr: number;
  avgHr: number;
  hrLine: number[];
  respRate: number;
  timeToSleep: number;
  wakeUps: number;
  efficiency: number;
};

// Pulls a small int seed from the entry id so the same entry always
// shows the same numbers. mood ∈ [0,1] — happier mood translates into
// lower resting HR, better efficiency and faster sleep onset, the way
// the real metrics tend to move together.
function vitalsFor(entry: JournalEntry): Vitals {
  const seed = parseInt(entry.id.replace(/\D/g, '').slice(-3) || '0', 10) || 0;
  const mood = clamp01(entry.moodX);

  const restingHr = Math.round(56 + (1 - mood) * 10 + (seed % 5));
  const avgHr = restingHr + 3 + (seed % 4);
  const respRate = Math.round(13 + (1 - mood) * 2 + (seed % 2));
  const timeToSleep = Math.round(8 + (1 - mood) * 26 + (seed % 7));
  const wakeUps = Math.min(4, Math.max(0, Math.round((1 - mood) * 3 + (seed % 2 ? 1 : 0))));
  const efficiency = Math.max(78, Math.min(98, Math.round(86 + mood * 10 - (seed % 4))));

  // 13 samples across the night with a deepest dip near the middle —
  // matches the typical Apple Sleep heart-rate curve where HR drops
  // through the first sleep cycles and rises near wake.
  const hrLine = Array.from({ length: 13 }, (_, i) => {
    const phase = i / 12;
    const dip = Math.sin(phase * Math.PI);
    const wobble = Math.sin(i * 1.7 + seed) * 1.4;
    return restingHr - dip * 7 + wobble;
  });

  return { restingHr, avgHr, hrLine, respRate, timeToSleep, wakeUps, efficiency };
}

// Stage breakdown — also deterministic from the entry. A great night
// favours Deep + REM; a rough night skews toward Awake + light Core.
function stagesFor(entry: JournalEntry, _totalMin: number) {
  const mood = clamp01(entry.moodX);
  const awake = Math.round(5 + (1 - mood) * 10);
  const rem = Math.round(18 + mood * 8);
  const deep = Math.round(14 + mood * 6);
  const core = Math.max(0, 100 - (awake + rem + deep));
  return [
    { id: 'awake', label: 'Awake', pct: awake, color: '#FF8E7C' },
    { id: 'rem',   label: 'REM',   pct: rem,   color: '#8AA1FF' },
    { id: 'core',  label: 'Core',  pct: core,  color: '#B5C2FF' },
    { id: 'deep',  label: 'Deep',  pct: deep,  color: '#5C75D8' },
  ];
}

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

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
