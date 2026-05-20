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
  useSchedules, pickScheduleForDay, useEditingScheduleId,
  type JournalEntry, type BreathSession,
} from '../state/store';
import { lookupFactor } from '../data/factors';
import { readMood } from '../data/mood';
import { DAYS as days, TODAY_IDX as todayIdx, dayToDate, dayLabel } from '../data/days';

// Journal is one continuous surface keyed by the day strip at the top.
// Picking a day swaps the body to that day's full read-out: mood,
// bedtime / wake, sleep duration with stages, factors, breath log.
// Today brings the countdown hero forward; missed days surface a
// fill-in card.
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
  const isToday = selected === todayIdx;
  const isFuture = selected > todayIdx;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad h={6} />
      <div ref={stripRef}>
        <DayStrip days={days} todayIdx={todayIdx} selectedIdx={selected} onSelect={setSelected} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ padding: '4px 16px 0' }}>
          {isFuture ? <FutureDay day={selectedDay} /> :
            isToday ? <TodayView /> : <PastDayView day={selectedDay} />}
        </div>
        <div style={{ height: 130 }} />
      </div>
      <LiquidGlassNav active="journal" />
    </div>
  );
}

// ─── TODAY ──────────────────────────────────────────────────────
function TodayView() {
  const { list: schedules } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const countdown = '4h 12m';
  const sleepEst = '8h 30m';
  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <>
      <CountdownHero
        bedtime={fmt(todaySchedule.bedHour, todaySchedule.bedMinute)}
        wake={fmt(todaySchedule.wakeHour, todaySchedule.wakeMinute)}
        countdown={countdown}
        sleepEst={sleepEst}
        scheduleId={todaySchedule.id}
      />

      <SectionTitle>Last night</SectionTitle>
      <LastNightCard />

      <SectionTitle>This week</SectionTitle>
      <SleepDurationChart />
    </>
  );
}

function CountdownHero({ bedtime, wake, countdown, sleepEst, scheduleId }: {
  bedtime: string; wake: string; countdown: string; sleepEst: string; scheduleId: string;
}) {
  const [, setEditingId] = useEditingScheduleId();
  function editSchedule() {
    setEditingId(scheduleId);
    go('sleep-schedule');
  }
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 22, padding: '24px 22px 22px',
      background: `
        radial-gradient(80% 70% at 50% 0%, rgba(122,105,240,0.22) 0%, rgba(122,105,240,0) 70%),
        linear-gradient(180deg, #16161D 0%, #0F0F14 100%)`,
      border: '1px solid rgba(122,105,240,0.22)',
      boxShadow: '0 14px 30px rgba(0,0,0,0.35)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 24,
      }}>
        <TimeSlot label="Bedtime" time={bedtime} caption={<>in <strong style={{ color: W.ink, fontWeight: 600 }}>{countdown}</strong></>} />
        <div onClick={editSchedule} aria-label="Edit schedule" style={{
          marginTop: 22,
          width: 30, height: 30, borderRadius: 15,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <PencilIcon size={14} stroke={W.ink} />
        </div>
        <TimeSlot label="Wake up" time={wake} caption={<>sleep ~ <strong style={{ color: W.ink, fontWeight: 600 }}>{sleepEst}</strong></>} />
      </div>
    </div>
  );
}

function TimeSlot({ label, time, caption }: { label: string; time: string; caption?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{
        fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em',
        lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: W.ink,
      }}>{time}</div>
      {caption && (
        <div style={{ marginTop: 8, fontSize: 12, color: W.weak, fontVariantNumeric: 'tabular-nums' }}>
          {caption}
        </div>
      )}
    </div>
  );
}

function LastNightCard() {
  const { list } = useJournal();
  // Newest entry with logged bed/wake times.
  const last = list.find((e) => e.bedTime && e.wakeTime);
  if (!last) {
    return (
      <div style={{
        background: W.paper, border: `1px dashed ${W.veryweak}`,
        borderRadius: 18, padding: '18px 16px',
        textAlign: 'center', color: W.weak, fontSize: 13,
      }}>
        No sleep logged yet. Start tracking tonight to see it here.
      </div>
    );
  }
  const reading = readMood(last.moodX, last.moodY);
  const totalMin = minutesBetween(last.bedTime!, last.wakeTime!);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '18px 18px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(70% 60% at 80% 0%, ${reading.tint}33, transparent 70%)`,
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
        <MoodFace tint={reading.tint} x={last.moodX} y={last.moodY} size={56} glow />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>{last.whenLabel}</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 3 }}>
            {reading.feeling}
          </div>
          <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>
            {last.bedTime} → {last.wakeTime} · {hh}h {String(mm).padStart(2, '0')}m
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAST DAY ───────────────────────────────────────────────────
function PastDayView({ day }: { day: Day }) {
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
  const hasSleep = entry.bedTime && entry.wakeTime;
  const totalMin = hasSleep ? minutesBetween(entry.bedTime!, entry.wakeTime!) : null;
  const hh = totalMin ? Math.floor(totalMin / 60) : 0;
  const mm = totalMin ? totalMin % 60 : 0;

  return (
    <>
      <DayHero day={day} entry={entry} reading={reading} onEditMood={openEntry} />

      {hasSleep && (
        <>
          <SectionTitle>Sleep</SectionTitle>
          <SleepDetailCard
            bed={entry.bedTime!}
            wake={entry.wakeTime!}
            hh={hh}
            mm={mm}
          />
          <SleepStagesCard />
        </>
      )}

      {entry.text && (
        <>
          <SectionTitle>Note</SectionTitle>
          <div onClick={openEntry} style={{
            background: W.paper, border: `1px solid ${W.fill}`,
            borderRadius: 18, padding: '16px 16px',
            fontSize: 14, lineHeight: 1.5, color: W.ink, cursor: 'pointer',
          }}>
            {entry.text}
          </div>
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
        <div onClick={onEditMood} aria-label="Edit"
          style={{
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

function SleepDetailCard({ bed, wake, hh, mm }: {
  bed: string; wake: string; hh: number; mm: number;
}) {
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '18px 16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Bed</div>
          <div style={{
            fontSize: 22, fontWeight: 600, marginTop: 4,
            fontVariantNumeric: 'tabular-nums', color: W.ink, letterSpacing: '-0.02em',
          }}>{bed}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Slept</div>
          <div style={{
            fontSize: 22, fontWeight: 600, marginTop: 4,
            fontVariantNumeric: 'tabular-nums', color: W.ink, letterSpacing: '-0.02em',
          }}>{hh}h {String(mm).padStart(2, '0')}m</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Wake</div>
          <div style={{
            fontSize: 22, fontWeight: 600, marginTop: 4,
            fontVariantNumeric: 'tabular-nums', color: W.ink, letterSpacing: '-0.02em',
          }}>{wake}</div>
        </div>
      </div>
    </div>
  );
}

// Mocked stage breakdown — real tracking would feed this from HealthKit
// (Awake / REM / Core / Deep). For the prototype we use a representative
// healthy adult breakdown so the chart has something to render.
function SleepStagesCard() {
  const stages = [
    { id: 'awake', label: 'Awake',  pct: 7,  color: '#FF8E7C' },
    { id: 'rem',   label: 'REM',    pct: 23, color: '#8AA1FF' },
    { id: 'core',  label: 'Core',   pct: 52, color: '#B5C2FF' },
    { id: 'deep',  label: 'Deep',   pct: 18, color: '#5C75D8' },
  ];
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 16px 16px',
      marginTop: 10,
    }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginBottom: 10 }}>Stages</div>
      <div style={{
        display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden',
        background: W.fill,
      }}>
        {stages.map((s) => (
          <div key={s.id} style={{ width: `${s.pct}%`, background: s.color, height: '100%' }} />
        ))}
      </div>
      <div style={{
        marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
      }}>
        {stages.map((s) => (
          <div key={s.id} style={{ textAlign: 'center' }}>
            <div style={{
              width: 8, height: 8, borderRadius: 2, background: s.color,
              margin: '0 auto 6px',
            }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: W.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.pct}%</div>
            <div style={{ fontSize: 11, color: W.weak, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
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

function MissingDayCard({ day, onFill, sessions }: {
  day: Day; onFill: () => void; sessions: BreathSession[];
}) {
  return (
    <>
      <div style={{
        background: W.paper, border: `1px dashed ${W.veryweak}`,
        borderRadius: 22, padding: '28px 22px 24px',
        textAlign: 'center',
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

// ─── FUTURE DAY ────────────────────────────────────────────────
function FutureDay({ day }: { day: Day }) {
  return (
    <div style={{
      background: W.paper, border: `1px dashed ${W.veryweak}`,
      borderRadius: 22, padding: '36px 22px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{dayLabel(day.n)}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: W.ink, marginTop: 8 }}>Still ahead</div>
      <div style={{ fontSize: 13, color: W.weak, marginTop: 6, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
        Sleep happens here later. We'll log it when you do.
      </div>
    </div>
  );
}

// ─── SHARED PIECES ─────────────────────────────────────────────
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
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
        lineHeight: 1,
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

// ─── WEEKLY DURATION CHART (under Today's countdown) ───────────
function SleepDurationChart() {
  const { list } = useJournal();
  const data = lastSevenDurations(list);
  const target = 8 * 60;
  const max = Math.max(target + 60, ...data.map((d) => d.min));

  const logged = data.filter((d) => d.min > 0);
  const avg = logged.length
    ? Math.round(logged.reduce((s, d) => s + d.min, 0) / logged.length)
    : 0;
  const avgHH = Math.floor(avg / 60);
  const avgMM = avg % 60;

  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '16px 14px 12px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '0 6px 12px',
      }}>
        <div>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Average</div>
          <div style={{
            fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: W.ink,
            fontVariantNumeric: 'tabular-nums', marginTop: 2, lineHeight: 1,
          }}>
            {avgHH}<span style={{ fontSize: 14, fontWeight: 500, color: W.weak }}>h</span> {String(avgMM).padStart(2, '0')}<span style={{ fontSize: 14, fontWeight: 500, color: W.weak }}>m</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Goal</div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: '#8AA1FF',
            fontVariantNumeric: 'tabular-nums', marginTop: 4,
          }}>8h</div>
        </div>
      </div>

      <div style={{
        position: 'relative', height: 100,
        display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: '0 6px 6px',
      }}>
        <div style={{
          position: 'absolute', left: 6, right: 6,
          bottom: 6 + (target / max) * (100 - 6),
          height: 1, background: 'rgba(138,161,255,0.32)',
          borderTop: '1px dashed rgba(138,161,255,0.55)',
          pointerEvents: 'none',
        }} />
        {data.map(({ day, min }) => {
          const h = max === 0 ? 0 : (min / max) * (100 - 6);
          const isToday = day.n === days[todayIdx].n;
          const hitTarget = min >= target;
          return (
            <div key={day.n} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              height: '100%', gap: 8,
            }}>
              <div style={{
                width: '100%', height: Math.max(2, h),
                borderRadius: 5,
                background: min === 0
                  ? 'rgba(255,255,255,0.06)'
                  : hitTarget
                    ? 'linear-gradient(180deg, #8AA1FF 0%, #5C75D8 100%)'
                    : 'linear-gradient(180deg, #FFC9C0 0%, #FF8E7C 100%)',
                boxShadow: min === 0 ? 'none' : '0 4px 12px rgba(0,0,0,0.35)',
                opacity: isToday ? 1 : 0.85,
              }} />
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex', gap: 8, padding: '8px 6px 0',
        fontSize: 10, color: W.weak, fontWeight: 500,
      }}>
        {data.map(({ day }) => (
          <div key={day.n} style={{ flex: 1, textAlign: 'center' }}>{day.dow}</div>
        ))}
      </div>
    </div>
  );
}

// Pull (date, durationMin) pairs for the last 7 days in chronological
// order. Days without an entry come out as 0 so the chart still
// reserves their column.
function lastSevenDurations(list: JournalEntry[]) {
  const slice = days.slice(Math.max(0, todayIdx - 6), todayIdx + 1);
  return slice.map((d) => {
    const e = list.find((x) => x.date === dayToDate(d.n));
    const min = e?.bedTime && e?.wakeTime ? minutesBetween(e.bedTime, e.wakeTime) : 0;
    return { day: d, min };
  });
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
