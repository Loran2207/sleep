import { useEffect, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { StickyTopBar, DayStrip, LiquidGlassNav, type Day } from '../components/shared';
import { HabitGlyph, MoodBlob } from '../components/icons';
import { useEditingJournalId, useJournal, type JournalEntry } from '../state/store';
import { lookupFactor } from '../data/factors';

const days: Day[] = [
  { dow: 'M', n: 9, mood: 'good' },
  { dow: 'T', n: 10, mood: 'meh' },
  { dow: 'W', n: 11, mood: 'great' },
  { dow: 'T', n: 12, mood: 'good' },
  { dow: 'F', n: 13, mood: 'bad' },
  { dow: 'S', n: 14, mood: 'great' },
  { dow: 'S', n: 15, mood: 'good' },
  { dow: 'M', n: 16, mood: 'meh' },
  { dow: 'T', n: 17, mood: 'good' },
  { dow: 'W', n: 18, mood: 'bad' },
  { dow: 'T', n: 19, mood: null },
  { dow: 'F', n: 20, mood: null },
  { dow: 'S', n: 21, mood: null },
  { dow: 'S', n: 22, mood: null },
];
const todayIdx = 10;

const moodColor: Record<string, string> = {
  great: '#7FE3A1', good: '#9BE3B8', meh: '#E5E067', bad: '#E59A6F', awful: '#E57070',
};

export function Journal() {
  const { list } = useJournal();
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

  function openEntry(id: string) {
    setEditingId(id);
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 130px', WebkitOverflowScrolling: 'touch' }}>
        {list.map((e, i) => (
          <EntryRow
            key={e.id}
            entry={e}
            isLast={i === list.length - 1}
            onClick={() => openEntry(e.id)}
          />
        ))}
        {list.length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign: 'center', color: W.weak, fontSize: 13,
          }}>No entries yet.</div>
        )}
      </div>

      <LiquidGlassNav active="journal" />
    </div>
  );
}

function EntryRow({ entry, isLast, onClick }: {
  entry: JournalEntry;
  isLast: boolean;
  onClick: () => void;
}) {
  const c = moodColor[entry.legacyMood] || W.weak;
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
            <MoodBlob type={entry.legacyMood} size={32} />
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
      </div>
    </div>
  );
}
