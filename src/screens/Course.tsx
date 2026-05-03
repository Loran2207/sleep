import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, LiquidGlassNav } from '../components/shared';
import { CheckIcon, ChevronLeftIcon, LockIcon, PlayIcon } from '../components/icons';

const lessons = [
  { n: 1, title: 'Why we sleep', dur: '2 min', state: 'done' as const },
  { n: 2, title: 'Sleep stages explained', dur: '3 min', state: 'done' as const },
  { n: 3, title: 'Sleep pressure & circadian rhythm', dur: '2 min', state: 'available' as const },
  { n: 4, title: 'Light & melatonin', dur: '2 min', state: 'locked' as const },
  { n: 5, title: 'Caffeine half-life', dur: '3 min', state: 'locked' as const },
  { n: 6, title: 'Sleep debt: real or myth?', dur: '2 min', state: 'locked' as const },
  { n: 7, title: 'Naps that work', dur: '2 min', state: 'locked' as const },
  { n: 8, title: 'Temperature & sleep', dur: '2 min', state: 'locked' as const },
];

export function CourseList() {
  const done = lessons.filter((l) => l.state === 'done').length;
  const total = 12;
  const pct = Math.round((done / total) * 100);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #1A1A1F 0%, #232328 55%, #2C2C32 100%)',
        color: '#fff',
        padding: '0 20px 28px',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 220, height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 65%)',
          pointerEvents: 'none',
        }} />
        <TopPad />
        <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>
          <button onClick={() => go('home')} aria-label="Back" style={{
            width: 36, height: 36, borderRadius: 18, border: 'none',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0,
          }}>
            <ChevronLeftIcon size={18} stroke="#fff" />
          </button>
        </div>

        <div style={{ marginTop: 8, position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Course · 12 lessons</div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1, marginTop: 6 }}>The Science<br/>of Sleep</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 10, lineHeight: 1.45, maxWidth: 320 }}>
            Short, evidence-based lessons on why sleep matters and how to make yours better.
          </div>
        </div>

        <div style={{ marginTop: 22, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>
            <span>{done} of {total} done · ~18 min left</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: '#fff' }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.14)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: '#fff' }} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 130px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: W.weak, padding: '0 6px 12px' }}>Lessons</div>
        {lessons.map((l, i) => {
          const isLocked = l.state === 'locked';
          const isDone = l.state === 'done';
          const isAvail = l.state === 'available';
          return (
            <div key={l.n} style={{ display: 'flex', alignItems: 'stretch', gap: 14 }}>
              <div style={{ width: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16,
                  border: isAvail ? `1.5px solid ${W.ink}` : `1.5px solid ${isLocked ? W.veryweak : W.ink}`,
                  background: isDone ? W.ink : (isAvail ? W.bg : W.paper),
                  color: isDone ? W.paper : (isLocked ? W.veryweak : W.ink),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {isDone ? <CheckIcon size={14} stroke={W.bg} />
                    : isLocked ? <LockIcon size={12} stroke={W.veryweak} />
                    : l.n}
                </div>
                {i < lessons.length - 1 && (
                  <div style={{ width: 1.5, flex: 1, background: isDone ? W.ink : W.veryweak, minHeight: 28, marginTop: 4 }} />
                )}
              </div>

              <div onClick={() => isAvail && go('lesson')} style={{
                flex: 1, marginBottom: 10, cursor: isAvail ? 'pointer' : 'default',
                background: isAvail ? W.paper : 'transparent',
                border: isAvail ? `1px solid ${W.fill}` : 'none',
                borderRadius: 16,
                padding: isAvail ? '14px 16px' : '14px 4px',
                boxShadow: isAvail ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                opacity: isLocked ? 0.55 : 1,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>
                    Lesson {l.n} · {l.dur}
                  </div>
                  <div style={{
                    fontSize: 15, fontWeight: 500, marginTop: 3,
                    textDecoration: isDone ? 'line-through' : 'none',
                    color: isDone ? W.weak : W.ink, lineHeight: 1.3,
                  }}>{l.title}</div>
                </div>
                {isAvail && (
                  <div style={{
                    width: 36, height: 36, borderRadius: 18, background: W.ink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}><PlayIcon size={13} stroke={W.paper} /></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <LiquidGlassNav active="home" />
    </div>
  );
}

export function Lesson() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#15151A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '80%', aspectRatio: '9 / 16', border: '2px dashed #555', borderRadius: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#888', fontSize: 13, gap: 8,
        }}>
          <PlayIcon size={36} stroke="#888" />
          <div>vertical video placeholder</div>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 2, padding: '60px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => go('course')} style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</div>
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
            <div style={{ width: '40%', height: '100%', background: W.ink, borderRadius: 2 }} />
          </div>
          <div style={{ color: '#fff', fontSize: 12 }}>0:48 / 2:00</div>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '20px 16px 40px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', color: '#fff',
      }}>
        <div style={{ fontSize: 11, opacity: 0.7 }}>Lesson 3 of 12</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>Sleep pressure & circadian rhythm</div>
        <div onClick={() => go('course')} style={{
          marginTop: 16, padding: '12px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Mark as completed →</div>
      </div>
    </div>
  );
}
