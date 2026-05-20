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
import { readMood, moodToPosition } from '../data/mood';
import { DAYS as days, TODAY_IDX as todayIdx, dayToDate, dayLabel } from '../data/days';

const moodColor: Record<string, string> = {
  great: '#7FE3A1', good: '#9BE3B8', meh: '#E5E067', bad: '#E59A6F', awful: '#E57070',
};

// Journal is now the home of everything about how you've slept:
// today's countdown + tonight's schedule, a calendar of past entries,
// and trends derived from logged sleep. The three views live in one
// screen behind a tab switcher so the user never leaves Journal to
// see analytics.
type Tab = 'today' | 'calendar' | 'trends';

export function Journal() {
  const [tab, setTab] = useState<Tab>('today');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad h={12} />
      <Header tab={tab} setTab={setTab} />
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'today' && <TodayView />}
        {tab === 'calendar' && <CalendarView />}
        {tab === 'trends' && <TrendsView />}
        <div style={{ height: 130 }} />
      </div>
      <LiquidGlassNav active="journal" />
    </div>
  );
}

function Header({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div style={{ padding: '6px 16px 12px' }}>
      <div style={{
        fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: W.ink,
        padding: '6px 6px 14px',
      }}>Sleep journal</div>
      <SegmentedControl tab={tab} setTab={setTab} />
    </div>
  );
}

function SegmentedControl({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'trends', label: 'Trends' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3,
      background: W.paper, borderRadius: 12,
      border: `1px solid ${W.fill}`,
    }}>
      {tabs.map((t) => {
        const active = t.id === tab;
        return (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px 0', textAlign: 'center',
            background: active ? W.ink : 'transparent',
            color: active ? W.bg : W.ink,
            borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background .12s ease, color .12s ease',
            letterSpacing: 0.1,
          }}>{t.label}</div>
        );
      })}
    </div>
  );
}

// ─── TODAY VIEW ─────────────────────────────────────────────────
// The bedtime countdown moved here from the old Home dashboard.
// We bring back the same hero layout (bed time, wake time, edit
// schedule pencil) plus a quick read of tonight's sleep status.
function TodayView() {
  const { list: schedules } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const countdown = '4h 12m';
  const sleepEst = '8h 30m';

  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <div style={{ padding: '6px 16px 0' }}>
      <CountdownHero
        bedtime={fmt(todaySchedule.bedHour, todaySchedule.bedMinute)}
        wake={fmt(todaySchedule.wakeHour, todaySchedule.wakeMinute)}
        countdown={countdown}
        sleepEst={sleepEst}
        scheduleId={todaySchedule.id}
      />

      <SectionTitle>Last night</SectionTitle>
      <LastNightCard />

      <SectionTitle>Recent moods</SectionTitle>
      <RecentMoodStrip />
    </div>
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
  // Last entry that has a logged bed/wake — newest first.
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
  const tint = readMood(last.moodX, last.moodY).tint;
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
        background: `radial-gradient(70% 60% at 80% 0%, ${tint}33, transparent 70%)`,
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
        <MoodFace tint={tint} x={last.moodX} y={last.moodY} size={56} glow />
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

function RecentMoodStrip() {
  // Mood for the last 7 days. Mirrors the old day-strip on Home —
  // sized down and read-only so the user can glance the trajectory.
  const lastSeven = days.slice(Math.max(0, todayIdx - 6), todayIdx + 1);
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '4px 2px 4px',
      overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
    }}>
      {lastSeven.map((d) => {
        let face: React.ReactNode = null;
        if (d.mood) {
          const { x, y, tint } = moodToPosition(d.mood);
          face = <MoodFace x={x} y={y} tint={tint} size={32} />;
        } else {
          face = (
            <div style={{
              width: 32, height: 32, borderRadius: 16,
              background: W.paper, border: `1.5px solid ${W.veryweak}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={W.weak} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.1 9a3 3 0 1 1 4.9 2.3c-1 .7-2 1.5-2 2.7" />
                <circle cx="12" cy="17.5" r="0.6" fill={W.weak} stroke="none" />
              </svg>
            </div>
          );
        }
        return (
          <div key={d.n} style={{
            flex: '0 0 auto', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 6, minWidth: 38,
          }}>
            {face}
            <div style={{ fontSize: 10, color: W.weak, fontWeight: 500 }}>{d.dow}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CALENDAR VIEW ──────────────────────────────────────────────
// Same day-strip + entries timeline as before, just lifted into the
// segmented tab. The list-of-days surface (entries timeline) is what
// the user asked to keep so they can review past days.
function CalendarView() {
  const { list, add } = useJournal();
  const breath = useBreathSessions();
  const [, setEditingId] = useEditingJournalId();
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
  const selectedDate = dayToDate(selectedDay.n);
  const selectedEntry = list.find((e) => e.date === selectedDate);
  const isPast = selected <= todayIdx;
  const showMissing = isPast && !selectedEntry;

  function openEntry(id: string) {
    setEditingId(id);
    go('journal-entry');
  }

  function fillInDay(day: Day) {
    const date = dayToDate(day.n);
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

  return (
    <>
      <div ref={stripRef}>
        <DayStrip days={days} todayIdx={todayIdx} selectedIdx={selected} onSelect={setSelected} />
      </div>
      <div style={{ padding: '12px 20px 16px' }}>
        {showMissing && (
          <MissingDayInline
            day={selectedDay}
            onFill={() => fillInDay(selectedDay)}
            sessions={breath.forDate(selectedDate)}
          />
        )}
        {list.map((e, i) => (
          <div key={e.id} data-entry-id={e.id}>
            <EntryRow
              entry={e}
              isLast={i === list.length - 1}
              sessions={breath.forDate(e.date)}
              onClick={() => openEntry(e.id)}
            />
          </div>
        ))}
        {list.length === 0 && !showMissing && (
          <div style={{
            padding: '40px 20px', textAlign: 'center', color: W.weak, fontSize: 13,
          }}>No entries yet.</div>
        )}
      </div>
    </>
  );
}

function MissingDayInline({ day, onFill, sessions }: {
  day: Day;
  onFill: () => void;
  sessions: BreathSession[];
}) {
  const isToday = day.n === days[todayIdx].n;
  return (
    <div style={{
      marginBottom: 22,
      background: W.paper, border: `1px dashed ${W.veryweak}`,
      borderRadius: 22, padding: '24px 22px 22px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 32,
        margin: '0 auto',
        background: W.fill, border: `1.5px solid ${W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
          stroke={W.weak} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.1 9a3 3 0 1 1 4.9 2.3c-1 .7-2 1.5-2 2.7" />
          <circle cx="12" cy="17.5" r="0.7" fill={W.weak} stroke="none" />
        </svg>
      </div>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginTop: 14 }}>{dayLabel(day.n)}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em', marginTop: 4 }}>
        {isToday ? 'No entry yet for today' : 'Nothing logged for this day'}
      </div>
      <div style={{ fontSize: 13, color: W.weak, marginTop: 6, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
        Add when you went to bed, when you woke up and how you felt.
      </div>
      <div onClick={onFill} style={{
        display: 'inline-block', marginTop: 16,
        padding: '12px 22px', borderRadius: 999,
        background: W.ink, color: W.bg,
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      }}>Fill in</div>

      {sessions.length > 0 && (
        <div style={{ marginTop: 22, textAlign: 'left' }}>
          <BreathHistory sessions={sessions} />
        </div>
      )}
    </div>
  );
}

function EntryRow({ entry, isLast, sessions, onClick }: {
  entry: JournalEntry;
  isLast: boolean;
  sessions: BreathSession[];
  onClick: () => void;
}) {
  const c = moodColor[entry.legacyMood] || W.weak;
  const tint = readMood(entry.moodX, entry.moodY).tint;
  return (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
      <div style={{ width: 12, position: 'relative', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', left: 0, top: 6,
          width: 10, height: 10, borderRadius: 5, background: c,
          border: `2px solid ${W.bg}`, boxShadow: `0 0 0 1.5px ${c}`,
        }} />
        {!isLast && (
          <div style={{ position: 'absolute', left: 4, top: 18, bottom: -8, width: 1.5, background: W.veryweak }} />
        )}
      </div>
      <div style={{ flex: 1, padding: '0 0 22px' }}>
        {entry.text && (
          <div onClick={onClick} style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: W.ink }}>{entry.text}</div>
            <div style={{ fontSize: 12, color: W.weak, marginTop: 6 }}>{entry.whenLabel}</div>
          </div>
        )}
        <div onClick={onClick} style={{
          marginTop: entry.text ? 12 : 0,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          borderRadius: 14, padding: '12px 14px',
          cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MoodFace x={entry.moodX} y={entry.moodY} tint={tint} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: W.ink }}>{entry.feeling}</div>
              <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>{entry.whenLabel}</div>
            </div>
          </div>
          {entry.factors.length > 0 && (
            <div style={{
              marginTop: 10, paddingTop: 10, borderTop: `1px solid ${W.veryweak}`,
              display: 'flex', flexWrap: 'wrap', gap: 5,
            }}>
              {entry.factors.map((id) => {
                const f = lookupFactor(id);
                if (!f) return null;
                return (
                  <span key={id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 8px', borderRadius: 999,
                    background: 'transparent', border: `1px solid ${W.veryweak}`,
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
        {sessions.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <BreathHistory sessions={sessions} />
          </div>
        )}
      </div>
    </div>
  );
}

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
        color: '#8AA1FF',
        marginBottom: 8,
      }}>
        <BreathDot />
        <span>Breathing</span>
        <span style={{ color: W.weak, fontWeight: 500 }}>
          · {sessions.length} session{sessions.length === 1 ? '' : 's'} · {totalBreaths} breaths{totalMin > 0 ? ` · ${totalMin} min` : ''}
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
            <span style={{
              width: 5, height: 5, borderRadius: 3,
              background: tint ?? W.ink,
            }} />
            {FEELING_LABEL[session.feeling]}
          </span>
        )}
      </div>
      <div style={{
        marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      }}>
        <Metric value={session.cycles}            label="cycles" />
        <Metric value={`${mm}:${ss}`}             label="minutes" />
        <Metric value={session.breaths}           label="breaths" />
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

// ─── TRENDS VIEW ────────────────────────────────────────────────
// Minimal Apple Health-style summaries built from the journal data we
// already have. The metrics we surface — duration, time-asleep ratio,
// bedtime consistency, stages, mood — mirror what Apple's Sleep app
// shows on the Summary tab.
function TrendsView() {
  return (
    <div style={{ padding: '6px 16px 0' }}>
      <SectionTitle>Sleep duration · last 7 days</SectionTitle>
      <SleepDurationChart />

      <SectionTitle>Stages · last night</SectionTitle>
      <SleepStagesChart />

      <SectionTitle>Bedtime consistency</SectionTitle>
      <BedtimeConsistencyChart />

      <SectionTitle>Mood over time</SectionTitle>
      <MoodTrendChart />

      <SectionTitle>This week at a glance</SectionTitle>
      <WeekSummary />
    </div>
  );
}

// Returns minutes between two HH:MM strings. Handles bedTime > wakeTime
// (i.e. went to bed before midnight) by adding a day.
function minutesBetween(a: string, b: string) {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  let diff = (bh * 60 + bm) - (ah * 60 + am);
  if (diff < 0) diff += 24 * 60;
  return diff;
}

// Pulls (date, durationMin) pairs from the journal for the last 7 days
// in chronological order. Slots without a logged entry come out as 0
// so the chart still draws a gap.
function lastSevenDurations(list: JournalEntry[]) {
  const slice = days.slice(Math.max(0, todayIdx - 6), todayIdx + 1);
  return slice.map((d) => {
    const e = list.find((x) => x.date === dayToDate(d.n));
    const min = e?.bedTime && e?.wakeTime ? minutesBetween(e.bedTime, e.wakeTime) : 0;
    return { day: d, min };
  });
}

function SleepDurationChart() {
  const { list } = useJournal();
  const data = lastSevenDurations(list);
  const target = 8 * 60;
  const max = Math.max(target + 60, ...data.map((d) => d.min));

  // Average over days that have a logged entry — empty days shouldn't
  // drag the user's average down to zero.
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
            fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: W.ink,
            fontVariantNumeric: 'tabular-nums', marginTop: 2, lineHeight: 1,
          }}>
            {avgHH}<span style={{ fontSize: 16, fontWeight: 500, color: W.weak }}>h</span> {String(avgMM).padStart(2, '0')}<span style={{ fontSize: 16, fontWeight: 500, color: W.weak }}>m</span>
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
        position: 'relative', height: 120,
        display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: '0 6px 6px',
      }}>
        {/* Target line */}
        <div style={{
          position: 'absolute', left: 6, right: 6,
          bottom: 6 + (target / max) * (120 - 6),
          height: 1,
          background: 'rgba(138,161,255,0.32)',
          borderTop: '1px dashed rgba(138,161,255,0.55)',
          pointerEvents: 'none',
        }} />
        {data.map(({ day, min }) => {
          const h = max === 0 ? 0 : (min / max) * (120 - 6);
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

// Mock last-night stage breakdown — until tracking lands these are
// the same percentages Apple Sleep would show for a healthy adult.
function SleepStagesChart() {
  const stages = [
    { id: 'awake', label: 'Awake',  pct: 7,  color: '#FF8E7C' },
    { id: 'rem',   label: 'REM',    pct: 23, color: '#8AA1FF' },
    { id: 'core',  label: 'Core',   pct: 52, color: '#B5C2FF' },
    { id: 'deep',  label: 'Deep',   pct: 18, color: '#5C75D8' },
  ];
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '16px 16px',
    }}>
      <div style={{
        display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden',
        background: W.fill,
      }}>
        {stages.map((s) => (
          <div key={s.id} style={{
            width: `${s.pct}%`, background: s.color, height: '100%',
          }} />
        ))}
      </div>
      <div style={{
        marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
      }}>
        {stages.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: s.color, flexShrink: 0,
            }} />
            <div style={{ flex: 1, fontSize: 13, color: W.ink }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: W.ink, fontVariantNumeric: 'tabular-nums' }}>
              {s.pct}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BedtimeConsistencyChart() {
  // Plot bed and wake times for the last 7 days on a 24h horizontal
  // axis. Apple Health surfaces this as the "schedule" graph in the
  // Sleep tab — it highlights drift away from a stable bedtime.
  const { list } = useJournal();
  const slice = days.slice(Math.max(0, todayIdx - 6), todayIdx + 1);
  const entries = slice.map((d) => {
    const e = list.find((x) => x.date === dayToDate(d.n));
    if (!e?.bedTime || !e?.wakeTime) return { day: d, bedMin: null as number | null, wakeMin: null as number | null };
    const [bh, bm] = e.bedTime.split(':').map(Number);
    const [wh, wm] = e.wakeTime.split(':').map(Number);
    // Shift the 24h axis so it starts at 18:00 — bedtime sits in the
    // first third, wake in the last third, which matches Apple's chart.
    const shift = (mins: number) => (mins - 18 * 60 + 24 * 60) % (24 * 60);
    return { day: d, bedMin: shift(bh * 60 + bm), wakeMin: shift(wh * 60 + wm) };
  });

  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 16px 16px',
    }}>
      <div style={{ position: 'relative', padding: '4px 0 4px' }}>
        {/* Hour ticks */}
        <div style={{
          position: 'relative', height: 16,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, color: W.weak,
        }}>
          {['18:00', '00:00', '06:00', '12:00'].map((t) => (
            <span key={t} style={{ fontVariantNumeric: 'tabular-nums' }}>{t}</span>
          ))}
        </div>
        <div style={{ height: 1, background: W.fill, margin: '4px 0 12px' }} />

        {entries.map(({ day, bedMin, wakeMin }) => {
          const isToday = day.n === days[todayIdx].n;
          const total = 24 * 60;
          const bedPct = bedMin == null ? 0 : (bedMin / total) * 100;
          const wakePct = wakeMin == null ? 0 : (wakeMin / total) * 100;
          const width = Math.max(0, wakePct - bedPct);
          return (
            <div key={day.n} style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
            }}>
              <div style={{
                width: 22, fontSize: 11, color: isToday ? W.ink : W.weak,
                fontWeight: isToday ? 600 : 500,
              }}>{day.dow}</div>
              <div style={{
                flex: 1, height: 12, borderRadius: 6, position: 'relative',
                background: 'rgba(255,255,255,0.04)',
              }}>
                {bedMin != null && wakeMin != null && (
                  <div style={{
                    position: 'absolute',
                    left: `${bedPct}%`, width: `${width}%`,
                    top: 0, bottom: 0, borderRadius: 6,
                    background: 'linear-gradient(90deg, rgba(122,105,240,0.95), rgba(138,161,255,0.85))',
                    boxShadow: '0 2px 8px rgba(122,105,240,0.35)',
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MoodTrendChart() {
  const { list } = useJournal();
  const slice = days.slice(Math.max(0, todayIdx - 6), todayIdx + 1);
  const points = slice.map((d, i) => {
    const e = list.find((x) => x.date === dayToDate(d.n));
    // Combined "happiness × calm" — we use the entry's moodX since it
    // already maps low→high. Missing entries fall back to null and
    // create a gap in the line.
    return { i, day: d, val: e ? e.moodX : null };
  });

  const W_BOX = 320;
  const H_BOX = 110;
  const padX = 12;
  const padY = 14;
  const innerW = W_BOX - padX * 2;
  const innerH = H_BOX - padY * 2;

  function pointXY(idx: number, val: number) {
    const x = padX + (innerW * idx) / Math.max(1, points.length - 1);
    const y = padY + innerH * (1 - val);
    return { x, y };
  }

  const path = points
    .map((p, i) => {
      if (p.val == null) return null;
      const { x, y } = pointXY(i, p.val);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(' ');

  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '16px 12px 10px',
    }}>
      <svg viewBox={`0 0 ${W_BOX} ${H_BOX}`} width="100%" height={H_BOX} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E59A6F" />
            <stop offset="50%" stopColor="#E5E067" />
            <stop offset="100%" stopColor="#7FE3A1" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((y) => (
          <line key={y} x1={padX} x2={W_BOX - padX} y1={padY + innerH * y} y2={padY + innerH * y}
            stroke={W.fill} strokeWidth="1" strokeDasharray="3 4" />
        ))}
        {path && (
          <path d={path} stroke="url(#moodGradient)" strokeWidth="2.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        )}
        {points.map((p, i) => {
          if (p.val == null) return null;
          const { x, y } = pointXY(i, p.val);
          const isToday = p.day.n === days[todayIdx].n;
          return (
            <g key={p.day.n}>
              <circle cx={x} cy={y} r={isToday ? 5 : 4}
                fill={isToday ? '#fff' : moodColor[p.day.mood || 'meh'] || '#fff'}
                stroke="#0E0E11" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '4px 14px 0', fontSize: 10, color: W.weak, fontWeight: 500,
      }}>
        {points.map((p) => <span key={p.day.n}>{p.day.dow}</span>)}
      </div>
    </div>
  );
}

function WeekSummary() {
  const { list } = useJournal();
  const breath = useBreathSessions();
  const slice = days.slice(Math.max(0, todayIdx - 6), todayIdx + 1);
  const dates = slice.map((d) => dayToDate(d.n));

  const sessionsThisWeek = breath.list.filter((s) => dates.includes(s.date));
  const totalBreaths = sessionsThisWeek.reduce((s, x) => s + x.breaths, 0);
  const breathMinutes = Math.round(sessionsThisWeek.reduce((s, x) => s + x.durationSec, 0) / 60);

  const entriesThisWeek = list.filter((e) => dates.includes(e.date));
  const totalSleepMin = entriesThisWeek.reduce((sum, e) => {
    if (!e.bedTime || !e.wakeTime) return sum;
    return sum + minutesBetween(e.bedTime, e.wakeTime);
  }, 0);
  const totalH = Math.floor(totalSleepMin / 60);
  const totalM = totalSleepMin % 60;

  const items = [
    { label: 'Logged nights', value: `${entriesThisWeek.length}`, sub: 'of 7' },
    { label: 'Total sleep', value: `${totalH}h`, sub: `${String(totalM).padStart(2, '0')}m` },
    { label: 'Breath sessions', value: `${sessionsThisWeek.length}`, sub: `${totalBreaths} breaths` },
    { label: 'Breath minutes', value: `${breathMinutes}`, sub: 'min' },
  ];
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 14px',
      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14,
    }}>
      {items.map((it) => (
        <div key={it.label}>
          <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>{it.label}</div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 4,
            fontVariantNumeric: 'tabular-nums', marginTop: 3,
          }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: W.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {it.value}
            </div>
            <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{it.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
