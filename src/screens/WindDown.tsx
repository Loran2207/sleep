import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { startTracking, startBreathingThenTrack } from '../state/tracking';
import { TopPad, BackButton, Switch } from '../components/shared';
import { ChevronRightIcon, HabitGlyph, PlayIcon } from '../components/icons';
import {
  useEditingScheduleId, useSchedules, useSleepMode, useNapDuration,
  useMix, pickScheduleForDay,
} from '../state/store';
import { lookupSound } from '../data/sounds';

const TIMER_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: 'Off', minutes: null },
  { label: '15', minutes: 15 },
  { label: '30', minutes: 30 },
  { label: '45', minutes: 45 },
  { label: '60', minutes: 60 },
  { label: '90', minutes: 90 },
];

const NAP_OPTIONS = [10, 15, 20, 25, 30, 45, 60, 90];

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(h: number, m: number) { return `${pad(h)}:${pad(m)}`; }

function napWakeTime(durationMin: number) {
  const d = new Date(Date.now() + durationMin * 60_000);
  return fmt(d.getHours(), d.getMinutes());
}

// Wind down: a single, calm setup screen. Three toggle cards — Alarm,
// Sounds, Breathing — each collapses cleanly when off. One Continue:
// if Breathing is on it runs the 4-7-8 flow first, otherwise it goes
// straight to sleep tracking. (Nap mode keeps its own simple body.)
export function WindDown() {
  const [mode, setMode] = useSleepMode();

  function onContinue(breathing: boolean) {
    if (breathing) startBreathingThenTrack();
    else startTracking();
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000000', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <BackgroundGlow />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 14px', height: 44 }}>
        <BackButton onClick={() => go('home')} />
        <ModeToggle mode={mode} onChange={setMode} />
        <PresetsButton />
      </div>

      {mode === 'sleep' ? <SettingsStep onContinue={onContinue} /> : <NapBody />}
    </div>
  );
}

function PresetsButton() {
  return (
    <button onClick={() => go('track-mode')} aria-label="Presets" style={{
      height: 32, padding: '0 12px', borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.92)',
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 600, fontFamily: W.font,
      cursor: 'pointer', letterSpacing: 0.1,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h10M4 18h16" />
        <circle cx="17" cy="12" r="2.5" />
      </svg>
      Presets
    </button>
  );
}

function ModeToggle({ mode, onChange }: { mode: 'sleep' | 'nap'; onChange: (m: 'sleep' | 'nap') => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      padding: 3, borderRadius: 999,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
    }}>
      {(['sleep', 'nap'] as const).map((m) => {
        const active = mode === m;
        return (
          <div key={m} onClick={() => onChange(m)} style={{
            padding: '6px 14px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: active ? '#fff' : 'transparent',
            color: active ? '#000000' : 'rgba(255,255,255,0.75)',
            transition: 'background .12s ease, color .12s ease',
            letterSpacing: 0.1,
          }}>{m === 'sleep' ? 'Sleep' : 'Nap'}</div>
        );
      })}
    </div>
  );
}

// ─── Sleep setup — three toggle cards + Continue ────────────────
function SettingsStep({ onContinue }: { onContinue: (breathing: boolean) => void }) {
  const { list: schedules, update } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const [, setEditingId] = useEditingScheduleId();
  const { setAlarm } = useMix();

  const [hour, setHour] = useState(todaySchedule.wakeHour);
  const [minute, setMinute] = useState(todaySchedule.wakeMinute);
  const [alarmOn, setAlarmOn] = useState(true);
  const [soundsOn, setSoundsOn] = useState(todaySchedule.sounds.length > 0);
  const [breathingOn, setBreathingOn] = useState(true);

  // Keep the mix-store alarm in sync; clear it when the alarm is off.
  useEffect(() => {
    if (alarmOn) {
      setAlarm(fmt(hour, minute));
      update(todaySchedule.id, { wakeHour: hour, wakeMinute: minute });
    } else {
      setAlarm('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute, alarmOn]);

  const sleepEst = useMemo(() => {
    const bedMin = todaySchedule.bedHour * 60 + todaySchedule.bedMinute;
    const wakeMin = hour * 60 + minute;
    let diff = wakeMin - bedMin;
    if (diff <= 0) diff += 24 * 60;
    return diff;
  }, [hour, minute, todaySchedule.bedHour, todaySchedule.bedMinute]);
  const sleepH = Math.floor(sleepEst / 60);
  const sleepM = sleepEst % 60;

  const soundCount = todaySchedule.sounds.length;
  const summary = soundCount === 0 ? 'Pick something soft'
    : soundCount === 1 ? (lookupSound(todaySchedule.sounds[0].id)?.name ?? 'Sound')
    : `${soundCount} sounds layered`;

  function openMix() { setEditingId(todaySchedule.id); go('schedule-mix'); }
  function setTimer(min: number | null) { update(todaySchedule.id, { timerMin: min }); }

  return (
    <>
      <div style={{ position: 'relative', padding: '18px 22px 4px' }}>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Set up tonight</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>Three quick choices, then drift off.</div>
      </div>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '14px 16px 20px' }}>
        <ToggleCard icon={<AlarmIcon />} title="Alarm" on={alarmOn} onToggle={setAlarmOn}
          trailing={alarmOn ? fmt(hour, minute) : undefined}>
          {alarmOn ? (
            <>
              <WheelPicker hour={hour} minute={minute} onChange={(h, m) => { setHour(h); setMinute(m); }} />
              <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                ≈ <strong style={{ color: '#fff', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{sleepH}h {String(sleepM).padStart(2, '0')}m</strong> of sleep
              </div>
            </>
          ) : (
            <div style={hintStyle}>You'll wake naturally — no alarm.</div>
          )}
        </ToggleCard>

        <ToggleCard icon={<WavesIcon />} title="Sounds" on={soundsOn} onToggle={setSoundsOn}>
          {soundsOn ? (
            <>
              <div onClick={openMix} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 14px', cursor: 'pointer' }}>
                <SoundsGlyphStack ids={todaySchedule.sounds.map((s) => s.id)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
                  {soundCount > 0 && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {todaySchedule.sounds.map((s) => lookupSound(s.id)?.name ?? s.id).join(' · ')}
                    </div>
                  )}
                </div>
                <ChevronRightIcon size={16} stroke="rgba(255,255,255,0.55)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Stops after</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{todaySchedule.timerMin ? `${todaySchedule.timerMin} min` : 'until alarm'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                {TIMER_OPTIONS.map((opt) => {
                  const active = opt.minutes === todaySchedule.timerMin;
                  return (
                    <div key={opt.label} onClick={() => setTimer(opt.minutes)} style={{
                      padding: '9px 0', textAlign: 'center', borderRadius: 11,
                      background: active ? '#fff' : 'rgba(255,255,255,0.06)',
                      color: active ? '#000000' : 'rgba(255,255,255,0.85)',
                      border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.10)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
                      transition: 'background .12s ease, color .12s ease',
                    }}>{opt.label}</div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={hintStyle}>Fall asleep in silence.</div>
          )}
        </ToggleCard>

        <ToggleCard icon={<HabitGlyph name="breath" size={18} stroke="#fff" />} title="Wind-down breathing" on={breathingOn} onToggle={setBreathingOn}>
          <div style={hintStyle}>
            {breathingOn ? 'A 4-7-8 breath before we start — about 3 minutes.' : "We'll start tracking right away."}
          </div>
        </ToggleCard>
      </div>

      <div style={{
        padding: '12px 16px 24px', position: 'relative',
        background: 'linear-gradient(to top, rgba(0,0,0,0.96) 60%, transparent)',
      }}>
        <div onClick={() => onContinue(breathingOn)} style={primaryCtaStyle}>Continue</div>
      </div>
    </>
  );
}

function ToggleCard({ icon, title, trailing, on, onToggle, children }: {
  icon: ReactNode; title: string; trailing?: ReactNode;
  on: boolean; onToggle: (v: boolean) => void; children?: ReactNode;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, marginBottom: 12, overflow: 'hidden',
    }}>
      <div onClick={() => onToggle(!on)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: 'pointer' }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600 }}>{title}</div>
        {trailing != null && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontVariantNumeric: 'tabular-nums' }}>{trailing}</div>}
        <Switch on={on} onChange={onToggle} ariaLabel={title} />
      </div>
      {children != null && (
        <div style={{ padding: '12px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

const hintStyle: React.CSSProperties = {
  fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45,
};

function AlarmIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v3l2 1.5" />
      <path d="M5 3 2.5 5.5M19 3l2.5 2.5" />
    </svg>
  );
}

function WavesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="4" y1="10" x2="4" y2="14" />
      <line x1="8.5" y1="7" x2="8.5" y2="17" />
      <line x1="13" y1="4" x2="13" y2="20" />
      <line x1="17.5" y1="8" x2="17.5" y2="16" />
      <line x1="21" y1="10.5" x2="21" y2="13.5" />
    </svg>
  );
}

// ─── Apple-style time wheel ────────────────────────────────────
// Exported so the onboarding's "what time do you wake up?" step can
// reuse the exact same control instead of rebuilding it.
export function WheelPicker({ hour, minute, onChange }: {
  hour: number; minute: number;
  onChange: (h: number, m: number) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  function handleHour(v: number) { onChange(v, minute); }
  function handleMinute(v: number) { onChange(hour, v); }

  return (
    <div style={{
      position: 'relative', height: 160,
      display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 4,
    }}>
      <div aria-hidden style={{
        position: 'absolute', left: 8, right: 8, top: '50%',
        transform: 'translateY(-50%)', height: 44,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.07)',
        pointerEvents: 'none',
      }} />
      <WheelColumn options={hours} value={hour} onChange={handleHour} />
      <div style={{
        alignSelf: 'center', fontSize: 24, fontWeight: 500,
        fontVariantNumeric: 'tabular-nums', color: 'rgba(255,255,255,0.55)',
        lineHeight: 1, paddingBottom: 2,
      }}>:</div>
      <WheelColumn options={minutes} value={minute} onChange={handleMinute} />
    </div>
  );
}

function WheelColumn({ options, value, onChange }: {
  options: number[]; value: number; onChange: (v: number) => void;
}) {
  const ITEM_H = 36;
  const VISIBLE = 5;
  const HEIGHT = ITEM_H * VISIBLE;
  const PAD = ITEM_H * Math.floor(VISIBLE / 2);
  const ref = useRef<HTMLDivElement | null>(null);
  const lastReported = useRef<number>(value);
  const scrollRaf = useRef<number | null>(null);
  const programmaticScroll = useRef(false);

  function onScroll() {
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(options.length - 1, idx));
      const next = options[clamped];
      if (next !== lastReported.current && !programmaticScroll.current) {
        lastReported.current = next;
        onChange(next);
      }
    });
  }

  useEffect(() => {
    if (!ref.current) return;
    const idx = options.indexOf(value);
    if (idx < 0) return;
    const target = idx * ITEM_H;
    if (Math.abs(ref.current.scrollTop - target) < 1) return;
    programmaticScroll.current = true;
    lastReported.current = value;
    ref.current.scrollTo({ top: target, behavior: 'auto' });
    requestAnimationFrame(() => { programmaticScroll.current = false; });
  }, [value, options]);

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      style={{
        width: 72, height: HEIGHT,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        maskImage: 'linear-gradient(180deg, transparent, #000 22%, #000 78%, transparent)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 22%, #000 78%, transparent)',
      }}
    >
      <div style={{ height: PAD }} />
      {options.map((o) => {
        const active = o === value;
        return (
          <div key={o} style={{
            height: ITEM_H, scrollSnapAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: active ? 26 : 22, fontWeight: active ? 600 : 500,
            color: active ? '#fff' : 'rgba(255,255,255,0.45)',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
            lineHeight: 1,
            transition: 'color .12s ease, font-size .12s ease',
          }}>{pad(o)}</div>
        );
      })}
      <div style={{ height: PAD }} />
    </div>
  );
}

// ─── Nap mode body (unchanged single screen) ─────────────────────
function NapBody() {
  const [duration, setDuration] = useNapDuration();
  const { setAlarm } = useMix();

  const wake = napWakeTime(duration);

  function startNap() {
    setAlarm(wake);
    startTracking();
  }

  return (
    <>
      <div style={{ position: 'relative', padding: '20px 22px 8px' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Quick nap</div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 6 }}>
          Pick a length,<br />then close your eyes.
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5 }}>
          Wakes you at <strong style={{ color: '#fff', fontWeight: 600 }}>{wake}</strong>.
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '14px 16px 20px' }}>
        <SectionTitle>Duration</SectionTitle>
        <div style={{
          padding: '20px 16px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 22,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              fontSize: 64, fontWeight: 200, letterSpacing: '-0.04em',
              fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: '#fff',
            }}>{duration}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>minutes</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {NAP_OPTIONS.map((min) => {
              const active = duration === min;
              return (
                <div key={min} onClick={() => setDuration(min)} style={{
                  padding: '14px 0', textAlign: 'center', borderRadius: 14,
                  background: active ? '#fff' : 'rgba(255,255,255,0.06)',
                  color: active ? '#000000' : 'rgba(255,255,255,0.85)',
                  border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.10)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'background .12s ease, color .12s ease',
                }}>{min}</div>
              );
            })}
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: '14px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.45,
        }}>
          <HabitGlyph name="bulb" size={16} stroke="rgba(255,255,255,0.7)" />
          <span>20–30 min keeps you light. 60–90 min lets a full cycle finish without grogginess.</span>
        </div>
      </div>

      <div style={{
        padding: '12px 16px 24px', position: 'relative',
        background: 'linear-gradient(to top, rgba(0,0,0,0.96) 60%, transparent)',
      }}>
        <div onClick={startNap} style={{
          ...primaryCtaStyle,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <PlayIcon size={14} stroke="#000000" />
          Start nap · {duration} min
        </div>
      </div>
    </>
  );
}

const primaryCtaStyle: React.CSSProperties = {
  padding: '18px 0', textAlign: 'center',
  background: '#fff', color: '#000000',
  borderRadius: 999, fontSize: 16, fontWeight: 600, cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
};

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
            border: `2px solid ${last ? 'rgba(255,255,255,0.18)' : '#000000'}`,
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
