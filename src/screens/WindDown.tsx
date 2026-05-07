import { W } from '../tokens';
import { go } from '../state/navigation';
import { startTracking } from '../state/tracking';
import { TopPad } from '../components/shared';
import { CheckIcon, ChevronLeftIcon, HabitGlyph, PlayIcon } from '../components/icons';
import { useSchedules, pickScheduleForDay } from '../state/store';
import { lookupSound } from '../data/sounds';

// A short, fixed list of breathing-only practices. The wind-down screen
// intentionally doesn't allow custom habits — the goal is one calm path
// from "do something gentle" to "fall asleep".
const PRACTICES: { id: string; glyph: 'breath' | 'leaf'; title: string; sub: string; goal: string }[] = [
  { id: '478', glyph: 'breath', title: '4-7-8 breathing', sub: 'Inhale 4s · hold 7s · exhale 8s', goal: '5 cycles · ~3 min' },
  { id: 'reset', glyph: 'leaf', title: 'Mind reset', sub: 'Slow exhales to drop the day', goal: '2 min' },
];

export function WindDown() {
  const { list: schedules } = useSchedules();
  // Use the same weekday assumption as Home so the bedtime shown here
  // matches what the user just tapped from.
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const fmt = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const bedtime = fmt(todaySchedule.bedHour, todaySchedule.bedMinute);
  const wake = fmt(todaySchedule.wakeHour, todaySchedule.wakeMinute);

  const soundCount = todaySchedule.sounds.length;
  const soundSummary = soundCount === 0
    ? 'Silent'
    : soundCount === 1
      ? lookupSound(todaySchedule.sounds[0].id)?.name ?? 'Sound'
      : `${soundCount} sounds`;
  const timer = todaySchedule.timerMin
    ? `· stops in ${todaySchedule.timerMin} min`
    : '· until alarm';

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E1014', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <BackgroundGlow />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '4px 14px', height: 44 }}>
        <button onClick={() => go('home')} aria-label="Back" style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0,
        }}>
          <ChevronLeftIcon size={18} stroke="#fff" />
        </button>
      </div>

      <div style={{
        position: 'relative', padding: '20px 22px 8px',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Wind down</div>
        <div style={{
          fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 6,
        }}>
          A breath, then bed.
        </div>
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5,
        }}>
          Do something gentle, then start tracking. Bed at <strong style={{ color: '#fff', fontWeight: 600 }}>{bedtime}</strong>, wake at <strong style={{ color: '#fff', fontWeight: 600 }}>{wake}</strong>.
        </div>
      </div>

      <div style={{
        position: 'relative', flex: 1, overflowY: 'auto',
        padding: '14px 16px 20px',
      }}>
        <div style={{
          fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500,
          padding: '0 4px 8px',
        }}>Practices</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PRACTICES.map((p) => (
            <div
              key={p.id}
              onClick={() => go('practice-intro')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, padding: '14px 14px',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <HabitGlyph name={p.glyph} size={20} stroke="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{p.sub}</div>
              </div>
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums',
              }}>{p.goal}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 22,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: '14px 14px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CheckIcon size={20} stroke="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Tonight's mix</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, lineHeight: 1.2 }}>{soundSummary}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{timer}</div>
          </div>
        </div>
      </div>

      <div style={{
        padding: '12px 16px 28px', position: 'relative',
        background: 'linear-gradient(to top, rgba(14,16,20,0.96) 60%, transparent)',
      }}>
        <div onClick={() => startTracking()} style={{
          padding: '18px 0', textAlign: 'center',
          background: '#fff', color: '#0E1014',
          borderRadius: 999, fontSize: 16, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <PlayIcon size={14} stroke="#0E1014" />
          Start tracking
        </div>
      </div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `
        radial-gradient(80% 50% at 50% 8%, rgba(120,140,255,0.12), transparent 60%),
        radial-gradient(1px 1px at 18% 25%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 78% 18%, rgba(255,255,255,0.35), transparent 50%),
        radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.25), transparent 50%),
        radial-gradient(1.2px 1.2px at 88% 64%, rgba(255,255,255,0.28), transparent 50%)
      `,
    }} />
  );
}
