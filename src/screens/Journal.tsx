import { useEffect, useRef, useState } from 'react';
import { W } from '../tokens';
import { StickyTopBar, DayStrip, LiquidGlassNav, type Day } from '../components/shared';
import { MoodBlob } from '../components/icons';

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

type Entry =
  | { kind: 'note'; mood: 'great' | 'good' | 'meh' | 'bad' | 'awful'; when: string; text: string }
  | { kind: 'tag'; mood: 'great' | 'good' | 'meh' | 'bad' | 'awful'; when: string; label: string };

const entries: Entry[] = [
  { kind: 'note', mood: 'great', when: 'Today, 09:12',
    text: 'Took a morning stroll through Central Park. The air was so fresh and the sun felt amazing. Total connection with nature. Perfect way to start the day, feeling super recharged and ready for anything.' },
  { kind: 'tag', mood: 'great', label: 'Grateful', when: 'Today, 09:12' },
  { kind: 'note', mood: 'meh', when: '17 December, 23:12',
    text: 'Big presentation for the new launch next week. Honestly, I\'m freaking out a bit! I\'ve been staring at the slides for hours, but that "what if" voice won\'t shut up. Just need to breathe, visualize the win, and remember why I started.' },
  { kind: 'note', mood: 'good', when: '15 December, 21:40',
    text: 'Finally saw the sun after days of rain! It felt like the world was giving me a massive high-five. Just a reminder that the tough bits don\'t last forever. Things always get better if you just keep going.' },
  { kind: 'tag', mood: 'good', label: 'Calm', when: '15 December, 08:20' },
  { kind: 'note', mood: 'bad', when: '13 December, 22:05',
    text: 'Couldn\'t fall asleep again. Mind racing. Tried 4-7-8 breathing for ten minutes, helped a bit but still tossed for an hour after. Cutting caffeine after lunch from now on.' },
];

const moodColor: Record<string, string> = {
  great: '#7FE3A1', good: '#9BE3B8', meh: '#E5E067', bad: '#E59A6F', awful: '#E57070',
};

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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <StickyTopBar />

      <div style={{ paddingTop: 4 }}>
        <div ref={stripRef}>
          <DayStrip days={days} todayIdx={todayIdx} selectedIdx={selected} onSelect={setSelected} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 130px', WebkitOverflowScrolling: 'touch' }}>
        {entries.map((e, i) => {
          const c = moodColor[e.mood] || W.weak;
          const isLast = i === entries.length - 1;
          if (e.kind === 'tag') {
            return (
              <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                <div style={{ width: 12, position: 'relative', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 1.5, background: W.veryweak }} />
                </div>
                <div style={{ flex: 1, padding: '4px 0 18px' }}>
                  <div style={{
                    background: W.fill, borderRadius: 14, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    border: `1px solid ${W.veryweak}`,
                  }}>
                    <MoodBlob type={e.mood} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{e.label}</div>
                      <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>{e.when}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
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
                <div style={{ fontSize: 14, lineHeight: 1.5, color: W.ink }}>{e.text}</div>
                <div style={{ fontSize: 12, color: W.weak, marginTop: 6 }}>{e.when}</div>
              </div>
            </div>
          );
        })}
      </div>

      <LiquidGlassNav active="journal" />
    </div>
  );
}
