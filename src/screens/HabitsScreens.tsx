import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad } from '../components/shared';
import { CheckIcon, HabitGlyph, PlusIcon } from '../components/icons';
import { useHabits, type HabitGlyphName } from '../state/store';

const HABIT_LIBRARY: { group: string; items: { glyph: HabitGlyphName; title: string }[] }[] = [
  { group: 'Wind down', items: [
    { glyph: 'tea', title: 'Have a cup of herbal tea' },
    { glyph: 'shower', title: 'Take a warm shower 60–90 min before bed' },
    { glyph: 'book', title: 'Read for 15 min or more' },
    { glyph: 'bulb', title: 'Dim lights 60–90 min before bed' },
    { glyph: 'phone', title: 'Unplug from socials 90 min before bed' },
    { glyph: 'breath', title: 'Inhale 4s, exhale 6s — repeat 5 times' },
  ]},
  { group: 'Mind', items: [
    { glyph: 'sparkle', title: 'Set your intentions for tomorrow' },
    { glyph: 'leaf', title: 'Journal 1 win + 1 lesson from today' },
    { glyph: 'pen', title: 'List 3 things you are grateful for' },
  ]},
  { group: 'Body', items: [
    { glyph: 'walk', title: 'Take a 10-minute walk after lunch' },
    { glyph: 'sun', title: 'Get 20 min of morning sunlight' },
    { glyph: 'drop', title: 'Stay hydrated throughout the day' },
    { glyph: 'cup', title: 'Skip caffeine for 90 min after waking' },
    { glyph: 'fork', title: 'Limit sugary snacks in the afternoon' },
  ]},
];

export function HabitLibrary() {
  const [list, setList] = useHabits();
  const has = (title: string) => list.some((h) => h.title === title);

  const add = (item: { glyph: HabitGlyphName; title: string }) => {
    if (has(item.title)) return;
    setList((l) => [...l, {
      id: `h-${Date.now()}`,
      glyph: item.glyph, title: item.title, done: false,
    }]);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font,
    }}>
      <TopPad />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px 6px' }}>
        <div onClick={() => go('home')} style={{
          width: 36, height: 36, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 22, color: W.ink,
        }}>×</div>
        <div style={{ fontSize: 12, color: W.weak, fontVariantNumeric: 'tabular-nums' }}>{list.length} added</div>
      </div>

      <div style={{ padding: '8px 22px 14px' }}>
        <div style={{ fontSize: 13, color: W.weak }}>Add a habit</div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 6 }}>
          Small wins make<br/>big changes.
        </div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 8, lineHeight: 1.5 }}>
          Pick rituals you'll actually do. You can edit or remove them anytime.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 24px' }}>
        {HABIT_LIBRARY.map((group) => (
          <div key={group.group} style={{ marginTop: 18 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: W.ink,
              padding: '0 4px 10px',
            }}>{group.group}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.items.map((item) => {
                const added = has(item.title);
                return (
                  <div key={item.title} onClick={() => add(item)} style={{
                    background: added ? W.fill : W.paper,
                    border: `1px solid ${added ? W.veryweak : W.fill}`,
                    borderRadius: 14, padding: '12px 12px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: added ? 'default' : 'pointer',
                    opacity: added ? 0.6 : 1,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: W.fill, border: `1px solid ${W.veryweak}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}><HabitGlyph name={item.glyph} size={20} stroke={W.ink} /></div>
                    <div style={{ flex: 1, fontSize: 14, lineHeight: 1.3 }}>{item.title}</div>
                    <div style={{
                      width: 26, height: 26, borderRadius: 13, flexShrink: 0,
                      border: `1px solid ${added ? W.ink : W.veryweak}`,
                      background: added ? W.ink : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: W.bg,
                    }}>{added ? <CheckIcon size={14} stroke={W.bg} /> : <PlusIcon size={14} stroke={W.weak} />}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{
          marginTop: 22, padding: '14px 16px',
          border: `1px dashed ${W.fill}`, borderRadius: 14,
          textAlign: 'center', color: W.weak, fontSize: 13,
        }}>+ Create a custom habit</div>
      </div>

      <div style={{ padding: '12px 16px 28px', background: W.bg }}>
        <div onClick={() => go('home')} style={{
          padding: '16px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Done</div>
      </div>
    </div>
  );
}

export function RoutineCheckIn() {
  const [list, setList] = useHabits();
  const toggle = (id: string) => setList((l) => l.map((h) => h.id === id ? { ...h, done: !h.done } : h));
  const doneCount = list.filter((h) => h.done).length;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `
        radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.32), transparent 50%),
        radial-gradient(1px 1px at 78% 14%, rgba(255,255,255,0.26), transparent 50%),
        radial-gradient(1px 1px at 32% 78%, rgba(255,255,255,0.22), transparent 50%),
        radial-gradient(1.2px 1.2px at 88% 64%, rgba(255,255,255,0.28), transparent 50%)`,
      }} />

      <TopPad />
      <div style={{ position: 'relative', padding: '6px 16px' }}>
        <div onClick={() => go('home')} style={{
          width: 36, height: 36, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 22, color: W.ink,
        }}>×</div>
      </div>

      <div style={{ position: 'relative', padding: '4px 22px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2, color: W.ink }}>
          Check the habits you<br/>completed tonight
        </div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>
          {doneCount} of {list.length} done
        </div>
        <div style={{
          margin: '12px auto 0', width: '70%', height: 3,
          background: W.fill, borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: list.length === 0 ? '0%' : `${(doneCount / list.length) * 100}%`,
            height: '100%', background: W.ink,
            transition: 'width .25s ease',
          }} />
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
        {list.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: W.weak, fontSize: 13 }}>
            No habits yet. Add some from the home screen.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map((h) => (
              <div key={h.id} onClick={() => toggle(h.id)} style={{
                background: W.paper, border: `1px solid ${W.fill}`,
                borderRadius: 14, padding: '14px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: W.fill, border: `1px solid ${W.veryweak}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  opacity: h.done ? 0.55 : 1,
                }}><HabitGlyph name={h.glyph} size={20} stroke={W.ink} /></div>
                <div style={{
                  flex: 1, fontSize: 14, lineHeight: 1.3,
                  opacity: h.done ? 0.5 : 1,
                  textDecoration: h.done ? 'line-through' : 'none',
                  textDecorationColor: W.weak,
                }}>{h.title}</div>
                <div style={{
                  width: 26, height: 26, borderRadius: 13, flexShrink: 0,
                  border: `1.5px ${h.done ? 'solid' : 'dashed'} ${h.done ? W.ink : W.veryweak}`,
                  background: h.done ? W.ink : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{h.done && <CheckIcon size={14} stroke={W.bg} />}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', padding: '12px 16px 28px', background: W.bg }}>
        <div onClick={() => go('home')} style={{
          padding: '16px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Save progress</div>
        <div style={{
          textAlign: 'center', fontSize: 12, color: W.weak,
          marginTop: 10, padding: '0 24px', lineHeight: 1.5,
        }}>
          It's okay if you don't complete them all — you're here, and that's what counts.
        </div>
      </div>
    </div>
  );
}
