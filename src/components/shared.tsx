import type { CSSProperties, ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  ToolsFilled, JournalFilled, CourseFilled, ProfileFilled,
  ChevronRightIcon,
  type IconProps,
} from './icons';
import type { ScreenId } from '../tokens';
import type { MoodType } from './icons';
import { lookupSound } from '../data/sounds';
import { useNightShiftDone, useWindDownStep, usePracticeDone, useMix, useMiniPlayerHidden } from '../state/store';
import { useNavigation } from '../state/navigation';
import { CheckIcon, NightShiftIcon } from './icons';
import { MoodFace } from './MoodFace';
import { Avatar } from './Avatar';
import { moodToPosition } from '../data/mood';

// Small breathing pad above content. Adds iOS safe-area-inset-top so the
// system clock doesn't overlap content when the page runs as a PWA on iOS.
// On desktop / Android the inset evaluates to 0 and only `h` is used.
export function TopPad({ h = 8 }: { h?: number }) {
  return <div style={{ height: `calc(${h}px + env(safe-area-inset-top))`, flexShrink: 0 }} />;
}

// Welcome-style ambient for the top of a screen: a slow white glow in the
// top-right corner plus a few motes of light drifting up and down. Drop it
// as the first child of a position:relative, overflow:hidden screen and put
// the real content above it with zIndex.
export function HeaderAmbient({ height = 230 }: { height?: number }) {
  const motes = [
    { x: '18%', top: 120, dir: 'up', d: 0, dur: 11 },
    { x: '30%', top: 40, dir: 'dn', d: 3, dur: 13 },
    { x: '46%', top: 150, dir: 'up', d: 1.5, dur: 12 },
    { x: '62%', top: 30, dir: 'dn', d: 5, dur: 14 },
    { x: '72%', top: 130, dir: 'up', d: 2.5, dur: 11 },
    { x: '84%', top: 52, dir: 'dn', d: 6.5, dur: 15 },
    { x: '90%', top: 124, dir: 'up', d: 4, dur: 13 },
    { x: '10%', top: 60, dir: 'dn', d: 7.5, dur: 14 },
    { x: '54%', top: 112, dir: 'up', d: 8.5, dur: 12 },
    { x: '38%', top: 34, dir: 'dn', d: 2, dur: 16 },
  ];
  return (
    <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`
        @keyframes amb-glow { 0%, 100% { opacity: .5; } 50% { opacity: .9; } }
        @keyframes amb-mote-up { 0% { transform: translateY(0); opacity: 0; } 18% { opacity: .7; } 85% { opacity: .5; } 100% { transform: translateY(-130px); opacity: 0; } }
        @keyframes amb-mote-dn { 0% { transform: translateY(0); opacity: 0; } 18% { opacity: .7; } 85% { opacity: .5; } 100% { transform: translateY(130px); opacity: 0; } }
      `}</style>
      <div style={{
        position: 'absolute', top: -70, right: -50, width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,252,245,0.16), rgba(255,250,240,0.05) 44%, transparent 70%)',
        filter: 'blur(8px)', willChange: 'opacity', animation: 'amb-glow 12s ease-in-out infinite',
      }} />
      {motes.map((m, i) => (
        <div key={i} style={{
          position: 'absolute', left: m.x, top: m.top, width: 2.5, height: 2.5, borderRadius: 3,
          background: 'rgba(255,255,255,0.6)', willChange: 'transform, opacity',
          animation: `${m.dir === 'up' ? 'amb-mote-up' : 'amb-mote-dn'} ${m.dur}s ease-in-out ${m.d}s infinite`,
        }} />
      ))}
    </div>
  );
}

// Header bar for back-able subscreens
export function HeaderBar({ title, onBack, right }: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px', height: 44, fontFamily: W.font, flexShrink: 0,
    }}>
      <div onClick={onBack} style={{ minWidth: 64, fontSize: 14, color: W.ink, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        {onBack ? '← Back' : ''}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: W.ink }}>{title}</div>
      <div style={{ minWidth: 64, textAlign: 'right', fontSize: 14, color: W.weak }}>{right || ''}</div>
    </div>
  );
}

export function SectionHeader({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      padding: '12px 4px 10px', fontSize: 12, color: W.weak,
      fontWeight: 600, ...style,
    }}>{children}</div>
  );
}

export function SectionLabel({ children, inline = false, style = {} }: { children: ReactNode; inline?: boolean; style?: CSSProperties }) {
  return (
    <div style={{
      fontSize: 13, color: W.weak, fontWeight: 500,
      padding: inline ? 0 : '0 4px 10px',
      letterSpacing: 0,
      ...style,
    }}>{children}</div>
  );
}

export function SettingsCard({ icon, title, desc, onClick }: {
  icon: ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  const clickable = !!onClick;
  return (
    <div onClick={onClick} style={{
      background: W.paper, borderRadius: 18, padding: 16,
      display: 'flex', alignItems: 'flex-start', gap: 14,
      cursor: clickable ? 'pointer' : 'default',
      marginBottom: 10,
      border: `1px solid ${W.fill}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 20, background: W.fill,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.4 }}>{desc}</div>
      </div>
      {clickable && <ChevronRightIcon size={16} stroke={W.veryweak} />}
    </div>
  );
}

// ─── Liquid Glass bottom navigation ──────────────────────────────
// 4 tabs + a raised central "Go to sleep" action. The center button
// sits in a soft notch above the pill so it reads as the primary
// action, the way Instagram's "+" or a banking app's "Pay" does.
export type NavId = 'home' | 'journal' | 'course' | 'profile' | 'sleep';

export function LiquidGlassNav({ active = 'home' }: { active?: NavId | string }) {
  const tabs: { id: NavId; icon: (p: { size?: number; fill?: string }) => ReactNode; nav: ScreenId }[] = [
    { id: 'home', icon: ToolsFilled, nav: 'home' },
    { id: 'journal', icon: JournalFilled, nav: 'journal' },
    { id: 'course', icon: CourseFilled, nav: 'course' },
    { id: 'profile', icon: ProfileFilled, nav: 'profile' },
  ];
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);

  const [, setStep] = useWindDownStep();
  const [, setPracticeDone] = usePracticeDone();
  function openSleepFlow() {
    setStep(1);
    setPracticeDone(false);
    go('wind-down');
  }

  return (
    <>
      {/* Soft fade above the bottom UI stack so scrollable content
          doesn't bleed through the glass nav + floating mini player.
          Solid bg at the very bottom (under the nav), gradually
          transparent up to ~170px so it covers the area behind the
          pill and pearl FAB cleanly. */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 180, zIndex: 28, pointerEvents: 'none',
        background: 'linear-gradient(to top, #000000 0%, #000000 35%, rgba(0,0,0,0.72) 70%, rgba(0,0,0,0) 100%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 22, left: 14, right: 14, zIndex: 30,
        fontFamily: W.font,
      }}>
        <NavKeyframes />
        <div style={{ position: 'relative', height: 60 }}>
          {/* Pill */}
          <div style={{
          position: 'absolute', inset: 0,
          borderRadius: 30,
          background: 'rgba(0,0,0,0.62)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 10px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 30,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 55%)',
            pointerEvents: 'none',
          }} />
          <NavCluster items={left} active={active} />
          <div style={{ width: 76, flexShrink: 0 }} />
          <NavCluster items={right} active={active} />
        </div>

        {/* Central Go-to-Sleep FAB — pearl-white with a soft 3D shell. */}
        <div
          onClick={openSleepFlow}
          aria-label="Go to sleep"
          style={{
            position: 'absolute', left: '50%', top: -14,
            transform: 'translateX(-50%)',
            width: 64, height: 64, borderRadius: 32,
            cursor: 'pointer',
            background: `
              radial-gradient(circle at 32% 26%, #FFFFFF 0%, #F4F4F8 42%, #C8C8D2 100%)
            `,
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: `
              0 14px 28px rgba(0,0,0,0.55),
              0 6px 12px rgba(0,0,0,0.30),
              inset 0 2.5px 0 rgba(255,255,255,1),
              inset 0 -12px 24px rgba(150,150,170,0.55),
              inset 0 0 0 1px rgba(255,255,255,0.50)
            `,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2,
            transition: 'transform .15s ease, box-shadow .15s ease',
          }}
        >
          {/* Soft silver halo so the pearl sits in air, not on a card. */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: 36,
            background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
            animation: 'sleep-halo 3.4s ease-in-out infinite',
          }} />
          {/* Subtle highlight sheen baked into the top-left curve. */}
          <div aria-hidden style={{
            position: 'absolute', top: 5, left: 9, width: 22, height: 12,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none', filter: 'blur(1px)',
          }} />
          <SleepGlyph size={26} color={active === 'sleep' ? '#1A1A22' : '#2A2A33'} />
        </div>
        </div>
      </div>
    </>
  );
}

function NavCluster({ items, active }: { items: { id: NavId; icon: (p: { size?: number; fill?: string }) => ReactNode; nav: ScreenId }[]; active: NavId | string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      height: '100%', padding: '0 8px', position: 'relative', zIndex: 1,
    }}>
      {items.map((it) => {
        const isActive = it.id === active;
        return (
          <div
            key={it.id}
            onClick={() => go(it.nav)}
            style={{
              width: 56, height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{
              opacity: isActive ? 1 : 0.55,
              transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'opacity .15s ease, transform .15s ease',
            }}>
              <it.icon size={23} fill={W.ink} />
            </div>
            {isActive && (
              <div style={{
                position: 'absolute', bottom: 8, left: '50%',
                transform: 'translateX(-50%)',
                width: 4, height: 4, borderRadius: 2,
                background: W.ink,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Crescent moon used by the central sleep action.
function SleepGlyph({ size = 28, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z" />
    </svg>
  );
}

function NavKeyframes() {
  return (
    <style>{`
      @keyframes sleep-halo {
        0%, 100% { transform: scale(0.92); opacity: 0.7; }
        50% { transform: scale(1.05); opacity: 1; }
      }
    `}</style>
  );
}

// ─── Calendar strip ──────────────────────────────────────────────
export type Day = { dow: string; n: number; mood?: MoodType; sleep?: string | null };

export function DayStrip({
  days, todayIdx, selectedIdx, onSelect,
}: {
  days: Day[];
  todayIdx?: number;
  selectedIdx?: number;
  onSelect?: (i: number) => void;
}) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: '4px 12px 8px',
      fontFamily: W.font,
    }}>
      {days.map((d, i) => {
        const isSelected = i === selectedIdx;
        const isToday = i === todayIdx;
        const isFuture = todayIdx !== undefined && i > todayIdx;
        return (
          <div
            key={i}
            data-selected={isSelected}
            onClick={() => !isFuture && onSelect && onSelect(i)}
            style={{
              flex: 1, textAlign: 'center', cursor: isFuture ? 'default' : 'pointer',
              opacity: isFuture ? 0.32 : 1, minWidth: 0,
              padding: '8px 4px', borderRadius: 14,
              background: isSelected ? W.fill : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, lineHeight: 1 }}>{d.n}</div>
            <div style={{ fontSize: 10, color: W.weak, marginTop: 3, lineHeight: 1 }}>{d.dow}</div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', height: 28 }}>
              {isToday
                ? <div style={{ width: 8, height: 8, borderRadius: 4, background: W.ink, marginTop: 10 }} />
                : <DayMoodIcon mood={d.mood ?? null} isFuture={isFuture} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Renders the day-strip mood marker. Past day with no mood becomes a
// soft "?" pill — the user missed logging that day and can fill in
// later. Future days stay a plain dashed ring.
function DayMoodIcon({ mood, isFuture }: { mood: MoodType; isFuture: boolean }) {
  if (!mood) {
    if (isFuture) {
      return (
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          border: '1.5px dashed #3A3A40',
        }} />
      );
    }
    // Missed past day — a 28px paper pill with a soft question-mark
    // glyph sized to match the mood faces beside it.
    return (
      <div style={{
        width: 28, height: 28, borderRadius: 14,
        background: W.paper, border: `1.5px solid ${W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={W.weak} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.1 9a3 3 0 1 1 4.9 2.3c-1 .7-2 1.5-2 2.7" />
          <circle cx="12" cy="17.5" r="0.6" fill={W.weak} stroke="none" />
        </svg>
      </div>
    );
  }
  const { x, y, tint } = moodToPosition(mood);
  return <MoodFace x={x} y={y} tint={tint} size={28} />;
}

// ─── Top app bar ─────────────────────────────────────────────────
// Used on every primary navigated screen. Logo on the left,
// circular profile button on the right. `background` lets a
// screen blend the bar with its own banner — e.g., Course paints
// it the same colour as the gradient banner top.
export function StickyTopBar({ background }: { background?: string } = {}) {
  return (
    <div style={{
      flexShrink: 0,
      background: background ?? W.bg,
      position: 'relative', zIndex: 10,
    }}>
      <TopPad />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 18px 12px', gap: 12,
      }}>
        <div style={{
          fontSize: 22, fontWeight: 600, letterSpacing: -0.5,
          fontFamily: '"Times New Roman", Georgia, serif',
          fontStyle: 'italic', color: W.ink,
        }}>night</div>
        <div onClick={() => go('profile')} aria-label="Profile" style={{ cursor: 'pointer' }}>
          <Avatar name="Kirill Kuts" size={34} />
        </div>
      </div>
    </div>
  );
}

// Placeholder used by track-setup style screens
export function Row({ icon, label, value, onClick }: {
  icon: ReactNode; label: string; value: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 16, background: W.fill,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 13, color: W.weak }}>{value}</div>
      <ChevronRightIcon size={16} stroke={W.veryweak} />
    </div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: W.fill, marginLeft: 58 }} />;
}

// ─── Volume slider (used by mixer screens) ───────────────────────
import { useRef } from 'react';
export function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const setFromEvent = (e: PointerEvent | React.PointerEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : 0) - rect.left;
    const v = Math.max(0, Math.min(1, x / rect.width));
    onChange(v);
  };
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setFromEvent(e);
    const move = (ev: PointerEvent) => setFromEvent(ev);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div ref={ref} onPointerDown={onPointerDown} style={{
      position: 'relative', height: 22, cursor: 'pointer',
      display: 'flex', alignItems: 'center',
      touchAction: 'none',
    }}>
      <div style={{ height: 2, width: '100%', background: 'rgba(255,255,255,0.18)', borderRadius: 1 }} />
      <div style={{
        position: 'absolute', left: 0, height: 2,
        width: `${value * 100}%`, background: 'rgba(255,255,255,0.85)', borderRadius: 1,
      }} />
      <div style={{
        position: 'absolute', left: `calc(${value * 100}% - 8px)`,
        width: 16, height: 16, borderRadius: 8, background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
      }} />
    </div>
  );
}

// ─── Sleep timer chip + picker (used by both mixers) ─────────────
const TIMER_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: 'Off', minutes: null },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
  { label: '90 min', minutes: 90 },
];

export function TimerChip({ minutes, onClick, dark = false }: {
  minutes: number | null;
  onClick: () => void;
  dark?: boolean;
}) {
  const label = minutes ? `Timer · ${minutes} min` : 'Timer · off';
  return (
    <div onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
      fontSize: 12, fontWeight: 500,
      background: dark ? 'rgba(255,255,255,0.08)' : W.fill,
      color: dark ? 'rgba(255,255,255,0.85)' : W.ink,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : W.veryweak}`,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M9 2h6" />
        <path d="M12 9v4l3 2" />
      </svg>
      {label}
    </div>
  );
}

export function TimerPicker({ minutes, onSelect, onClose }: {
  minutes: number | null;
  onSelect: (m: number | null) => void;
  onClose: () => void;
}) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 70,
      background: 'rgba(8,9,12,0.55)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: W.bg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 20px 24px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.45)',
        color: W.ink, fontFamily: W.font,
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: W.fill, margin: '0 auto 14px',
        }} />
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Sleep timer</div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.5 }}>
          How long the sounds play before fading out.
        </div>

        <div style={{
          marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        }}>
          {TIMER_OPTIONS.map((opt) => {
            const active = opt.minutes === minutes;
            return (
              <div key={opt.label} onClick={() => onSelect(opt.minutes)} style={{
                padding: '14px 0', textAlign: 'center', borderRadius: 14,
                background: active ? W.ink : W.paper,
                color: active ? W.bg : W.ink,
                border: `1px solid ${active ? W.ink : W.fill}`,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'background .12s ease, color .12s ease',
              }}>{opt.label}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Night Shift card on the dashboard ──────────────────────────
// A slim row that opens a dedicated Night Shift guide screen.
// Shows a green check + "is on" copy when the user has marked the
// setting as enabled.
export function NightShiftCard() {
  const [done] = useNightShiftDone();
  return (
    <div onClick={() => go('night-shift-guide')} style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: 14, marginBottom: 10,
      display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 20,
        background: done ? '#7FE3A1' : W.fill,
        border: done ? '1px solid #7FE3A1' : `1px solid ${W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {done
          ? <CheckIcon size={18} stroke="#000000" />
          : <NightShiftIcon size={22} stroke={W.ink} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Night Shift</div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.4 }}>
          {done
            ? 'Marked as enabled · tap to review.'
            : 'Warms your screen after sunset. Tap to see how.'}
        </div>
      </div>
      <ChevronRightIcon size={16} stroke={W.weak} />
    </div>
  );
}

// ─── Sound tile (icon + label) ───────────────────────────────────
// Used by the schedule editor (single-select tile grid) and any
// place that needs the same look as the tracking sound catalog.
export function SoundTile({ id, selected, onClick }: {
  id: string;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = lookupSound(id);
  if (!meta) return null;
  const Glyph = meta.Glyph;
  return (
    <div onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 26,
        background: selected ? W.ink : W.paper,
        border: `1px solid ${selected ? W.ink : W.fill}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .12s ease, border-color .12s ease',
      }}>
        <Glyph size={20} stroke={selected ? W.bg : W.ink} />
      </div>
      <div style={{
        fontSize: 11, lineHeight: 1.2, textAlign: 'center',
        color: selected ? W.ink : W.weak,
        fontWeight: selected ? 500 : 400,
        maxWidth: 70,
      }}>{meta.name}</div>
    </div>
  );
}

// ─── Mini sounds player (Spotify-style bottom widget) ──────────
// Shown on every primary screen when the user has an active sound
// mix going, so they can pause / resume / jump back to the full
// player without losing context. Auto-hides on the sounds player
// itself and during focus modes (wind-down, active tracking, the
// breathing practice) where a floating pill would be a distraction.
const MINIPLAYER_HIDE_ON = new Set<string>([
  'sounds-player',
  'schedule-mix',
  'wind-down',
  'place-device',
  'tracking-active',
  'tracking-stop-confirm',
  'tracking-mixer',
  'practice-session',
  'practice-complete',
]);

export function MiniSoundsPlayer() {
  const { state, togglePlay } = useMix();
  const { screenId } = useNavigation();
  const [hidden, setHidden] = useMiniPlayerHidden();
  const count = state.mix.length;
  if (count === 0 || hidden || MINIPLAYER_HIDE_ON.has(screenId)) return null;

  const names = state.mix
    .map((s) => lookupSound(s.id)?.name)
    .filter((x): x is string => !!x);
  const label = names.length === 1 ? names[0] : `Mix of ${names.length}`;
  const sub = state.playing
    ? (state.timerMin ? `Playing · ${state.timerMin} min left` : 'Playing now')
    : 'Paused · tap × to hide';

  function openPlayer(e: React.MouseEvent) {
    e.stopPropagation();
    go('sounds-player');
  }
  function onPlayPause(e: React.MouseEvent) {
    e.stopPropagation();
    togglePlay();
  }
  function onDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    setHidden(true);
  }

  return (
    <div
      onClick={openPlayer}
      style={{
        // Sits above the central pearl FAB (FAB top edge ≈ y=96 from
        // screen bottom) with an 8px gap, so the two never touch.
        position: 'absolute', bottom: 104, left: 14, right: 14, zIndex: 31,
        fontFamily: W.font, cursor: 'pointer',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 6px 8px 10px',
        borderRadius: 18,
        background: 'rgba(20,20,24,0.82)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(22px) saturate(160%)',
        WebkitBackdropFilter: 'blur(22px) saturate(160%)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.05) inset',
      }}>
        <MiniBars playing={state.playing} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: W.ink,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{label}</div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{sub}</div>
        </div>
        <div
          onClick={onDismiss}
          aria-label="Hide player"
          style={{
            width: 28, height: 28, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.55)',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6l-12 12" />
          </svg>
        </div>
        <div
          onClick={onPlayPause}
          aria-label={state.playing ? 'Pause' : 'Play'}
          style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,0.94)', color: '#000000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          }}
        >
          {state.playing
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5l12 7-12 7z" />
              </svg>}
        </div>
      </div>
      <style>{`
        @keyframes mini-bar {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

function MiniBars({ playing }: { playing: boolean }) {
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
            animation: playing ? `mini-bar 1.${3 + i}s ease-in-out infinite` : undefined,
            animationDelay: `${d}s`,
            transform: playing ? undefined : 'scaleY(0.28)',
            opacity: playing ? 1 : 0.45,
          }} />
        ))}
      </div>
    </div>
  );
}

// Re-export a generic IconProps for external screens convenience
export type { IconProps };
