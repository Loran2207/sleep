import { W } from '../tokens';
import { go } from '../state/navigation';
import { LiquidGlassNav, TopPad, HeaderAmbient } from '../components/shared';
import { CheckIcon, LockIcon, PlayIcon } from '../components/icons';
import { useCurrentLesson } from '../state/store';

type LessonState = 'done' | 'available' | 'locked';
type LessonItem = { n: number; title: string; dur: string; state: LessonState };

const lessons: LessonItem[] = [
  { n: 1, title: 'Why we sleep', dur: '2 min', state: 'done' },
  { n: 2, title: 'Sleep stages explained', dur: '3 min', state: 'done' },
  { n: 3, title: 'Sleep pressure & circadian rhythm', dur: '2 min', state: 'available' },
  { n: 4, title: 'Light & melatonin', dur: '2 min', state: 'locked' },
  { n: 5, title: 'Caffeine half-life', dur: '3 min', state: 'locked' },
  { n: 6, title: 'Sleep debt: real or myth?', dur: '2 min', state: 'locked' },
  { n: 7, title: 'Naps that work', dur: '2 min', state: 'locked' },
  { n: 8, title: 'Temperature & sleep', dur: '2 min', state: 'locked' },
];

export function CourseList() {
  const [, setCurrentLesson] = useCurrentLesson();
  const done = lessons.filter((l) => l.state === 'done').length;
  const total = 12;
  const pct = Math.round((done / total) * 100);

  function openLesson(l: LessonItem) {
    if (l.state === 'locked') return;
    setCurrentLesson(l.n);
    go('lesson');
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 190 }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          padding: '0 20px 28px',
        }}>
          <HeaderAmbient />
          <TopPad h={6} />

          <div style={{ position: 'relative', zIndex: 1, paddingTop: 14 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.16)',
              fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
              letterSpacing: 0,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 3,
                background: 'rgba(255,255,255,0.7)',
              }} />
              Course · 12 lessons
            </div>
            <div style={{
              fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1,
              marginTop: 14, color: '#fff',
            }}>The science<br />of sleep</div>
            <div style={{
              fontSize: 14, color: 'rgba(255,255,255,0.65)',
              marginTop: 10, lineHeight: 1.5, maxWidth: 320,
            }}>
              Short, evidence-based lessons on why sleep matters and how to make yours better.
            </div>
          </div>

          <div style={{ marginTop: 22, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
              <span>{done} of {total} done · ~18 min left</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: '#fff' }}>{pct}%</span>
            </div>
            <div style={{
              height: 5, background: 'rgba(255,255,255,0.08)',
              borderRadius: 3, overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 100%)',
              }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: W.weak, padding: '0 6px 12px' }}>Lessons</div>
        {lessons.map((l, i) => {
          const isLocked = l.state === 'locked';
          const isDone = l.state === 'done';
          const isAvail = l.state === 'available';
          const tappable = !isLocked;

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

              <div onClick={() => openLesson(l)} style={{
                flex: 1, marginBottom: 10, cursor: tappable ? 'pointer' : 'default',
                background: tappable ? W.paper : 'transparent',
                border: tappable ? `1px solid ${W.fill}` : 'none',
                borderRadius: 16,
                padding: tappable ? '14px 16px' : '14px 4px',
                boxShadow: isAvail ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                opacity: isLocked ? 0.55 : 1,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>
                    Lesson {l.n} · {l.dur}{isDone ? ' · watched' : ''}
                  </div>
                  <div style={{
                    fontSize: 15, fontWeight: 500, marginTop: 3,
                    color: isLocked ? W.weak : W.ink, lineHeight: 1.3,
                  }}>{l.title}</div>
                </div>
                {isAvail && (
                  <div style={{
                    width: 36, height: 36, borderRadius: 18, background: W.ink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}><PlayIcon size={13} stroke={W.paper} /></div>
                )}
                {isDone && (
                  <div aria-label="Re-watch" style={{
                    width: 36, height: 36, borderRadius: 18,
                    background: 'transparent', border: `1px solid ${W.fill}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}><PlayIcon size={12} stroke={W.ink} /></div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      <LiquidGlassNav active="course" />
    </div>
  );
}

export function Lesson() {
  const [currentN] = useCurrentLesson();
  const lesson = lessons.find((l) => l.n === currentN) ?? lessons[0];
  const totalShown = lessons.length;
  const isDone = lesson.state === 'done';
  // Approximate playback position — for a watched lesson assume the whole video,
  // for the in-progress lesson ~40% as before.
  const positionPct = isDone ? 100 : 40;

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
            <div style={{ width: `${positionPct}%`, height: '100%', background: W.ink, borderRadius: 2 }} />
          </div>
          <div style={{ color: '#fff', fontSize: 12 }}>
            {isDone ? lesson.dur : `0:48 / ${lesson.dur.replace(' min', ':00')}`}
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '20px 16px 40px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', color: '#fff',
      }}>
        <div style={{ fontSize: 11, opacity: 0.7 }}>
          Lesson {lesson.n} of {totalShown}{isDone ? ' · watched' : ''}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{lesson.title}</div>
        <div onClick={() => go('course')} style={{
          marginTop: 16, padding: '12px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>{isDone ? 'Back to course' : 'Mark as completed →'}</div>
      </div>
    </div>
  );
}
