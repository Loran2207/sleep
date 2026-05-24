// Reusable Sounds player body — the visualizer + title + status +
// Mix/Library tab switcher + the SoundMixerPanel split by tab.
// Used by the standalone Sounds player on Home, the wind-down
// Schedule mixer, and the in-bed Tracking mixer so picking sounds
// looks and feels identical wherever you do it. Pair it with
// <SoundsScreenBackdrop /> for the matching radial wash + twinkling
// starfield.

import { useState } from 'react';
import { W } from '../tokens';
import { SoundMixerPanel, type MixBinding, type QuickMix } from './SoundMixerPanel';
import { lookupSound } from '../data/sounds';

const ACCENT = '#FF8E7C';
const ACCENT_LIGHT = '#FFE0DA';

export interface SoundsMixerViewProps {
  binding: MixBinding;
  playing: boolean;
  timerMin?: number | null;
  quickMixes?: QuickMix[];
  /** Override the title shown above the tabs. Defaults to the mix summary. */
  titleOverride?: string;
  /** Caption under the title — defaults to a Playing / Paused indicator. */
  subtitleOverride?: string;
  emptyHint?: string;
  /** Optional default tab. Defaults to Library when mix is empty. */
  initialTab?: 'mix' | 'library';
}

export function SoundsMixerView({
  binding, playing, timerMin = null,
  quickMixes, titleOverride, subtitleOverride,
  emptyHint = 'Switch to Library to pick something soft. Layer as many sounds as you like and balance them here.',
  initialTab,
}: SoundsMixerViewProps) {
  const [tab, setTab] = useState<'mix' | 'library'>(initialTab ?? (binding.mix.length === 0 ? 'library' : 'mix'));
  const mixCount = binding.mix.length;
  const names = binding.mix
    .map((s) => lookupSound(s.id)?.name)
    .filter((x): x is string => !!x);

  const title = titleOverride ?? (
    names.length === 0
      ? 'Pick a sound'
      : names.length === 1
        ? names[0]
        : `Mix of ${names.length}`
  );
  const subtitle = subtitleOverride ?? (
    mixCount === 0
      ? 'Tap a tile below to start listening.'
      : playing
        ? (timerMin ? `Playing · stops in ${timerMin} min` : 'Playing · until you stop')
        : 'Paused'
  );

  return (
    <>
      <SoundsMixerKeyframes />
      <Visualizer playing={playing} count={mixCount} />

      <div style={{
        textAlign: 'center', marginTop: 6,
        fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: W.ink,
      }}>{title}</div>

      <div style={{
        textAlign: 'center', marginTop: 6,
        fontSize: 12, color: 'rgba(255,255,255,0.55)', minHeight: 16,
      }}>{subtitle}</div>

      <div style={{ marginTop: 22 }}>
        <TabSwitcher tab={tab} setTab={setTab} mixCount={mixCount} />
      </div>

      {binding.setTimer && (
        <div style={{ marginTop: 14 }}>
          <TimerRow value={binding.timerMin ?? null} onChange={binding.setTimer} />
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <SoundMixerPanel
          binding={binding}
          quickMixes={quickMixes}
          theme="warm"
          emptyHint={emptyHint}
          sections={tab === 'mix' ? ['active'] : ['quickmix', 'library']}
        />
      </div>
    </>
  );
}

// Sleep-timer row. Six options stretched on a single line, same shape
// as the WindDown setup step so the picker reads as the same control
// in every screen that hosts the mixer.
const TIMER_PICKS: { label: string; minutes: number | null }[] = [
  { label: 'Off', minutes: null },
  { label: '15',  minutes: 15 },
  { label: '30',  minutes: 30 },
  { label: '45',  minutes: 45 },
  { label: '60',  minutes: 60 },
  { label: '90',  minutes: 90 },
];

function TimerRow({ value, onChange }: { value: number | null; onChange: (m: number | null) => void }) {
  return (
    <div style={{
      padding: '12px 12px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4px 10px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8" />
            <path d="M9 2h6" />
            <path d="M12 9v4l3 2" />
          </svg>
          Sounds stop after, minutes
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
          color: '#fff',
        }}>{value ? `${value} min` : 'until you stop'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
        {TIMER_PICKS.map((opt) => {
          const active = opt.minutes === value;
          return (
            <div key={opt.label} onClick={() => onChange(opt.minutes)} style={{
              padding: '9px 0', textAlign: 'center', borderRadius: 12,
              background: active ? '#fff' : 'rgba(255,255,255,0.06)',
              color: active ? '#000000' : 'rgba(255,255,255,0.85)',
              border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.10)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontVariantNumeric: 'tabular-nums',
              transition: 'background .12s ease, color .12s ease',
            }}>{opt.label}</div>
          );
        })}
      </div>
    </div>
  );
}

function TabSwitcher({ tab, setTab, mixCount }: {
  tab: 'mix' | 'library'; setTab: (t: 'mix' | 'library') => void; mixCount: number;
}) {
  const tabs: { id: 'mix' | 'library'; label: string; count?: number }[] = [
    { id: 'mix', label: 'Mix', count: mixCount },
    { id: 'library', label: 'Library' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3,
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px 0', textAlign: 'center',
            background: active ? '#fff' : 'transparent',
            color: active ? '#000000' : 'rgba(255,255,255,0.85)',
            borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background .12s ease, color .12s ease',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span style={{
                padding: '1px 7px', borderRadius: 999,
                fontSize: 10, fontWeight: 700,
                background: active ? '#000000' : 'rgba(255,255,255,0.10)',
                color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                fontVariantNumeric: 'tabular-nums',
              }}>{t.count}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Visualizer({ playing, count }: { playing: boolean; count: number }) {
  const bars = [0, 0.18, 0.36, 0.54];
  return (
    <div style={{
      position: 'relative', height: 220,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginTop: 14,
    }}>
      <div style={{
        position: 'absolute', width: 196, height: 196, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, ${hexA(ACCENT, 0.18)}, ${hexA(ACCENT, 0)} 70%)`,
        animation: playing ? 'sounds-pulse-a 4.6s ease-in-out infinite' : undefined,
        opacity: playing ? 1 : 0.4,
      }} />
      <div style={{
        position: 'absolute', width: 132, height: 132, borderRadius: '50%',
        border: `1px dashed ${hexA(ACCENT, 0.40)}`,
        animation: playing ? 'sounds-pulse-b 3.4s ease-in-out infinite' : undefined,
        opacity: playing ? 1 : 0.55,
      }} />
      <div style={{
        position: 'absolute', width: 84, height: 84, borderRadius: '50%',
        background: `linear-gradient(135deg, ${hexA(ACCENT, 0.55)}, ${hexA(ACCENT, 0.18)})`,
        border: `1px solid ${hexA(ACCENT, 0.65)}`,
        boxShadow: `0 6px 28px ${hexA(ACCENT, 0.28)} inset, 0 8px 26px ${hexA(ACCENT, 0.25)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        {bars.map((d, i) => (
          <div key={i} style={{
            width: 3, height: 28, borderRadius: 2,
            background: ACCENT_LIGHT,
            transformOrigin: 'center',
            animation: playing ? `sounds-bar 1.${4 + i}s ease-in-out infinite` : undefined,
            animationDelay: `${d}s`,
            transform: playing ? undefined : 'scaleY(0.25)',
            opacity: playing ? 1 : 0.45,
          }} />
        ))}
      </div>
      {count === 0 && (
        <div style={{
          position: 'absolute', bottom: 6,
          fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.4,
        }}>silent</div>
      )}
    </div>
  );
}

function SoundsMixerKeyframes() {
  return (
    <style>{`
      @keyframes sounds-pulse-a {
        0%, 100% { transform: scale(0.84); opacity: 0.5; }
        50% { transform: scale(1.04); opacity: 1; }
      }
      @keyframes sounds-pulse-b {
        0%, 100% { transform: scale(0.96); opacity: 0.6; }
        50% { transform: scale(0.78); opacity: 0.95; }
      }
      @keyframes sounds-bar {
        0%, 100% { transform: scaleY(0.35); }
        50% { transform: scaleY(1); }
      }
      @keyframes sounds-twinkle {
        0%, 100% { opacity: 0.35; }
        50% { opacity: 0.85; }
      }
    `}</style>
  );
}

// Coral wash + twinkling starfield used as the screen background
// behind the SoundsMixerView. Lives next to the mixer so every
// screen that hosts the mixer gets the identical backdrop without
// having to copy-paste a stack of gradients.
export function SoundsScreenBackdrop() {
  const [stars] = useState(() => {
    const out: { top: string; left: string; size: number; delay: string; dur: string }[] = [];
    for (let i = 0; i < 26; i++) {
      out.push({
        top: `${Math.round(Math.random() * 70)}%`,
        left: `${Math.round(Math.random() * 100)}%`,
        size: Math.random() < 0.8 ? 1 : 2,
        delay: `${(Math.random() * 4).toFixed(2)}s`,
        dur: `${(2 + Math.random() * 3).toFixed(2)}s`,
      });
    }
    return out;
  });
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', background: `
          radial-gradient(120% 80% at 50% 0%, rgba(255,142,124,0.16) 0%, rgba(255,142,124,0) 55%),
          radial-gradient(80% 60% at 50% 100%, rgba(138,161,255,0.10) 0%, rgba(138,161,255,0) 60%)`,
      }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {stars.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', top: s.top, left: s.left,
            width: s.size, height: s.size, borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            animation: `sounds-twinkle ${s.dur} ease-in-out infinite`,
            animationDelay: s.delay,
          }} />
        ))}
      </div>
    </>
  );
}

function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
