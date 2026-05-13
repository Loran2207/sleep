import type { CSSProperties, ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  HomeFilled, AnalyticsFilled, JournalFilled, CourseFilled,
  ChevronRightIcon,
  type IconProps,
} from './icons';
import type { ScreenId } from '../tokens';
import type { MoodType } from './icons';
import { lookupSound } from '../data/sounds';
import { useNightShiftDone } from '../state/store';
import { CheckIcon, NightShiftIcon } from './icons';
import { MoodFace } from './MoodFace';
import { moodToPosition } from '../data/mood';

// Small breathing pad above content. Adds iOS safe-area-inset-top so the
// system clock doesn't overlap content when the page runs as a PWA on iOS.
// On desktop / Android the inset evaluates to 0 and only `h` is used.
export function TopPad({ h = 8 }: { h?: number }) {
  return <div style={{ height: `calc(${h}px + env(safe-area-inset-top))`, flexShrink: 0 }} />;
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

export function SectionLabel({ children, inline = false }: { children: ReactNode; inline?: boolean }) {
  return (
    <div style={{
      fontSize: 13, color: W.weak, fontWeight: 500,
      padding: inline ? 0 : '0 4px 10px',
      letterSpacing: 0,
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
type NavId = 'home' | 'analytics' | 'journal' | 'course' | 'track';

export function LiquidGlassNav({ active = 'home' }: { active?: NavId | string }) {
  const items: { id: NavId; icon: (p: { size?: number; fill?: string }) => ReactNode; stub?: boolean; nav: ScreenId | null }[] = [
    { id: 'home', icon: HomeFilled, nav: 'home' },
    { id: 'analytics', icon: AnalyticsFilled, stub: true, nav: null },
    { id: 'journal', icon: JournalFilled, nav: 'journal' },
    { id: 'course', icon: CourseFilled, nav: 'course' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 22, left: 14, right: 14, zIndex: 30,
      fontFamily: W.font,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        flex: 1, position: 'relative',
        height: 56, borderRadius: 28,
        background: 'rgba(14,14,17,0.55)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 6px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 28,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%)',
          pointerEvents: 'none',
        }} />
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <div
              key={it.id}
              onClick={() => !it.stub && it.nav && go(it.nav)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', cursor: it.stub ? 'default' : 'pointer',
                opacity: it.stub ? 0.45 : (isActive ? 1 : 0.7),
                position: 'relative', zIndex: 1,
              }}
            >
              <it.icon size={24} fill={W.ink} />
            </div>
          );
        })}
      </div>
    </div>
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
      overflowX: 'auto', fontFamily: W.font,
      WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
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
              flex: '0 0 auto', textAlign: 'center', cursor: isFuture ? 'default' : 'pointer',
              opacity: isFuture ? 0.32 : 1, minWidth: 44,
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
        <div onClick={() => go('profile')} aria-label="Profile" style={{
          width: 34, height: 34, borderRadius: 17,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: W.ink, flexShrink: 0,
        }}>A</div>
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
          ? <CheckIcon size={18} stroke="#0E0E11" />
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

// Re-export a generic IconProps for external screens convenience
export type { IconProps };
