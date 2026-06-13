import { useEffect, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  GlyphPlay, GlyphPause, GlyphSliders,
} from '../components/icons';
import { TopPad, NavButton } from '../components/shared';
import { useMix, useSchedules, useSleepMode, useNapDuration, pickScheduleForDay } from '../state/store';
import { lookupSound } from '../data/sounds';
import { type QuickMix } from '../components/SoundMixerPanel';
import { SoundsMixerView, SoundsScreenBackdrop } from '../components/SoundsMixerView';

const TRACKING_QUICK_MIXES: QuickMix[] = [
  { id: 'rainy',   name: 'Rainy night', sounds: ['rain', 'thunder', 'chimes'] },
  { id: 'cabin',   name: 'Cabin',       sounds: ['campfire', 'forest', 'crickets'] },
  { id: 'ocean',   name: 'Open ocean',  sounds: ['ocean', 'seagull', 'wind'] },
  { id: 'quiet',   name: 'Just noise',  sounds: ['brown', 'whitenoise'] },
];

// ─── Tracking Active ─────────────────────────────────────────────
export function TrackingActive() {
  const { state, togglePlay, setAlarm } = useMix();
  const [mode] = useSleepMode();
  const [napDuration, setNapDuration] = useNapDuration();
  const { list: schedules, update: updateSchedule } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const timerMin = todaySchedule.timerMin;
  const [waketimeOpen, setWaketimeOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  // For nap mode, the alarm is now + duration. Keep alarm in sync if duration
  // is changed during the session.
  useEffect(() => {
    if (mode !== 'nap') return;
    const d = new Date(Date.now() + napDuration * 60_000);
    const next = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (next !== state.alarm) setAlarm(next);
    // Only re-run when duration changes — alarm is read-through.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, napDuration]);
  const [seconds, setSeconds] = useState(7 * 3600 + 12 * 60);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 60)), 6000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const mixSummary = state.mix.length === 0
    ? 'Silent'
    : state.mix.map((s) => lookupSound(s.id)?.name || s.id).join(', ');
  const mixTitle = state.mix.length === 0
    ? 'No sounds'
    : state.mix.length === 1 ? (lookupSound(state.mix[0].id)?.name || 'Sound') : 'Mix';

  const [now, setNow] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNow(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const [alarmRinging, setAlarmRinging] = useState(false);
  if (alarmRinging) {
    return (
      <AlarmRinging
        alarmTime={state.alarm}
        ringing={alarmRinging}
        onToggle={setAlarmRinging}
        onStop={() => { setAlarmRinging(false); go('wakeup-survey'); }}
        onSnooze={() => {
          setAlarmRinging(false);
          // Push the alarm 9 minutes ahead.
          const [h, m] = state.alarm.split(':').map(Number);
          const total = (h * 60 + m + 9) % (24 * 60);
          setAlarm(`${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`);
        }}
      />
    );
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000000', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `
        radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent 50%),
        radial-gradient(1px 1px at 70% 18%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 45% 60%, rgba(255,255,255,0.3), transparent 50%),
        radial-gradient(1.5px 1.5px at 85% 70%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.3), transparent 50%)`,
      }} />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', alignItems: 'center', gap: 12 }}>
        <div onClick={() => go('tracking-stop-confirm')} style={{ fontSize: 14, color: '#fff', cursor: 'pointer', opacity: 0.75 }}>End</div>
        <AlarmStateToggle ringing={alarmRinging} onChange={setAlarmRinging} />
      </div>

      <div style={{
        position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '8px 20px 12px', textAlign: 'center',
      }}>
        <SleepBreathingHalo />
        <div style={{
          fontSize: 88, fontWeight: 200, letterSpacing: -3,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          position: 'relative',
        }}>{now}</div>

        <div
          onClick={() => setWaketimeOpen(true)}
          style={{
            marginTop: 10, padding: '6px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            fontSize: 13, color: 'rgba(255,255,255,0.85)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer',
          }}
        >
          <span style={{ opacity: 0.7 }}>{mode === 'nap' ? 'Wakes in' : 'Alarm'}</span>
          <span style={{ color: '#fff', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {mode === 'nap' ? `${napDuration} min` : state.alarm}
          </span>
          <ChevDownTiny />
        </div>

        <div style={{ fontSize: 12, opacity: 0.45, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
          {mode === 'nap' ? `Wakes you at ${state.alarm}` : `Wakes you in ${h}h ${String(m).padStart(2, '0')}m`}
        </div>

        {mode === 'sleep' && (
          <div onClick={() => setTimerOpen(true)} style={{
            marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            fontSize: 11, color: 'rgba(255,255,255,0.75)',
            cursor: 'pointer',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" />
              <path d="M9 2h6" />
              <path d="M12 9v4l3 2" />
            </svg>
            {timerMin
              ? <>Sounds stop in <span style={{ color: '#fff', fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginLeft: 2 }}>{timerMin} min</span></>
              : <>Sounds play <span style={{ color: '#fff', fontWeight: 500, marginLeft: 2 }}>until alarm</span></>}
            <ChevDownTiny />
          </div>
        )}
      </div>

      {waketimeOpen && (
        <WakeTimeSheet
          mode={mode}
          alarm={state.alarm}
          napDuration={napDuration}
          onSelectAlarm={(t) => { setAlarm(t); setWaketimeOpen(false); }}
          onSelectDuration={(d) => { setNapDuration(d); setWaketimeOpen(false); }}
          onClose={() => setWaketimeOpen(false)}
        />
      )}
      {timerOpen && (
        <TimerSheet
          minutes={timerMin}
          onSelect={(min) => { updateSchedule(todaySchedule.id, { timerMin: min }); setTimerOpen(false); }}
          onClose={() => setTimerOpen(false)}
        />
      )}

      <div style={{ position: 'relative', padding: '0 14px' }}>
        <style>{`
          @keyframes track-bar {
            0%, 100% { transform: scaleY(0.35); }
            50% { transform: scaleY(1); }
          }
        `}</style>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 6px 8px 10px', borderRadius: 18,
          background: 'rgba(20,20,24,0.82)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(22px) saturate(160%)',
          WebkitBackdropFilter: 'blur(22px) saturate(160%)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.05) inset',
        }}>
          <DockBars playing={state.playing} />
          <div onClick={() => go('tracking-mixer')} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{mixTitle}</div>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{mixSummary}</div>
          </div>
          <div onClick={() => go('tracking-mixer')}
            aria-label="Open mixer"
            style={{
              width: 28, height: 28, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer', flexShrink: 0,
            }}>
            <GlyphSliders size={15} stroke="currentColor" />
          </div>
          <div onClick={togglePlay}
            aria-label={state.playing ? 'Pause' : 'Play'}
            style={{
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(255,255,255,0.94)', color: '#000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            }}>
            {state.playing
              ? <GlyphPause size={14} stroke="#000000" />
              : <GlyphPlay size={14} stroke="#000000" style={{ marginLeft: 2 }} />}
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative', padding: '18px 20px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div onClick={() => go('tracking-stop-confirm')} style={{
          padding: '12px 22px', borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.85)',
          fontSize: 13, cursor: 'pointer',
        }}>Quit tracking</div>
      </div>
    </div>
  );
}

// Top-right segment toggle to flip the tracking screen between the
// normal "sleeping" view and the alarm-ringing view. Mirrors the
// Sleep / Nap toggle on Wind down — small testing affordance for
// developers and reviewers.

// Visualiser chip on the in-bed dock — matches the bars in the global
// mini sounds player so the active-tracking dock reads as the same
// widget family.
function DockBars({ playing }: { playing: boolean }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 11,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.14)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {[0, 0.15, 0.3].map((d, i) => (
          <div key={i} style={{
            width: 2.5, height: 12, borderRadius: 1,
            background: 'rgba(255,255,255,0.88)',
            transformOrigin: 'center',
            animation: playing ? `track-bar 1.${3 + i}s ease-in-out infinite` : undefined,
            animationDelay: `${d}s`,
            transform: playing ? undefined : 'scaleY(0.28)',
            opacity: playing ? 1 : 0.45,
          }} />
        ))}
      </div>
    </div>
  );
}

function AlarmStateToggle({ ringing, onChange }: { ringing: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      padding: 3, borderRadius: 999,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
    }}>
      {(['sleeping', 'ringing'] as const).map((id) => {
        const active = (id === 'ringing') === ringing;
        return (
          <div key={id} onClick={() => onChange(id === 'ringing')} style={{
            padding: '6px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: active ? '#fff' : 'transparent',
            color: active ? '#000000' : 'rgba(255,255,255,0.75)',
            transition: 'background .12s ease, color .12s ease',
            letterSpacing: 0.1,
          }}>{id === 'sleeping' ? 'Sleeping' : 'Ringing'}</div>
        );
      })}
    </div>
  );
}

// ─── Tracking Mixer ─────────────────────────────────────────────
// All sound editing during tracking lives on this screen, powered by
// the shared SoundMixerPanel: per-sound volume sliders, remove,
// quick mixes, and an inline library — no more separate catalog hop.
export function TrackingMixer() {
  const mix = useMix();
  const { state, togglePlay } = mix;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000000', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <SoundsScreenBackdrop />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px' }}>
        <NavButton glyph="down" onClick={() => go('tracking-active')} />
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Mix</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ position: 'relative', flex: 1, padding: '0 20px 130px', overflowY: 'auto' }}>
        <SoundsMixerView
          binding={{
            mix: state.mix,
            setVol: mix.setVol,
            toggleSound: mix.toggleSound,
            removeSound: mix.removeSound,
            clearAll: mix.clearAll,
            setMixIds: mix.setMixIds,
            timerMin: state.timerMin,
            setTimer: mix.setTimer,
          }}
          playing={state.playing}
          timerMin={state.timerMin}
          quickMixes={TRACKING_QUICK_MIXES}
          emptyHint="Layer rain, fire, chimes — whatever puts you under. Each sound has its own volume."
        />
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 24px calc(28px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.88) 30%, #000000 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div onClick={togglePlay} style={{
          pointerEvents: 'auto',
          width: 64, height: 64, borderRadius: 32,
          background: '#fff', color: '#000000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 10px 26px rgba(0,0,0,0.45)',
        }}>
          {state.playing
            ? <GlyphPause size={22} stroke="#000000" />
            : <GlyphPlay size={22} stroke="#000000" style={{ marginLeft: 3 }} />}
        </div>
      </div>
    </div>
  );
}


// ─── Alarm ringing screen ───────────────────────────────────────
// Apple-style minimal: full-bleed dark canvas, a slow pulse around
// the time, the alarm time dominant, a small label, then a white
// "Stop" button and a quieter "Snooze 9 min" link beneath.
function AlarmRinging({ alarmTime, ringing, onToggle, onStop, onSnooze }: {
  alarmTime: string;
  ringing: boolean;
  onToggle: (v: boolean) => void;
  onStop: () => void;
  onSnooze: () => void;
}) {
  const today = new Date();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000000', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes alarm-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.55; }
          50%      { transform: translate(-50%, -50%) scale(1.18); opacity: 0; }
        }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, background: `
        radial-gradient(60% 40% at 50% 22%, rgba(255,196,120,0.10), transparent 70%),
        radial-gradient(1px 1px at 18% 28%, rgba(255,255,255,0.45), transparent 50%),
        radial-gradient(1px 1px at 78% 18%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 50% 60%, rgba(255,255,255,0.3), transparent 50%),
        radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.3), transparent 50%)`,
      }} />
      <TopPad />

      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '4px 20px', gap: 12,
      }}>
        <AlarmStateToggle ringing={ringing} onChange={onToggle} />
      </div>

      <div style={{
        position: 'relative', textAlign: 'center', padding: '8px 20px 0',
        fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
        letterSpacing: 0.2,
      }}>Alarm</div>

      <div style={{
        position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        {/* Three pulsing rings */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: 320, height: 320, pointerEvents: 'none',
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 220 + i * 60, height: 220 + i * 60,
              borderRadius: '50%',
              border: '1px solid rgba(255,196,120,0.45)',
              animation: 'alarm-pulse 2.4s ease-out infinite',
              animationDelay: `${i * 0.6}s`,
            }} />
          ))}
        </div>

        <div style={{
          position: 'relative',
          fontSize: 96, fontWeight: 200, letterSpacing: -3,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{alarmTime}</div>
        <div style={{
          position: 'relative', marginTop: 10,
          fontSize: 13, color: 'rgba(255,255,255,0.6)',
        }}>{dayName}</div>
      </div>

      <div style={{
        position: 'relative', padding: '16px 24px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <div onClick={onStop} style={{
          width: '100%', maxWidth: 320,
          padding: '18px 0', textAlign: 'center',
          background: '#fff', color: '#000000',
          borderRadius: 999, fontSize: 16, fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        }}>Stop</div>
        <div onClick={onSnooze} style={{
          fontSize: 14, color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', padding: '6px 14px',
        }}>Snooze · 9 min</div>
      </div>
    </div>
  );
}

// ─── v2: breathing halo behind the clock ────────────────────────
// Three concentric soft rings that breathe in / out at a slow pace,
// plus a few drifting particles. Pure CSS — no runtime cost beyond
// the keyframe animation.
function SleepBreathingHalo() {
  return (
    <>
      <style>{`
        @keyframes sleep-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.45; }
          50%      { transform: translate(-50%, -50%) scale(1.15); opacity: 0.05; }
        }
        @keyframes sleep-drift {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          20%  { opacity: 0.7; }
          100% { transform: translate(0, -90px) scale(0.6); opacity: 0; }
        }
      `}</style>
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 320, height: 320,
        pointerEvents: 'none',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 220 + i * 70, height: 220 + i * 70,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.18)',
            animation: `sleep-breathe 7.5s ease-in-out infinite`,
            animationDelay: `${i * 1.6}s`,
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const left = 18 + (i * 13) % 70;
          const delay = i * 1.4;
          return (
            <div key={i} style={{
              position: 'absolute', left: `${left}%`, top: '70%',
              width: 3, height: 3, borderRadius: 2,
              background: 'rgba(255,255,255,0.55)',
              animation: `sleep-drift 9s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }} />
          );
        })}
      </div>
    </>
  );
}

// ─── Tiny chevron used by chips ─────────────────────────────────
function ChevDownTiny() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ─── Wake-time sheet (alarm for sleep, duration for nap) ────────
function WakeTimeSheet({ mode, alarm, napDuration, onSelectAlarm, onSelectDuration, onClose }: {
  mode: 'sleep' | 'nap';
  alarm: string;
  napDuration: number;
  onSelectAlarm: (t: string) => void;
  onSelectDuration: (d: number) => void;
  onClose: () => void;
}) {
  const timeRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState(alarm);
  const NAP_OPTIONS = [10, 15, 20, 25, 30, 45, 60, 90];

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(8,9,12,0.55)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#000000',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 20px 28px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        color: '#fff', fontFamily: W.font,
        border: '1px solid rgba(255,255,255,0.06)',
        borderBottom: 'none',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.16)', margin: '0 auto 14px' }} />
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {mode === 'nap' ? 'Nap duration' : 'Wake-up time'}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 1.5 }}>
          {mode === 'nap'
            ? "Pick how long you'd like to rest."
            : 'Set the time you want the alarm to ring.'}
        </div>

        {mode === 'nap' ? (
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {NAP_OPTIONS.map((min) => {
              const active = napDuration === min;
              return (
                <div key={min} onClick={() => onSelectDuration(min)} style={{
                  padding: '14px 0', textAlign: 'center', borderRadius: 14,
                  background: active ? '#fff' : 'rgba(255,255,255,0.06)',
                  color: active ? '#000000' : 'rgba(255,255,255,0.85)',
                  border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.10)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontVariantNumeric: 'tabular-nums',
                }}>{min} min</div>
              );
            })}
          </div>
        ) : (
          <>
            <style>{`
              .alarm-time-input {
                width: 100%; box-sizing: border-box;
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.10);
                border-radius: 18px; padding: 22px 18px; margin-top: 16px;
                color: #fff; font: inherit; font-family: ${W.font};
                font-size: 44px; font-weight: 300; letter-spacing: -0.02em;
                font-variant-numeric: tabular-nums; line-height: 1;
                outline: none; cursor: pointer; text-align: center;
                color-scheme: dark; -webkit-appearance: none; appearance: none;
              }
              .alarm-time-input::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; }
            `}</style>
            <input
              ref={timeRef}
              type="time"
              className="alarm-time-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onClick={() => {
                const el = timeRef.current;
                if (!el) return;
                const sp = (el as unknown as { showPicker?: () => void }).showPicker;
                if (typeof sp === 'function') sp.call(el);
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <div onClick={onClose} style={{
                flex: 1, padding: '14px 0', textAlign: 'center',
                background: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999,
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>Cancel</div>
              <div onClick={() => onSelectAlarm(draft)} style={{
                flex: 2, padding: '14px 0', textAlign: 'center',
                background: '#fff', color: '#000000',
                borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Set alarm</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Timer sheet (sound stop after) ─────────────────────────────
function TimerSheet({ minutes, onSelect, onClose }: {
  minutes: number | null;
  onSelect: (m: number | null) => void;
  onClose: () => void;
}) {
  const TIMER_OPTIONS: { label: string; minutes: number | null }[] = [
    { label: 'Off', minutes: null },
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 },
    { label: '90 min', minutes: 90 },
  ];
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(8,9,12,0.55)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#000000',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 20px 28px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        color: '#fff', fontFamily: W.font,
        border: '1px solid rgba(255,255,255,0.06)',
        borderBottom: 'none',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.16)', margin: '0 auto 14px' }} />
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Sleep timer</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 1.5 }}>
          How long the sounds play before fading out.
        </div>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {TIMER_OPTIONS.map((opt) => {
            const active = opt.minutes === minutes;
            return (
              <div key={opt.label} onClick={() => onSelect(opt.minutes)} style={{
                padding: '14px 0', textAlign: 'center', borderRadius: 14,
                background: active ? '#fff' : 'rgba(255,255,255,0.06)',
                color: active ? '#000000' : 'rgba(255,255,255,0.85)',
                border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.10)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>{opt.label}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Stop confirm ───────────────────────────────────────────────
export function TrackingStopConfirm() {
  return (
    <div style={{ height: '100%', background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontFamily: W.font, color: W.ink }}>
      <div style={{
        background: W.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 0 32px',
      }}>
        <div style={{ width: 36, height: 4, background: W.veryweak, borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Stop tracking?</div>
          <div style={{ fontSize: 13, color: W.weak, marginTop: 8, lineHeight: 1.5 }}>
            We'll ask you a few quick questions about how you slept.
          </div>
        </div>
        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div onClick={() => go('wakeup-survey')} style={{
            padding: '14px 0', textAlign: 'center', background: W.ink, color: W.paper,
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>End & log</div>
          <div onClick={() => go('tracking-active')} style={{
            padding: '14px 0', textAlign: 'center', border: `1.5px solid ${W.veryweak}`,
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Keep tracking</div>
        </div>
      </div>
    </div>
  );
}
