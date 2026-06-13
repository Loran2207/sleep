import { useState, type ReactNode, type CSSProperties } from 'react';

// ─── Cosmic visual language ──────────────────────────────────────
// Extracted from the Sounds player so any screen can wear the same
// starry-sky backdrop + glowing concentric medallion in its own hue.
// One implementation, parameterised by accent:
//   coral = Sounds   ·   blue = device setup / breathing   ·   red = course
// Keeping it here (not copy-pasted per screen) is what makes every
// screen read as the same world.

export type CosmicHue = 'coral' | 'blue' | 'red' | 'mint';

export const COSMIC: Record<CosmicHue, { accent: string; light: string; secondary: string }> = {
  coral: { accent: '#FF8E7C', light: '#FFE0DA', secondary: '#8AA1FF' },
  blue:  { accent: '#5C9BFF', light: '#DCEAFF', secondary: '#9D7CFF' },
  red:   { accent: '#FF5A6A', light: '#FFD6DB', secondary: '#FF9C6E' },
  mint:  { accent: '#5DDDB3', light: '#CFF5E8', secondary: '#7CC0FF' },
};

export function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

type Star = { top: string; left: string; size: number; bright: number; delay: string; dur: string };

function makeStars(n: number): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < n; i++) {
    const big = Math.random() < 0.14;
    out.push({
      top: `${Math.round(Math.random() * 82)}%`,
      left: `${Math.round(Math.random() * 100)}%`,
      size: big ? 2 : 1,
      bright: big ? 0.95 : 0.5 + Math.random() * 0.3,
      delay: `${(Math.random() * 4).toFixed(2)}s`,
      dur: `${(2.4 + Math.random() * 3).toFixed(2)}s`,
    });
  }
  return out;
}

// Full-bleed backdrop: a soft nebula wash in the accent up top, a cooler
// wash at the bottom horizon, and a twinkling starfield. Drop it as the
// first child of a `position: relative` screen container.
export function CosmicBackdrop({
  hue = 'coral', stars = 28, glow = 0.18, style,
}: { hue?: CosmicHue; stars?: number; glow?: number; style?: CSSProperties }) {
  const c = COSMIC[hue];
  const [field] = useState(() => makeStars(stars));
  return (
    <>
      <CosmicKeyframes />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(130% 80% at 50% -8%, ${hexA(c.accent, glow)} 0%, ${hexA(c.accent, 0)} 55%),
          radial-gradient(120% 70% at 50% 108%, ${hexA(c.secondary, glow * 0.6)} 0%, ${hexA(c.secondary, 0)} 60%),
          radial-gradient(55% 38% at 76% 26%, ${hexA(c.accent, glow * 0.42)} 0%, ${hexA(c.accent, 0)} 70%)`,
        ...style,
      }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {field.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', top: s.top, left: s.left,
            width: s.size, height: s.size, borderRadius: '50%',
            background: `rgba(255,255,255,${s.bright})`,
            boxShadow: s.size > 1 ? '0 0 4px rgba(255,255,255,0.6)' : undefined,
            animation: `cosmic-twinkle ${s.dur} ease-in-out infinite`,
            animationDelay: s.delay,
          }} />
        ))}
      </div>
    </>
  );
}

// Glowing medallion: outer halo + dashed orbit ring + a gradient core
// that holds an icon (children). Breathes softly when `animate`.
export function CosmicMedallion({
  hue = 'coral', core = 84, animate = true, children,
}: { hue?: CosmicHue; core?: number; animate?: boolean; children?: ReactNode }) {
  const c = COSMIC[hue];
  const halo = Math.round(core * 2.33);
  const ring = Math.round(core * 1.57);
  const box = Math.round(core * 2.6);
  return (
    <div style={{
      position: 'relative', width: box, height: box,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', width: halo, height: halo, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, ${hexA(c.accent, 0.2)}, ${hexA(c.accent, 0)} 70%)`,
        animation: animate ? 'cosmic-halo 4.6s ease-in-out infinite' : undefined,
      }} />
      <div style={{
        position: 'absolute', width: ring, height: ring, borderRadius: '50%',
        border: `1px dashed ${hexA(c.accent, 0.42)}`,
        animation: animate ? 'cosmic-orbit 18s linear infinite' : undefined,
      }} />
      <div style={{
        position: 'relative', width: core, height: core, borderRadius: '50%',
        background: `linear-gradient(135deg, ${hexA(c.accent, 0.58)}, ${hexA(c.accent, 0.18)})`,
        border: `1px solid ${hexA(c.accent, 0.66)}`,
        boxShadow: `inset 0 6px 28px ${hexA(c.accent, 0.3)}, 0 10px 30px ${hexA(c.accent, 0.26)}`,
        color: c.light,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

function CosmicKeyframes() {
  return (
    <style>{`
      @keyframes cosmic-twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
      @keyframes cosmic-halo { 0%, 100% { transform: scale(0.86); opacity: 0.55; } 50% { transform: scale(1.05); opacity: 1; } }
      @keyframes cosmic-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
  );
}
