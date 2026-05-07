import { W } from '../tokens';
import { go } from '../state/navigation';
import { startTracking } from '../state/tracking';
import { TopPad } from '../components/shared';
import { ChevronLeftIcon, ChevronRightIcon, HabitGlyph, PlayIcon } from '../components/icons';
import { useEditingScheduleId, useSchedules, pickScheduleForDay } from '../state/store';
import { lookupSound } from '../data/sounds';

const TIMER_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: 'Off', minutes: null },
  { label: '15', minutes: 15 },
  { label: '30', minutes: 30 },
  { label: '45', minutes: 45 },
  { label: '60', minutes: 60 },
  { label: '90', minutes: 90 },
];

export function WindDown() {
  const { list: schedules, update } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const [, setEditingId] = useEditingScheduleId();

  const fmt = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const bedtime = fmt(todaySchedule.bedHour, todaySchedule.bedMinute);
  const wake = fmt(todaySchedule.wakeHour, todaySchedule.wakeMinute);

  const soundCount = todaySchedule.sounds.length;
  const summary = soundCount === 0
    ? 'Pick something soft'
    : soundCount === 1
      ? lookupSound(todaySchedule.sounds[0].id)?.name ?? 'Sound'
      : `${soundCount} sounds layered`;

  function openMix() {
    setEditingId(todaySchedule.id);
    go('schedule-mix');
  }

  function setTimer(min: number | null) {
    update(todaySchedule.id, { timerMin: min });
  }

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

      <div style={{ position: 'relative', padding: '20px 22px 8px' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Wind down</div>
        <div style={{
          fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 6,
        }}>
          A breath, then bed.
        </div>
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5,
        }}>
          Bed at <strong style={{ color: '#fff', fontWeight: 600 }}>{bedtime}</strong>, wake at <strong style={{ color: '#fff', fontWeight: 600 }}>{wake}</strong>.
        </div>
      </div>

      <div style={{
        position: 'relative', flex: 1, overflowY: 'auto', padding: '14px 16px 20px',
      }}>
        <SectionTitle>Practice</SectionTitle>
        <div
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
            <HabitGlyph name="breath" size={20} stroke="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>4-7-8 breathing</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>Inhale 4s · hold 7s · exhale 8s</div>
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums', marginRight: 4,
          }}>~3 min</div>
          <ChevronRightIcon size={16} stroke="rgba(255,255,255,0.55)" />
        </div>

        <SectionTitle>Sounds</SectionTitle>
        <div onClick={openMix} style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: '14px 14px',
          display: 'flex', alignItems: 'center', gap: 14,
          cursor: 'pointer',
        }}>
          <SoundsGlyphStack ids={todaySchedule.sounds.map((s) => s.id)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Tonight's mix</div>
            <div style={{
              fontSize: 14, fontWeight: 600, marginTop: 2, lineHeight: 1.2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{summary}</div>
            {soundCount > 0 && (
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {todaySchedule.sounds.map((s) => lookupSound(s.id)?.name ?? s.id).join(' · ')}
              </div>
            )}
          </div>
          <ChevronRightIcon size={16} stroke="rgba(255,255,255,0.55)" />
        </div>

        <SectionTitle>Timer</SectionTitle>
        <div style={{
          padding: '12px 12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 10px' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Sounds stop after</div>
            <div style={{
              fontSize: 13, fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: '#fff',
            }}>
              {todaySchedule.timerMin ? `${todaySchedule.timerMin} min` : 'until alarm'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {TIMER_OPTIONS.map((opt) => {
              const active = opt.minutes === todaySchedule.timerMin;
              return (
                <div key={opt.label} onClick={() => setTimer(opt.minutes)} style={{
                  padding: '10px 0', textAlign: 'center', borderRadius: 12,
                  background: active ? '#fff' : 'rgba(255,255,255,0.06)',
                  color: active ? '#0E1014' : 'rgba(255,255,255,0.85)',
                  border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.10)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'background .12s ease, color .12s ease',
                }}>{opt.label}</div>
              );
            })}
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500,
      padding: '18px 4px 8px',
    }}>{children}</div>
  );
}

function SoundsGlyphStack({ ids }: { ids: string[] }) {
  const all = ids.map((id) => lookupSound(id)).filter(Boolean);
  const display = all.slice(0, 3);
  const overflow = all.length - display.length;

  if (display.length === 0) {
    return (
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: 'rgba(255,255,255,0.6)', fontSize: 18,
      }}>♪</div>
    );
  }

  // Solid offset stack — each tile uses an opaque background that matches
  // the surrounding card (#1A1B1F is the card colour with a tiny lift) so
  // overlapping doesn't smear the semi-transparent layers.
  const TILE = 44;
  const STEP = 22;
  const width = TILE + (display.length - 1) * STEP + (overflow > 0 ? STEP : 0);

  return (
    <div style={{ position: 'relative', width, height: TILE, flexShrink: 0 }}>
      {display.map((s, i) => {
        const Glyph = s!.Glyph;
        const last = i === display.length - 1 && overflow === 0;
        return (
          <div key={s!.id} style={{
            position: 'absolute', top: 0, left: i * STEP,
            width: TILE, height: TILE, borderRadius: 14,
            background: '#1F2128',
            border: `2px solid ${last ? 'rgba(255,255,255,0.18)' : '#0E1014'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: i,
            boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
          }}>
            <Glyph size={20} stroke="#fff" />
          </div>
        );
      })}
      {overflow > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: display.length * STEP,
          width: TILE, height: TILE, borderRadius: 14,
          background: '#1F2128',
          border: '2px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: display.length,
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          fontVariantNumeric: 'tabular-nums',
        }}>+{overflow}</div>
      )}
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
