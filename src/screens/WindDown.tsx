import { useEffect, useMemo, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { startTracking } from '../state/tracking';
import { TopPad } from '../components/shared';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, HabitGlyph, PlayIcon } from '../components/icons';
import {
  useEditingScheduleId, useSchedules, useSleepMode, useNapDuration,
  useMix, useWindDownStep, usePracticeDone, pickScheduleForDay,
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

export function WindDown() {
  const [mode, setMode] = useSleepMode();
  const [step, setStep] = useWindDownStep();

  function handleBack() {
    if (mode === 'sleep' && step > 1) setStep((step - 1) as 1 | 2 | 3);
    else go('home');
  }

  function switchMode(m: 'sleep' | 'nap') {
    setMode(m);
    setStep(1);
  }

  const totalSteps = 3;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E1014', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <BackgroundGlow />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 14px', height: 44 }}>
        <button onClick={handleBack} aria-label="Back" style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0,
        }}>
          <ChevronLeftIcon size={18} stroke="#fff" />
        </button>
        <ModeToggle mode={mode} onChange={switchMode} />
        <PresetsButton />
      </div>

      {mode === 'sleep' ? (
        step === 1 ? <RoutineStep onContinue={() => setStep(2)} />
        : step === 2 ? <AlarmStep onContinue={() => setStep(3)} />
        : <SoundsStep />
      ) : <NapBody />}

      {mode === 'sleep' && (
        <div style={{
          position: 'absolute', top: 56, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <StepDots current={step - 1} total={totalSteps} />
        </div>
      )}
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
            color: active ? '#0E1014' : 'rgba(255,255,255,0.75)',
            transition: 'background .12s ease, color .12s ease',
            letterSpacing: 0.1,
          }}>{m === 'sleep' ? 'Sleep' : 'Nap'}</div>
        );
      })}
    </div>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 5, borderRadius: 3,
          background: i <= current ? '#fff' : 'rgba(255,255,255,0.18)',
          transition: 'width .2s ease, background .2s ease',
        }} />
      ))}
    </div>
  );
}

// ─── Step 1 — your routine (just the breathing practice) ─────────
function RoutineStep({ onContinue }: { onContinue: () => void }) {
  const { list: schedules } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const bedtime = fmt(todaySchedule.bedHour, todaySchedule.bedMinute);
  const [practiceDone] = usePracticeDone();

  return (
    <>
      <div style={{ position: 'relative', padding: '32px 22px 8px' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Step 1 of 3</div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 6 }}>
          Your routine
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5 }}>
          Take a breath before bed. Tonight you're heading to bed at <strong style={{ color: '#fff', fontWeight: 600 }}>{bedtime}</strong>.
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '14px 16px 20px' }}>
        <SectionTitle>Practice</SectionTitle>
        <div onClick={() => go('practice-intro')} style={{
          ...cardStyle,
          border: practiceDone
            ? '1px solid rgba(127, 227, 161, 0.45)'
            : '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            ...iconBoxStyle,
            background: practiceDone ? '#7FE3A1' : iconBoxStyle.background,
            border: practiceDone ? '1px solid #7FE3A1' : iconBoxStyle.border,
          }}>
            {practiceDone
              ? <CheckIcon size={20} stroke="#0E1014" />
              : <HabitGlyph name="breath" size={20} stroke="#fff" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 15, fontWeight: 600, lineHeight: 1.2,
            }}>
              4-7-8 breathing
              {practiceDone && (
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  padding: '2px 7px', borderRadius: 999,
                  background: 'rgba(127,227,161,0.18)',
                  color: '#7FE3A1',
                  border: '1px solid rgba(127,227,161,0.35)',
                  letterSpacing: 0.2,
                }}>Done</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              {practiceDone ? 'Tap to redo' : 'Inhale 4s · hold 7s · exhale 8s'}
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', marginRight: 4 }}>~3 min</div>
          <ChevronRightIcon size={16} stroke="rgba(255,255,255,0.55)" />
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
          <span>Slow exhales activate the parasympathetic nervous system and drop your heart rate.</span>
        </div>
      </div>

      <div style={{
        padding: '12px 16px 24px', position: 'relative',
        background: 'linear-gradient(to top, rgba(14,16,20,0.96) 60%, transparent)',
      }}>
        {practiceDone ? (
          <div onClick={onContinue} style={primaryCtaStyle}>Continue to alarm</div>
        ) : (
          <>
            <div onClick={() => go('practice-intro')} style={{
              ...primaryCtaStyle,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <PlayIcon size={13} stroke="#0E1014" />
              Start practice
            </div>
            <div onClick={onContinue} style={{
              marginTop: 10, padding: '10px 0', textAlign: 'center',
              color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>Skip practice</div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Step 2 — wake-up alarm picker ──────────────────────────────
// Apple-style hour + minute wheel. The starting value seeds from
// today's scheduled wake-up, so a returning user only nudges the
// minute rather than starting from scratch.
function AlarmStep({ onContinue }: { onContinue: () => void }) {
  const { list: schedules, update } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const { setAlarm } = useMix();

  const [hour, setHour] = useState(todaySchedule.wakeHour);
  const [minute, setMinute] = useState(todaySchedule.wakeMinute);

  function commitAndContinue() {
    const alarm = fmt(hour, minute);
    setAlarm(alarm);
    update(todaySchedule.id, { wakeHour: hour, wakeMinute: minute });
    onContinue();
  }

  const sleepEst = useMemo(() => {
    const bedMin = todaySchedule.bedHour * 60 + todaySchedule.bedMinute;
    const wakeMin = hour * 60 + minute;
    let diff = wakeMin - bedMin;
    if (diff <= 0) diff += 24 * 60;
    return diff;
  }, [hour, minute, todaySchedule.bedHour, todaySchedule.bedMinute]);

  const sleepH = Math.floor(sleepEst / 60);
  const sleepM = sleepEst % 60;

  return (
    <>
      <div style={{ position: 'relative', padding: '32px 22px 8px' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Step 2 of 3</div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 6 }}>
          Set your alarm
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5 }}>
          When should we wake you?
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '24px 16px 12px' }}>
        <div style={{
          margin: '0 auto', maxWidth: 320,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 22, padding: '18px 16px',
          position: 'relative',
        }}>
          <WheelPicker hour={hour} minute={minute} onChange={(h, m) => { setHour(h); setMinute(m); }} />
          <div style={{
            marginTop: 14, textAlign: 'center',
            fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4,
          }}>
            ≈ <strong style={{ color: '#fff', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {sleepH}h {String(sleepM).padStart(2, '0')}m
            </strong> of sleep
          </div>
        </div>

        <div style={{
          marginTop: 18, padding: '14px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.45,
        }}>
          <HabitGlyph name="bulb" size={16} stroke="rgba(255,255,255,0.7)" />
          <span>Adults sleep best on 7–9 hours. Aim for a wake-up that lets a full cycle finish.</span>
        </div>
      </div>

      <div style={{
        padding: '12px 16px 24px', position: 'relative',
        background: 'linear-gradient(to top, rgba(14,16,20,0.96) 60%, transparent)',
      }}>
        <div onClick={commitAndContinue} style={primaryCtaStyle}>Continue to sounds</div>
      </div>
    </>
  );
}

// Apple-style time wheel: two scroll columns (hours + minutes) with
// snap, a steady center band, and items fading away from center.
function WheelPicker({ hour, minute, onChange }: {
  hour: number; minute: number;
  onChange: (h: number, m: number) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  function handleHour(v: number) { onChange(v, minute); }
  function handleMinute(v: number) { onChange(hour, v); }

  return (
    <div style={{
      position: 'relative', height: 180,
      display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 4,
    }}>
      {/* Center selection band */}
      <div aria-hidden style={{
        position: 'absolute', left: 14, right: 14, top: '50%',
        transform: 'translateY(-50%)', height: 36,
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        pointerEvents: 'none',
      }} />
      <WheelColumn options={hours} value={hour} onChange={handleHour} />
      <div style={{
        alignSelf: 'center', fontSize: 28, fontWeight: 600,
        fontVariantNumeric: 'tabular-nums', color: '#fff',
        opacity: 0.85, paddingBottom: 4,
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

  // Snap-scroll. Whenever the user stops scrolling, find the row that
  // lined up with the center band and report it back.
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

  // When the value changes externally (e.g. parent reset), realign.
  useEffect(() => {
    if (!ref.current) return;
    const idx = options.indexOf(value);
    if (idx < 0) return;
    const target = idx * ITEM_H;
    if (Math.abs(ref.current.scrollTop - target) < 1) return;
    programmaticScroll.current = true;
    lastReported.current = value;
    ref.current.scrollTo({ top: target, behavior: 'auto' });
    // Release the lock after a frame so user scrolls register again.
    requestAnimationFrame(() => { programmaticScroll.current = false; });
  }, [value, options]);

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      style={{
        width: 80, height: HEIGHT,
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
            color: active ? '#fff' : 'rgba(255,255,255,0.50)',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
            transition: 'color .12s ease, font-size .12s ease',
          }}>{pad(o)}</div>
        );
      })}
      <div style={{ height: PAD }} />
    </div>
  );
}

// ─── Step 3 — sounds + timer ─────────────────────────────────────
function SoundsStep() {
  const { list: schedules, update } = useSchedules();
  const todaySchedule = pickScheduleForDay(schedules, 4);
  const [, setEditingId] = useEditingScheduleId();

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
  function startSleepTracking() {
    startTracking();
  }

  return (
    <>
      <div style={{ position: 'relative', padding: '32px 22px 8px' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Step 3 of 3</div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 6 }}>
          Sounds & timer
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5 }}>
          Pick what plays while you fall asleep.
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '14px 16px 20px' }}>
        <SectionTitle>Mix</SectionTitle>
        <div onClick={openMix} style={cardStyle}>
          <SoundsGlyphStack ids={todaySchedule.sounds.map((s) => s.id)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Tonight's mix</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
            {soundCount > 0 && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {todaySchedule.sounds.map((s) => lookupSound(s.id)?.name ?? s.id).join(' · ')}
              </div>
            )}
          </div>
          <ChevronRightIcon size={16} stroke="rgba(255,255,255,0.55)" />
        </div>

        <SectionTitle>Timer</SectionTitle>
        <div style={{ padding: '12px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 10px' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Sounds stop after</div>
            <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#fff' }}>
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
        padding: '12px 16px 24px', position: 'relative',
        background: 'linear-gradient(to top, rgba(14,16,20,0.96) 60%, transparent)',
      }}>
        <div onClick={startSleepTracking} style={{
          ...primaryCtaStyle,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <PlayIcon size={14} stroke="#0E1014" />
          Start tracking
        </div>
      </div>
    </>
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
                  color: active ? '#0E1014' : 'rgba(255,255,255,0.85)',
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
        background: 'linear-gradient(to top, rgba(14,16,20,0.96) 60%, transparent)',
      }}>
        <div onClick={startNap} style={{
          ...primaryCtaStyle,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <PlayIcon size={14} stroke="#0E1014" />
          Start nap · {duration} min
        </div>
      </div>
    </>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18, padding: '14px 14px',
  display: 'flex', alignItems: 'center', gap: 14,
  cursor: 'pointer',
};

const iconBoxStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 14,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.10)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

const primaryCtaStyle: React.CSSProperties = {
  padding: '18px 0', textAlign: 'center',
  background: '#fff', color: '#0E1014',
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
