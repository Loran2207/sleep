import { useEffect, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { StickyTopBar, DayStrip, LiquidGlassNav, type Day } from '../components/shared';
import { HabitGlyph } from '../components/icons';
import { MoodFace } from '../components/MoodFace';
import { useEditingJournalId, useJournal, useBreathSessions, type JournalEntry, type BreathSession } from '../state/store';
import { lookupFactor } from '../data/factors';
import { readMood } from '../data/mood';
import { DAYS as days, TODAY_IDX as todayIdx, dayToDate, dayLabel } from '../data/days';

const moodColor: Record<string, string> = {
  great: '#7FE3A1', good: '#9BE3B8', meh: '#E5E067', bad: '#E59A6F', awful: '#E57070',
};

export function Journal() {
  const { list, add } = useJournal();
  const breath = useBreathSessions();
  const [, setEditingId] = useEditingJournalId();
  const [selected, setSelected] = useState(todayIdx);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
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

  // Scroll the timeline when the user picks a day in the strip. If the day
  // has an entry, scroll it into view; if it's missing, jump to top so the
  // "fill in" card is visible.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    if (selectedEntry) {
      const target = root.querySelector<HTMLElement>(`[data-entry-id="${selectedEntry.id}"]`);
      if (target) {
        const y = target.offsetTop - 12;
        root.scrollTo({ top: y, behavior: 'smooth' });
        return;
      }
    }
    root.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selected, selectedEntry?.id]);

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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <StickyTopBar />

      <div style={{ paddingTop: 4 }}>
        <div ref={stripRef}>
          <DayStrip days={days} todayIdx={todayIdx} selectedIdx={selected} onSelect={setSelected} />
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 130px', WebkitOverflowScrolling: 'touch' }}>
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

      <LiquidGlassNav active="journal" />
    </div>
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
        color: '#7FC2FF',
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
      background: 'rgba(127,194,255,0.05)',
      border: '1px solid rgba(127,194,255,0.20)',
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
      background: 'radial-gradient(circle, #B8DCFF, rgba(127,194,255,0.35) 70%)',
      boxShadow: '0 0 6px rgba(127,194,255,0.6)',
      flexShrink: 0,
    }} />
  );
}
