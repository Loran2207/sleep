import { useEffect, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { StickyTopBar, DayStrip, LiquidGlassNav, type Day } from '../components/shared';
import { HabitGlyph } from '../components/icons';
import { MoodFace } from '../components/MoodFace';
import { useEditingJournalId, useJournal, type JournalEntry } from '../state/store';
import { lookupFactor } from '../data/factors';
import { readMood } from '../data/mood';
import { DAYS as days, TODAY_IDX as todayIdx, dayToDate, dayLabel } from '../data/days';

export function Journal() {
  const { list, add } = useJournal();
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
  const isToday = selected === todayIdx;
  const isPast = selected <= todayIdx;

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

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 130px', WebkitOverflowScrolling: 'touch' }}>
        {selectedEntry ? (
          <DayEntryCard
            day={selectedDay}
            isToday={isToday}
            entry={selectedEntry}
            onEdit={() => openEntry(selectedEntry.id)}
          />
        ) : isPast ? (
          <MissingDayCard day={selectedDay} isToday={isToday} onFill={() => fillInDay(selectedDay)} />
        ) : (
          <FutureDayCard day={selectedDay} />
        )}
      </div>

      <LiquidGlassNav active="journal" />
    </div>
  );
}

function DayEntryCard({ day, isToday, entry, onEdit }: {
  day: Day;
  isToday: boolean;
  entry: JournalEntry;
  onEdit: () => void;
}) {
  const reading = readMood(entry.moodX, entry.moodY);
  const tint = reading.tint;
  return (
    <div onClick={onEdit} style={{
      position: 'relative', overflow: 'hidden',
      background: W.paper, border: `1px solid ${hexA(tint, 0.35)}`,
      borderRadius: 22, padding: '20px 18px 18px',
      cursor: 'pointer',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(70% 60% at 80% 0%, ${hexA(tint, 0.22)}, transparent 70%)`,
      }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
        <MoodFace tint={tint} x={entry.moodX} y={entry.moodY} size={72} glow />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>
            {isToday ? 'Today' : dayLabel(day.n)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 4 }}>
            {entry.feeling}
          </div>
          <div style={{ fontSize: 13, color: W.weak, marginTop: 2 }}>{entry.feelingDesc}</div>
        </div>
      </div>

      {(entry.bedTime || entry.wakeTime) && (
        <div style={{
          position: 'relative', marginTop: 18, display: 'flex',
          alignItems: 'flex-start', justifyContent: 'space-around', gap: 12,
        }}>
          <TimeSlot label="Bed" value={entry.bedTime ?? '—'} />
          {entry.bedTime && entry.wakeTime && (
            <div style={{ alignSelf: 'center', textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>Slept</div>
              <div style={{
                fontSize: 14, fontWeight: 600, marginTop: 4,
                fontVariantNumeric: 'tabular-nums', color: W.ink,
              }}>{durationBetween(entry.bedTime, entry.wakeTime)}</div>
            </div>
          )}
          <TimeSlot label="Wake" value={entry.wakeTime ?? '—'} />
        </div>
      )}

      {entry.text && (
        <div style={{
          position: 'relative', marginTop: 16,
          fontSize: 14, lineHeight: 1.5, color: W.ink,
        }}>{entry.text}</div>
      )}

      {entry.factors.length > 0 && (
        <div style={{
          position: 'relative', marginTop: 16, paddingTop: 14,
          borderTop: `1px solid ${W.fill}`,
          display: 'flex', flexWrap: 'wrap', gap: 6,
        }}>
          {entry.factors.map((id) => {
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
  );
}

function TimeSlot({ label, value }: { label: string; value: string }) {
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

function MissingDayCard({ day, isToday, onFill }: { day: Day; isToday: boolean; onFill: () => void }) {
  return (
    <div style={{
      background: W.paper, border: `1px dashed ${W.veryweak}`,
      borderRadius: 22, padding: '28px 22px 26px',
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
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginTop: 14 }}>
        {isToday ? 'Today' : dayLabel(day.n)}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em', marginTop: 4 }}>
        {isToday ? 'No entry yet for today' : 'Nothing logged for this day'}
      </div>
      <div style={{ fontSize: 13, color: W.weak, marginTop: 6, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
        Add when you went to bed, when you woke up and how you felt.
      </div>
      <div onClick={onFill} style={{
        display: 'inline-block', marginTop: 18,
        padding: '12px 24px', borderRadius: 999,
        background: W.ink, color: W.bg,
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      }}>Fill in</div>
    </div>
  );
}

function FutureDayCard({ day }: { day: Day }) {
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 22, padding: '32px 22px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{dayLabel(day.n)}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em', marginTop: 6 }}>
        Not here yet
      </div>
      <div style={{ fontSize: 13, color: W.weak, marginTop: 6, lineHeight: 1.5, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}>
        You'll be able to fill this in after the day's over.
      </div>
    </div>
  );
}

function durationBetween(bed: string, wake: string) {
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
