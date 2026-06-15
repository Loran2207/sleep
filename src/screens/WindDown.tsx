import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { startTracking, startBreathingThenTrack } from '../state/tracking';
import { TopPad, Switch, HeaderBar } from '../components/shared';
import { ChevronRightIcon, HabitGlyph } from '../components/icons';
import {
  useEditingScheduleId, useSchedules, useMix, pickScheduleForDay,
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

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(h: number, m: number) { return `${pad(h)}:${pad(m)}`; }

// Wind down: one calm setup screen — three toggle cards (Alarm, Sounds,
// Breathing) and a single context-aware Continue. A plain centred nav
// title sits up top; no tabs, no presets, no big heading.
export function WindDown() {
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
      <HeaderBar title="Tonight" onBack={() => go('home')} />
      <SettingsStep onContinue={onContinue} />
    </div>
  );
}

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
      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '10px 16px 20px' }}>
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
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>Sounds stop after</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                  {todaySchedule.timerMin ? `${todaySchedule.timerMin} min` : 'Until alarm'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {TIMER_OPTIONS.map((opt) => {
                  const active = opt.minutes === todaySchedule.timerMin;
                  return (
                    <div key={opt.label} onClick={() => setTimer(opt.minutes)} style={{
                      flex: 1, padding: '8px 0', textAlign: 'center', borderRadius: 10,
                      background: active ? '#fff' : 'rgba(255,255,255,0.06)',
                      color: active ? '#000000' : 'rgba(255,255,255,0.8)',
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

        <ToggleCard icon={<HabitGlyph name="breath" size={18} stroke="#fff" />} title="Breathing practice" on={breathingOn} onToggle={setBreathingOn}>
          <div style={hintStyle}>
            {breathingOn
              ? 'A 4-7-8 breathing practice runs before tracking begins.'
              : 'Off — tracking begins right after you continue.'}
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
// Exported so onboarding can reuse it. Container height matches the
// column (5 * 36 = 180) so the highlight band and the selected value
// share the same centre line — fixes the value sitting off-centre.
export function WheelPicker({ hour, minute, onChange }: {
  hour: number; minute: number;
  onChange: (h: number, m: number) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  return (
    <div style={{
      position: 'relative', height: 180,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    }}>
      <div aria-hidden style={{
        position: 'absolute', left: 8, right: 8, top: '50%',
        transform: 'translateY(-50%)', height: 44, borderRadius: 14,
        background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
      }} />
      <WheelColumn options={hours} value={hour} onChange={(v) => onChange(v, minute)} />
      <div style={{
        fontSize: 24, fontWeight: 500, fontVariantNumeric: 'tabular-nums',
        color: 'rgba(255,255,255,0.55)', lineHeight: 1, transform: 'translateY(-2px)',
      }}>:</div>
      <WheelColumn options={minutes} value={minute} onChange={(v) => onChange(hour, v)} />
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

  // Capture mode: html-to-design loses scroll position, so render a
  // static centred window (set by the screenshot harness only).
  if (typeof window !== 'undefined' && (window as { __sleepStaticWheel?: boolean }).__sleepStaticWheel) {
    const idx = options.indexOf(value);
    return (
      <div style={{ width: 72, height: HEIGHT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {[-2, -1, 0, 1, 2].map((d, i) => {
          const o = options[idx + d];
          if (o == null) return <div key={i} style={{ height: ITEM_H }} />;
          const active = d === 0;
          return (
            <div key={i} style={{
              height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: active ? 26 : 22, fontWeight: active ? 600 : 500,
              color: active ? '#fff' : 'rgba(255,255,255,0.45)',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', lineHeight: 1,
            }}>{pad(o)}</div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} onScroll={onScroll} style={{
      width: 72, height: HEIGHT, overflowY: 'scroll',
      scrollSnapType: 'y mandatory', scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch', position: 'relative',
      maskImage: 'linear-gradient(180deg, transparent, #000 22%, #000 78%, transparent)',
      WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 22%, #000 78%, transparent)',
    }}>
      <div style={{ height: PAD }} />
      {options.map((o) => {
        const active = o === value;
        return (
          <div key={o} style={{
            height: ITEM_H, scrollSnapAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: active ? 26 : 22, fontWeight: active ? 600 : 500,
            color: active ? '#fff' : 'rgba(255,255,255,0.45)',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', lineHeight: 1,
          }}>{pad(o)}</div>
        );
      })}
      <div style={{ height: PAD }} />
    </div>
  );
}

const primaryCtaStyle: React.CSSProperties = {
  padding: '18px 0', textAlign: 'center',
  background: '#fff', color: '#000000',
  borderRadius: 999, fontSize: 16, fontWeight: 600, cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
};

function SoundsGlyphStack({ ids }: { ids: string[] }) {
  const all = ids.map((id) => lookupSound(id)).filter(Boolean);
  const display = all.slice(0, 3);
  const overflow = all.length - display.length;

  if (display.length === 0) {
    return (
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)',
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
            width: TILE, height: TILE, borderRadius: 14, background: '#1F2128',
            border: `2px solid ${last ? 'rgba(255,255,255,0.18)' : '#000000'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: i, boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
          }}>
            <Glyph size={20} stroke="#fff" />
          </div>
        );
      })}
      {overflow > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: display.length * STEP,
          width: TILE, height: TILE, borderRadius: 14, background: '#1F2128',
          border: '2px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: display.length, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
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
