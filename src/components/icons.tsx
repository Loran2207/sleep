import type { ReactNode, CSSProperties } from 'react';

export type IconProps = {
  size?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  style?: CSSProperties;
};

function Icon({
  size = 22, stroke = '#111', fill = 'none', strokeWidth = 1.6, style, children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {children}
    </svg>
  );
}

// ─── App icons (line-art) ────────────────────────────────────────
export const HomeIcon = (p: IconProps) => <Icon {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></Icon>;
export const MoonIcon = (p: IconProps) => <Icon {...p}><path d="M21 13.5A8.5 8.5 0 1 1 10.5 3a7 7 0 0 0 10.5 10.5z"/></Icon>;
export const CheckIcon = (p: IconProps) => <Icon {...p}><path d="M5 12l4 4 10-10"/></Icon>;
export const ChevronRightIcon = (p: IconProps) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>;
export const ChevronLeftIcon = (p: IconProps) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>;
export const ChevronDownIcon = (p: IconProps) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>;
export const LockIcon = (p: IconProps) => <Icon {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>;
export const PlayIcon = (p: IconProps) => <Icon {...p}><path d="M7 5l12 7-12 7z" fill={p.stroke}/></Icon>;
export const BellIcon = (p: IconProps) => <Icon {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/></Icon>;
export const MusicIcon = (p: IconProps) => <Icon {...p}><path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></Icon>;
export const PhoneOffIcon = (p: IconProps) => <Icon {...p}><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M4 4l16 16"/></Icon>;
export const WindIcon = (p: IconProps) => <Icon {...p}><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h8"/></Icon>;
export const NightShiftIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill={p.stroke}/></Icon>;
export const PencilIcon = (p: IconProps) => <Icon {...p}><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 7l3 3"/></Icon>;
export const TrashIcon = (p: IconProps) => <Icon {...p}><path d="M5 7h14"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M7 7l1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13"/></Icon>;
export const PlusIcon = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const ArrowRightTinyIcon = (p: IconProps) => <Icon {...p}><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></Icon>;

// ─── Filled tab icons ────────────────────────────────────────────
type FilledProps = { size?: number; fill?: string };
export function HomeFilled({ size = 24, fill = '#fff' }: FilledProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M3.3 11.2 11.4 4a.9.9 0 0 1 1.2 0l8.1 7.2a.9.9 0 0 1 .3.7V20a1.5 1.5 0 0 1-1.5 1.5h-3.7a.8.8 0 0 1-.8-.8v-4.6a1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5v4.6a.8.8 0 0 1-.8.8H4.5A1.5 1.5 0 0 1 3 20v-8.1a.9.9 0 0 1 .3-.7Z"/>
    </svg>
  );
}
export function AnalyticsFilled({ size = 24, fill = '#fff' }: FilledProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <rect x="3" y="13" width="3.5" height="8" rx="1"/>
      <rect x="9" y="8" width="3.5" height="13" rx="1"/>
      <rect x="15" y="3" width="3.5" height="18" rx="1"/>
    </svg>
  );
}
export function JournalFilled({ size = 24, fill = '#fff' }: FilledProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M6 3h11.5A1.5 1.5 0 0 1 19 4.5v14.7a.8.8 0 0 1-1.2.7l-1.6-.9a1.5 1.5 0 0 0-1.4 0l-1.6.9a1.5 1.5 0 0 1-1.4 0l-1.6-.9a1.5 1.5 0 0 0-1.4 0l-1.6.9A.8.8 0 0 1 5 19.2V4.5A1.5 1.5 0 0 1 6.5 3Z"/>
    </svg>
  );
}
export function ScheduleFilled({ size = 24, fill = '#fff' }: FilledProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/>
      <rect x="11.2" y="6.5" width="1.6" height="6" rx="0.8" fill="#0E0E11"/>
      <rect x="11.2" y="11" width="4" height="1.6" rx="0.8" fill="#0E0E11"/>
    </svg>
  );
}

// ─── Habit glyphs ────────────────────────────────────────────────
import type { HabitGlyphName } from '../state/store';
export function HabitGlyph({ name, size = 22, stroke = '#F5F5F7' }: { name: HabitGlyphName | string; size?: number; stroke?: string }) {
  const p = { size, stroke };
  switch (name) {
    case 'tea': return <Icon {...p}><path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2"/><path d="M7 5c0 1-1 1-1 2s1 1 1 2"/><path d="M11 5c0 1-1 1-1 2s1 1 1 2"/></Icon>;
    case 'book': return <Icon {...p}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></Icon>;
    case 'shower': return <Icon {...p}><path d="M16 4a3 3 0 0 1 3 3v3"/><path d="M5 11h14"/><path d="M8 13v2M11 14v3M14 13v2M17 14v3"/></Icon>;
    case 'bulb': return <Icon {...p}><path d="M9 17h6"/><path d="M10 21h4"/><path d="M9 14a5 5 0 1 1 6 0c-.5.5-1 1-1 2H10c0-1-.5-1.5-1-2z"/></Icon>;
    case 'phone': return <Icon {...p}><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></Icon>;
    case 'breath': return <Icon {...p}><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h8"/></Icon>;
    case 'sparkle': return <Icon {...p}><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z"/><path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7z"/></Icon>;
    case 'leaf': return <Icon {...p}><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 7-7 14-14"/></Icon>;
    case 'pen': return <Icon {...p}><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 7l3 3"/></Icon>;
    case 'walk': return <Icon {...p}><circle cx="13" cy="4.5" r="1.5"/><path d="M9 21l3-7 3 3 3-1"/><path d="M9 13l2-4 4 1 2 3"/></Icon>;
    case 'sun': return <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5l1.5-1.5M17 7l1.5-1.5"/></Icon>;
    case 'drop': return <Icon {...p}><path d="M12 3c-3 5-6 8-6 12a6 6 0 0 0 12 0c0-4-3-7-6-12z"/></Icon>;
    case 'cup': return <Icon {...p}><path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2"/></Icon>;
    case 'fork': return <Icon {...p}><path d="M7 3v6a2 2 0 0 0 2 2v10"/><path d="M11 3v6a2 2 0 0 1-2 2"/><path d="M15 3c2 0 2 4 2 6s-2 2-2 2v10"/></Icon>;
    default: return <Icon {...p}><circle cx="12" cy="12" r="8"/></Icon>;
  }
}

// ─── Category glyphs (block-apps) ────────────────────────────────
export function CategoryGlyph({ name, size = 18, stroke = '#F5F5F7' }: { name: string; size?: number; stroke?: string }) {
  const p = { size, stroke };
  switch (name) {
    case 'all': return <Icon {...p}><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></Icon>;
    case 'social': return <Icon {...p}><path d="M5 12a7 7 0 1 1 4 6.3L5 19l.7-3.7"/><circle cx="9" cy="12" r=".8" fill={stroke}/><circle cx="12" cy="12" r=".8" fill={stroke}/><circle cx="15" cy="12" r=".8" fill={stroke}/></Icon>;
    case 'games': return <Icon {...p}><path d="M3 14a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v1a3 3 0 0 1-5.4 1.7L13 13h-2l-2.6 3.7A3 3 0 0 1 3 15z"/><path d="M7 12v2M6 13h2"/><circle cx="16" cy="13" r=".8" fill={stroke}/></Icon>;
    case 'entertainment': return <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 9h18M7 6V4M17 6V4"/></Icon>;
    case 'creativity': return <Icon {...p}><path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 0-3-3h-2a2 2 0 0 1 0-4 2 2 0 0 0-2-2"/><circle cx="7" cy="11" r="1" fill={stroke}/><circle cx="9" cy="7" r="1" fill={stroke}/><circle cx="14" cy="6" r="1" fill={stroke}/></Icon>;
    case 'education': return <Icon {...p}><path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v5c0 1 2 2 5 2s5-1 5-2v-5"/></Icon>;
    case 'health': return <Icon {...p}><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 8l8 8M14 4l6 6M4 14l6 6"/></Icon>;
    case 'reading': return <Icon {...p}><path d="M3 5h7a3 3 0 0 1 3 3v12"/><path d="M21 5h-7a3 3 0 0 0-3 3v12"/><path d="M3 5v13h7"/><path d="M21 5v13h-7"/></Icon>;
    case 'shopping': return <Icon {...p}><path d="M5 8h14l-1.5 11a2 2 0 0 1-2 1.7H8.5A2 2 0 0 1 6.5 19z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></Icon>;
    case 'news': return <Icon {...p}><rect x="3" y="5" width="14" height="14" rx="1.5"/><path d="M17 9h3v8a2 2 0 0 1-4 0"/><path d="M6 9h7M6 12h7M6 15h4"/></Icon>;
    default: return <Icon {...p}><circle cx="12" cy="12" r="8"/></Icon>;
  }
}

// ─── Sound glyphs (line-art) ─────────────────────────────────────
export function GlyphRain(p: IconProps) { return <Icon {...p}><path d="M6 13a4 4 0 0 1 1-7.9 5 5 0 0 1 9.5 1.4A3.5 3.5 0 0 1 17 13"/><path d="M9 17l-1 3"/><path d="M13 17l-1 3"/><path d="M17 17l-1 3"/></Icon>; }
export function GlyphFlame(p: IconProps) { return <Icon {...p}><path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 1-3s0 2 2 2c0-3-1-5 1-7z"/></Icon>; }
export function GlyphFlute(p: IconProps) { return <Icon {...p}><path d="M9 4h6v16H9z"/><path d="M11 7h2"/><path d="M11 11h2"/><path d="M11 15h2"/></Icon>; }
export function GlyphOcean(p: IconProps) { return <Icon {...p}><path d="M3 10c2 0 3 1.5 5 1.5S10 10 12 10s2 1.5 4 1.5S18 10 21 10"/><path d="M3 14c2 0 3 1.5 5 1.5S10 14 12 14s2 1.5 4 1.5S18 14 21 14"/></Icon>; }
export function GlyphForest(p: IconProps) { return <Icon {...p}><path d="M12 3l5 8h-3l3 5h-4v5h-2v-5H7l3-5H7z"/></Icon>; }
export function GlyphCricket(p: IconProps) { return <Icon {...p}><path d="M8 6l3 4-3 4"/><path d="M16 6l-3 4 3 4"/><path d="M5 18h14"/></Icon>; }
export function GlyphChimes(p: IconProps) { return <Icon {...p}><path d="M5 4v14"/><path d="M10 4v10"/><path d="M15 4v14"/><path d="M20 4v8"/></Icon>; }
export function GlyphWhite(p: IconProps) { return <Icon {...p}><path d="M3 12h2l1-4 2 8 2-12 2 16 2-10 2 6 2-4h2"/></Icon>; }
export function GlyphFan(p: IconProps) { return <Icon {...p}><circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-6 4-6s3 4 0 6"/><path d="M14 12c4 0 6 1 6 4s-4 3-6 0"/><path d="M12 14c0 4-1 6-4 6s-3-4 0-6"/><path d="M10 12c-4 0-6-1-6-4s4-3 6 0"/></Icon>; }
export function GlyphWind(p: IconProps) { return <Icon {...p}><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h8"/></Icon>; }
export function GlyphCoffee(p: IconProps) { return <Icon {...p}><path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 4c0 1-1 1-1 2s1 1 1 2"/><path d="M12 4c0 1-1 1-1 2s1 1 1 2"/></Icon>; }
export function GlyphBook(p: IconProps) { return <Icon {...p}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></Icon>; }
export function GlyphThunder(p: IconProps) { return <Icon {...p}><path d="M6 12a4 4 0 0 1 1-7.9 5 5 0 0 1 9.5 1.4A3.5 3.5 0 0 1 17 12"/><path d="M11 14l-2 4h3l-1 4 4-6h-3l1-2z"/></Icon>; }
export function GlyphRiver(p: IconProps) { return <Icon {...p}><path d="M3 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 11c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></Icon>; }
export function GlyphSynth(p: IconProps) { return <Icon {...p}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14v-2"/><path d="M11 14v-4"/><path d="M15 14v-2"/><path d="M19 14v-3"/></Icon>; }
export function GlyphBinaural(p: IconProps) { return <Icon {...p}><path d="M4 12a8 8 0 0 1 16 0"/><path d="M4 12v3a2 2 0 0 0 4 0v-3"/><path d="M20 12v3a2 2 0 0 1-4 0v-3"/></Icon>; }
export function GlyphBrown(p: IconProps) { return <Icon {...p}><path d="M3 12c1-2 2-2 3 0s2 4 3 0 2-6 3 0 2 4 3 0 2-2 3 0 2 2 3 0"/></Icon>; }
export function GlyphKeyboard(p: IconProps) { return <Icon {...p}><rect x="3" y="7" width="18" height="11" rx="2"/><path d="M7 11h0M11 11h0M15 11h0M19 11h0M7 15h10"/></Icon>; }
export function GlyphSeagull(p: IconProps) { return <Icon {...p}><path d="M3 14c2-2 4-2 6-1s2 1 4-1 4-2 6 0"/></Icon>; }
export function GlyphHeart(p: IconProps) { return <Icon {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></Icon>; }
export function GlyphTimer(p: IconProps) { return <Icon {...p}><circle cx="12" cy="13" r="8"/><path d="M9 2h6"/><path d="M12 9v4"/></Icon>; }
export function GlyphSliders(p: IconProps) { return <Icon {...p}><path d="M5 6h14"/><path d="M5 12h14"/><path d="M5 18h14"/><circle cx="9" cy="6" r="2" fill="transparent"/><circle cx="15" cy="12" r="2" fill="transparent"/><circle cx="11" cy="18" r="2" fill="transparent"/></Icon>; }
export function GlyphPlay(p: IconProps) { return <Icon {...p} fill={p.stroke}><path d="M7 5l12 7-12 7z"/></Icon>; }
export function GlyphPause(p: IconProps) { return <Icon {...p} fill={p.stroke} strokeWidth={0}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></Icon>; }
export function GlyphChevDn(p: IconProps) { return <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>; }
export function GlyphTrash(p: IconProps) { return <Icon {...p}><path d="M5 7h14"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M7 7l1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13"/></Icon>; }
export function GlyphPlus(p: IconProps) { return <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>; }
export function GlyphX(p: IconProps) { return <Icon {...p}><path d="M6 6l12 12M18 6l-12 12"/></Icon>; }

export function BoltIcon({ size = 56, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>
    </svg>
  );
}
export function MoonGlyphIcon({ size = 56, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z"/>
    </svg>
  );
}

export function NapZIcon(p: IconProps) {
  return <Icon {...p}><path d="M6 7h8l-8 10h8"/><path d="M14 4h4l-4 5h4"/></Icon>;
}

// Mood blob — soft round face with simple expression.
export type MoodType = 'great' | 'good' | 'meh' | 'bad' | 'awful' | null;

export function MoodBlob({ type, size = 28 }: { type: MoodType; size?: number }) {
  if (!type) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '1.5px dashed #3A3A40',
      }} />
    );
  }
  const palette = {
    great: { fill: '#7FE3A1', stroke: '#0E1014' },
    good: { fill: '#9BE3B8', stroke: '#0E1014' },
    meh: { fill: '#E5E067', stroke: '#0E1014' },
    bad: { fill: '#E59A6F', stroke: '#0E1014' },
    awful: { fill: '#E57070', stroke: '#0E1014' },
  }[type];
  const eye = (cx: number) => <circle cx={cx} cy="11" r="0.9" fill={palette.stroke} />;
  const mouth = {
    great: <path d="M9 14 Q12 17.5 15 14" stroke={palette.stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />,
    good: <path d="M9.5 14.2 Q12 16 14.5 14.2" stroke={palette.stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />,
    meh: <path d="M9.5 14.5 L14.5 14.5" stroke={palette.stroke} strokeWidth="1.4" strokeLinecap="round" />,
    bad: <path d="M9.5 15 Q12 13.5 14.5 15" stroke={palette.stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />,
    awful: <path d="M9 15.5 Q12 13 15 15.5" stroke={palette.stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />,
  }[type];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M 12 2.5 C 17 2.5 21.5 6 21.5 11 C 21.5 16.2 18 21.5 12 21.5 C 6 21.5 2.5 16.2 2.5 11 C 2.5 6 7 2.5 12 2.5 Z" fill={palette.fill} />
      {eye(9)}
      {eye(15)}
      {mouth}
    </svg>
  );
}
