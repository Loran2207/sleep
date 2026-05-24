// Shared selectable option card used by the quiz screens and the
// first-run onboarding. Keeping one component means the "tinted card
// you tap to answer" looks and behaves identically everywhere.
import type { ReactNode } from 'react';
import { W } from '../tokens';
import { CheckIcon } from './icons';

export function OptionCard({
  label, emoji, sublabel, expand, selected, accent, onClick, indicator = 'radio',
}: {
  label: string;
  emoji?: string;
  sublabel?: string;
  expand?: ReactNode;     // shown beneath the label once selected
  selected: boolean;
  accent: string;
  onClick: () => void;
  indicator?: 'radio' | 'check';
}) {
  const on = selected;
  return (
    <div onClick={onClick} style={{
      padding: '15px 16px',
      background: on
        ? `linear-gradient(135deg, ${hexA(accent, 0.16)} 0%, ${hexA(accent, 0.05)} 100%)`
        : W.paper,
      border: `1px solid ${on ? hexA(accent, 0.65) : W.fill}`,
      borderRadius: 14, cursor: 'pointer',
      transition: 'background .14s ease, border-color .14s ease, box-shadow .14s ease',
      boxShadow: on ? `0 8px 22px ${hexA(accent, 0.18)}` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {emoji && (
          <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: W.ink, lineHeight: 1.3 }}>{label}</div>
          {sublabel && (
            <div style={{ fontSize: 12, color: W.weak, marginTop: 2, lineHeight: 1.4 }}>{sublabel}</div>
          )}
        </div>
        <Indicator on={on} accent={accent} shape={indicator === 'check' ? 'square' : 'circle'} />
      </div>
      {on && expand && (
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: `1px solid ${hexA(accent, 0.22)}`,
          fontSize: 13, color: W.weak, lineHeight: 1.5,
        }}>{expand}</div>
      )}
    </div>
  );
}

function Indicator({ on, accent, shape }: { on: boolean; accent: string; shape: 'circle' | 'square' }) {
  const radius = shape === 'circle' ? 11 : 7;
  return (
    <div style={{
      width: 22, height: 22, borderRadius: radius,
      background: on ? accent : 'transparent',
      border: `1.5px solid ${on ? accent : W.veryweak}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: on ? `0 0 0 4px ${hexA(accent, 0.18)}` : 'none',
      transition: 'background .14s ease, border-color .14s ease, box-shadow .14s ease',
    }}>
      {on && <CheckIcon size={12} stroke={W.bg} strokeWidth={3} />}
    </div>
  );
}

// ─── colour helpers (shared) ─────────────────────────────────────
export function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
export function darken(hex: string, amt: number) {
  const c = hex.replace('#', '');
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - Math.round(255 * amt));
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - Math.round(255 * amt));
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - Math.round(255 * amt));
  return `rgb(${r}, ${g}, ${b})`;
}
