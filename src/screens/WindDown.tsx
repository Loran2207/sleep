import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { startTracking, startBreathingThenTrack } from '../state/tracking';
import { TopPad, HeaderBar } from '../components/shared';
import { ChevronRightIcon, HabitGlyph } from '../components/icons';
import { CosmicBackdrop, COSMIC, hexA } from '../components/cosmic';
import {
  useEditingScheduleId, useSchedules, useMix, pickScheduleForDay,
} from '../state/store';
import { lookupSound } from '../data/sounds';

// Wind down wears the cosmic-blue language — the same world as the
// breathing practice. One calm setup screen, split into two quiet
// sections: "Wake up" holds the morning alarm, "Evening routine" holds
// the breathing practice and the sounds, explained once by a single
// caption so the cards stay almost text-free. A card opens its controls
// only when it has any (the alarm wheel, the sound mix + timer);
// everything else is just a titled row with a toggle.
const BLUE = COSMIC.blue.accent;
const BLUE_LIGHT = COSMIC.blue.light;
const ACTIVE_TEXT = '#04122B';

// Minutes the sounds keep playing before they fade. The unit lives on
// the pills (15m, 30m) so no separate value label is needed.
const TIMER_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: 'Off', minutes: null },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '60m', minutes: 60 },
  { label: '90m', minutes: 90 },
];

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(h: number, m: number) { return `${pad(h)}:${pad(m)}`; }

export function WindDown() {
  function onContinue(breathing: boolean) {
    if (breathing) startBreathingThenTrack();
    else startTracking();
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <CosmicBackdrop hue="blue" stars={26} />
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
  const [breathingOn, setBreathingOn] = useState(true);
  const [soundsOn, setSoundsOn] = useState(todaySchedule.sounds.length > 0);

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

  const names = todaySchedule.sounds.map((s) => lookupSound(s.id)?.name ?? s.id);
  const summary = names.length ? names.join(' · ') : 'Pick something soft';

  function openMix() { setEditingId(todaySchedule.id); go('schedule-mix'); }
  function setTimer(min: number | null) { update(todaySchedule.id, { timerMin: min }); }

  return (
    <>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', padding: '8px 16px 20px' }}>
        <SectionMini>Wake up</SectionMini>
        <ToggleCard icon={<AlarmIcon />} title="Alarm" on={alarmOn} onToggle={setAlarmOn}>
          {alarmOn ? (
            <>
              <WheelPicker hour={hour} minute={minute} accent={BLUE} onChange={(h, m) => { setHour(h); setMinute(m); }} />
              <div style={{ marginTop: 6, textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                ≈ <strong style={{ color: BLUE_LIGHT, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{sleepH}h {pad(sleepM)}m</strong> of sleep
              </div>
            </>
          ) : null}
        </ToggleCard>

        <SectionMini caption="Helps you wind down before tracking begins." style={{ marginTop: 22 }}>Evening routine</SectionMini>
        <ToggleCard icon={<HabitGlyph name="breath" size={18} stroke="currentColor" />} title="Breathing practice"
          on={breathingOn} onToggle={setBreathingOn} />

        <ToggleCard icon={<WavesIcon />} title="Sounds" on={soundsOn} onToggle={setSoundsOn}>
          {soundsOn ? (
            <>
              <div onClick={openMix} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 13px', cursor: 'pointer' }}>
                <SoundsGlyphStack ids={todaySchedule.sounds.map((s) => s.id)} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
                <ChevronRightIcon size={16} stroke="rgba(255,255,255,0.5)" />
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 2px' }}>Stops after</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {TIMER_OPTIONS.map((opt) => {
                  const active = opt.minutes === todaySchedule.timerMin;
                  return (
                    <div key={opt.label} onClick={() => setTimer(opt.minutes)} style={{
                      flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 11,
                      background: active ? BLUE : 'rgba(255,255,255,0.05)',
                      color: active ? ACTIVE_TEXT : 'rgba(255,255,255,0.75)',
                      border: `1px solid ${active ? BLUE : hexA(BLUE, 0.16)}`,
                      boxShadow: active ? `0 4px 14px ${hexA(BLUE, 0.32)}` : 'none',
                      fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
                    }}>{opt.label}</div>
                  );
                })}
              </div>
            </>
          ) : null}
        </ToggleCard>
      </div>

      <div style={{
        position: 'relative', zIndex: 1, padding: '12px 16px 24px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.96) 55%, transparent)',
      }}>
        <div onClick={() => onContinue(breathingOn)} style={primaryCtaStyle}>Continue</div>
      </div>
    </>
  );
}

// Quiet section label that splits the screen into its two blocks (Wake
// up / Evening routine). An optional one-line caption explains the whole
// block once, so the cards below need no sentence of their own.
function SectionMini({ children, caption, style }: { children: ReactNode; caption?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: '0 8px 10px', ...style }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.42)' }}>{children}</div>
      {caption && (
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', marginTop: 5, lineHeight: 1.4 }}>{caption}</div>
      )}
    </div>
  );
}

// Blue-tinted glass card. When on, the icon chip lights up in the accent
// and the body (if any) opens; when off, the card cools to a quiet grey
// row. Cards with no controls (breathing) are just the row.
function ToggleCard({ icon, title, trailing, on, onToggle, children }: {
  icon: ReactNode; title: string; trailing?: ReactNode;
  on: boolean; onToggle: (v: boolean) => void; children?: ReactNode;
}) {
  return (
    <div style={{
      background: on ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${on ? hexA(BLUE, 0.2) : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 22, marginBottom: 12, overflow: 'hidden',
      transition: 'border-color .2s ease, background .2s ease',
    }}>
      <div onClick={() => onToggle(!on)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', cursor: 'pointer' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: on ? `linear-gradient(140deg, ${hexA(BLUE, 0.55)}, ${hexA(BLUE, 0.14)})` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${on ? hexA(BLUE, 0.5) : 'rgba(255,255,255,0.1)'}`,
          boxShadow: on ? `inset 0 1px 8px ${hexA(BLUE, 0.3)}` : 'none',
          color: on ? BLUE_LIGHT : 'rgba(255,255,255,0.5)',
          transition: 'all .2s ease',
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 600, color: on ? '#fff' : 'rgba(255,255,255,0.8)' }}>{title}</div>
        {trailing != null && <div style={{ fontSize: 13, fontWeight: 600, color: BLUE_LIGHT, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>{trailing}</div>}
        <BlueSwitch on={on} onChange={onToggle} ariaLabel={title} />
      </div>
      {children != null && (
        <div style={{ padding: '12px 14px 15px', borderTop: `1px solid ${on ? hexA(BLUE, 0.1) : 'rgba(255,255,255,0.06)'}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Accent toggle — blue track + white knob with a soft glow when on, a
// quiet translucent track when off.
function BlueSwitch({ on, onChange, ariaLabel }: {
  on: boolean; onChange: (v: boolean) => void; ariaLabel?: string;
}) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(!on); }}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      style={{
        width: 46, height: 28, borderRadius: 14, padding: 3, flexShrink: 0, cursor: 'pointer',
        background: on ? `linear-gradient(135deg, ${BLUE}, ${hexA(BLUE, 0.72)})` : 'rgba(255,255,255,0.12)',
        border: `1px solid ${on ? hexA(BLUE, 0.9) : 'rgba(255,255,255,0.16)'}`,
        boxShadow: on ? `0 0 0 1px ${hexA(BLUE, 0.22)}, 0 6px 16px ${hexA(BLUE, 0.4)}` : 'inset 0 1px 2px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center',
        transition: 'background .2s ease, border-color .2s ease, box-shadow .2s ease',
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 11, background: '#fff',
        transform: on ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform .2s cubic-bezier(.3,.8,.3,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.45)',
      }} />
    </div>
  );
}

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
// share the same centre line. An optional accent tints the highlight
// band; without it the band stays the neutral wireframe grey.
export function WheelPicker({ hour, minute, accent, onChange }: {
  hour: number; minute: number; accent?: string;
  onChange: (h: number, m: number) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const band: React.CSSProperties = accent
    ? { background: hexA(accent, 0.14), border: `1px solid ${hexA(accent, 0.3)}` }
    : { background: 'rgba(255,255,255,0.07)', border: '1px solid transparent' };
  return (
    <div style={{
      position: 'relative', height: 180,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    }}>
      <div aria-hidden style={{
        position: 'absolute', left: 8, right: 8, top: '50%',
        transform: 'translateY(-50%)', height: 44, borderRadius: 14,
        ...band, pointerEvents: 'none',
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
        background: hexA(BLUE, 0.12), border: `1px solid ${hexA(BLUE, 0.28)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: BLUE_LIGHT, fontSize: 18,
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
            border: `2px solid ${last ? hexA(BLUE, 0.4) : '#000000'}`,
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
          border: `2px solid ${hexA(BLUE, 0.4)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: display.length, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          fontVariantNumeric: 'tabular-nums',
        }}>+{overflow}</div>
      )}
    </div>
  );
}
