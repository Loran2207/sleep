// Reusable Sounds player body — the visualizer + title + status +
// Mix/Library tab switcher + the SoundMixerPanel split by tab. Used
// by the standalone Sounds player on Home, the wind-down Schedule
// mixer, and the in-bed Tracking mixer so picking sounds looks and
// feels identical wherever you do it.

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
            color: active ? '#0E0E11' : 'rgba(255,255,255,0.85)',
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
                background: active ? '#0E0E11' : 'rgba(255,255,255,0.10)',
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
      position: 'relative', height: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginTop: 8,
    }}>
      <div style={{
        position: 'absolute', width: 186, height: 186, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, ${hexA(ACCENT, 0.18)}, ${hexA(ACCENT, 0)} 70%)`,
        animation: playing ? 'sounds-pulse-a 4.6s ease-in-out infinite' : undefined,
        opacity: playing ? 1 : 0.4,
      }} />
      <div style={{
        position: 'absolute', width: 124, height: 124, borderRadius: '50%',
        border: `1px dashed ${hexA(ACCENT, 0.40)}`,
        animation: playing ? 'sounds-pulse-b 3.4s ease-in-out infinite' : undefined,
        opacity: playing ? 1 : 0.55,
      }} />
      <div style={{
        position: 'absolute', width: 80, height: 80, borderRadius: '50%',
        background: `linear-gradient(135deg, ${hexA(ACCENT, 0.55)}, ${hexA(ACCENT, 0.18)})`,
        border: `1px solid ${hexA(ACCENT, 0.65)}`,
        boxShadow: `0 6px 28px ${hexA(ACCENT, 0.28)} inset, 0 8px 26px ${hexA(ACCENT, 0.25)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        {bars.map((d, i) => (
          <div key={i} style={{
            width: 3, height: 26, borderRadius: 2,
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
    `}</style>
  );
}

function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
