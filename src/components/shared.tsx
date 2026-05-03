import type { CSSProperties, ReactNode } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  HomeFilled, AnalyticsFilled, JournalFilled, ProfileFilled,
  ChevronRightIcon, MoodBlob,
  type IconProps,
} from './icons';
import type { ScreenId } from '../tokens';
import type { MoodType } from './icons';
import { lookupSound } from '../data/sounds';

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
type NavId = 'home' | 'analytics' | 'journal' | 'profile' | 'track';

export function LiquidGlassNav({ active = 'home' }: { active?: NavId | string }) {
  const items: { id: NavId; icon: (p: { size?: number; fill?: string }) => ReactNode; stub?: boolean; nav: ScreenId | null }[] = [
    { id: 'home', icon: HomeFilled, nav: 'home' },
    { id: 'analytics', icon: AnalyticsFilled, stub: true, nav: null },
    { id: 'journal', icon: JournalFilled, nav: 'journal' },
    { id: 'profile', icon: ProfileFilled, nav: 'profile' },
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
                : <MoodBlob type={isFuture ? null : (d.mood ?? null)} size={28} />}
            </div>
          </div>
        );
      })}
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
