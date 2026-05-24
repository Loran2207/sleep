// Unified mixer used by:
//   - Sounds Player on Home (`Sounds.tsx`)
//   - Sleep tracking mixer (`Tracking.tsx::TrackingMixer`)
//   - Sleep schedule mixer (`ScheduleMixer.tsx::ScheduleMix`)
//
// One surface for the lot: active mix at the top (with per-sound
// volume sliders + trash), an optional row of quick presets, then an
// inline category-tabbed library to add more.
//
// The parent passes a `binding` whose shape matches both `useMix()` and
// `useScheduleMix()` — that's how the same panel drives both the
// shared tracking mix and a per-schedule mix without knowing the
// difference.

import { useState } from 'react';
import { W } from '../tokens';
import { GlyphTrash } from './icons';
import { VolumeSlider } from './shared';
import { SOUND_CATALOG, SOUND_CATEGORIES, lookupSound, type SoundCategory } from '../data/sounds';

export type MixSound = { id: string; vol: number };

export interface MixBinding {
  mix: MixSound[];
  setVol: (id: string, v: number) => void;
  toggleSound: (id: string) => void;
  removeSound: (id: string) => void;
  clearAll: () => void;
  setMixIds: (ids: string[]) => void;
  // Optional sleep-timer hook. When provided, the mixer surfaces a
  // small inline timer control (Off / 15 / 30 / 45 / 60 / 90 min)
  // right under the Mix / Library tabs so the user can decide how
  // long the mix plays without leaving the panel.
  timerMin?: number | null;
  setTimer?: (m: number | null) => void;
}

export type QuickMix = { id: string; name: string; sounds: string[] };

export type MixerTheme = 'warm' | 'cool';

export type MixerSection = 'active' | 'quickmix' | 'library';

export interface SoundMixerPanelProps {
  binding: MixBinding;
  quickMixes?: QuickMix[];
  theme?: MixerTheme;
  /** Title above the empty-state hint. Hidden when null. */
  emptyTitle?: string | null;
  /** Body line shown under the empty title. */
  emptyHint?: string;
  /**
   * Which sections to render. Defaults to all three. The Sounds player
   * splits the panel into "Mix" / "Library" tabs by passing different
   * subsets — that way adding sounds in Library never reflows the
   * Mix tab and vice versa.
   */
  sections?: MixerSection[];
}

const THEMES: Record<MixerTheme, {
  accent: string;
  accentSoft: string;
  accentBorder: string;
  catActiveBg: string;
  catActiveText: string;
}> = {
  warm: {
    accent: '#FF8E7C',
    accentSoft: 'rgba(255,142,124,0.16)',
    accentBorder: 'rgba(255,142,124,0.45)',
    catActiveBg: 'rgba(255,142,124,0.16)',
    catActiveText: '#FFC9C0',
  },
  cool: {
    accent: '#FFFFFF',
    accentSoft: 'rgba(255,255,255,0.10)',
    accentBorder: 'rgba(255,255,255,0.32)',
    catActiveBg: '#FFFFFF',
    catActiveText: '#000000',
  },
};

export function SoundMixerPanel({
  binding,
  quickMixes,
  theme = 'cool',
  emptyTitle = 'Build a mix',
  emptyHint = 'Tap a sound below to start. Layer as many as you like and balance volumes individually.',
  sections = ['active', 'quickmix', 'library'],
}: SoundMixerPanelProps) {
  const [cat, setCat] = useState<SoundCategory>('all');
  const activeIds = new Set(binding.mix.map((s) => s.id));
  const visible = cat === 'all' ? SOUND_CATALOG : SOUND_CATALOG.filter((s) => s.cat === cat);
  const t = THEMES[theme];
  const showActive = sections.includes('active');
  const showQuick = sections.includes('quickmix');
  const showLibrary = sections.includes('library');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {showActive && (
        binding.mix.length > 0 ? (
          <ActiveMixSection
            mix={binding.mix}
            setVol={binding.setVol}
            removeSound={binding.removeSound}
            clearAll={binding.clearAll}
            theme={theme}
          />
        ) : emptyTitle !== null ? (
          <EmptyHint title={emptyTitle} hint={emptyHint} />
        ) : null
      )}

      {showQuick && quickMixes && quickMixes.length > 0 && (
        <QuickMixesSection
          presets={quickMixes}
          activeIds={activeIds}
          apply={binding.setMixIds}
          t={t}
        />
      )}

      {showLibrary && (<div>
        <SectionLabel>Sound library</SectionLabel>
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          paddingBottom: 4, marginBottom: 14,
          scrollbarWidth: 'none',
        }}>
          {SOUND_CATEGORIES.map((c) => {
            const active = c.id === cat;
            return (
              <div key={c.id} onClick={() => setCat(c.id)} style={{
                flex: '0 0 auto', padding: '8px 16px', borderRadius: 999,
                background: active ? t.catActiveBg : 'rgba(255,255,255,0.05)',
                color: active ? t.catActiveText : 'rgba(255,255,255,0.85)',
                border: `1px solid ${active ? t.accentBorder : 'rgba(255,255,255,0.12)'}`,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background .14s ease, color .14s ease',
              }}>{c.label}</div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px 8px' }}>
          {visible.map((s) => {
            const Glyph = s.Glyph;
            const on = activeIds.has(s.id);
            return (
              <div key={s.id} onClick={() => binding.toggleSound(s.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 18,
                  background: on
                    ? (theme === 'warm'
                        ? `linear-gradient(135deg, ${rgbA(t.accent, 0.30)} 0%, ${rgbA(t.accent, 0.10)} 100%)`
                        : '#FFFFFF')
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${on
                    ? t.accentBorder
                    : 'rgba(255,255,255,0.10)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  transition: 'background .14s ease, border-color .14s ease',
                }}>
                  <Glyph
                    size={22}
                    stroke={on
                      ? (theme === 'warm' ? '#FFE0DA' : '#000000')
                      : 'rgba(255,255,255,0.78)'}
                  />
                  {on && theme === 'warm' && (
                    <div style={{
                      position: 'absolute', bottom: 6,
                      display: 'flex', gap: 2,
                    }}>
                      {[0, 0.15, 0.3].map((d, i) => (
                        <div key={i} style={{
                          width: 2, height: 6, borderRadius: 1,
                          background: '#FFE0DA',
                          animation: 'mxr-bar 1.1s ease-in-out infinite',
                          animationDelay: `${d}s`,
                          transformOrigin: 'center',
                        }} />
                      ))}
                    </div>
                  )}
                  {on && theme === 'cool' && (
                    <div style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 16, height: 16, borderRadius: 8,
                      background: '#000000', border: '1px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 700, lineHeight: 1,
                    }}>·</div>
                  )}
                </div>
                <div style={{
                  fontSize: 11, textAlign: 'center', lineHeight: 1.2,
                  color: on
                    ? (theme === 'warm' ? W.ink : '#fff')
                    : 'rgba(255,255,255,0.65)',
                  fontWeight: on ? 500 : 400, maxWidth: 70,
                }}>{s.name}</div>
              </div>
            );
          })}
        </div>
      </div>)}

      <style>{`
        @keyframes mxr-bar {
          0%, 100% { transform: scaleY(0.32); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

function ActiveMixSection({ mix, setVol, removeSound, clearAll, theme }: {
  mix: MixSound[];
  setVol: (id: string, v: number) => void;
  removeSound: (id: string) => void;
  clearAll: () => void;
  theme: MixerTheme;
}) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, padding: '0 2px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
          Your mix <span style={{
            marginLeft: 6, padding: '2px 8px', borderRadius: 999,
            fontSize: 11, fontWeight: 600,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.65)',
            fontVariantNumeric: 'tabular-nums',
          }}>{mix.length}</span>
        </div>
        <div onClick={clearAll} style={{
          fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer', padding: '4px 4px',
        }}>Clear all</div>
      </div>

      <div style={{
        padding: '4px 0',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {mix.map((item) => {
          const meta = lookupSound(item.id);
          if (!meta) return null;
          const Glyph = meta.Glyph;
          const t = THEMES[theme];
          return (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: theme === 'warm'
                  ? `linear-gradient(135deg, ${rgbA(t.accent, 0.30)} 0%, ${rgbA(t.accent, 0.10)} 100%)`
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${theme === 'warm' ? t.accentBorder : 'rgba(255,255,255,0.16)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: theme === 'warm' ? '#FFE0DA' : 'rgba(255,255,255,0.92)',
              }}>
                <Glyph size={18} stroke="currentColor" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 6,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{meta.name}</div>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.5)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{Math.round(item.vol * 100)}</div>
                </div>
                <VolumeSlider value={item.vol} onChange={(v) => setVol(item.id, v)} />
              </div>
              <div onClick={() => removeSound(item.id)} aria-label="Remove" style={{
                width: 34, height: 34, borderRadius: 17,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)', cursor: 'pointer', flexShrink: 0,
              }}>
                <GlyphTrash size={15} stroke="currentColor" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickMixesSection({ presets, activeIds, apply, t }: {
  presets: QuickMix[];
  activeIds: Set<string>;
  apply: (ids: string[]) => void;
  t: typeof THEMES[MixerTheme];
}) {
  return (
    <div>
      <SectionLabel>Quick mixes</SectionLabel>
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 0 6px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {presets.map((m) => {
          const match = sameSet(m.sounds, [...activeIds]);
          return (
            <div key={m.id} onClick={() => apply(m.sounds)} style={{
              flex: '0 0 auto', padding: '10px 14px', borderRadius: 999,
              background: match ? t.accentSoft : 'rgba(255,255,255,0.04)',
              color: match ? t.catActiveText : 'rgba(255,255,255,0.85)',
              border: `1px solid ${match ? t.accentBorder : 'rgba(255,255,255,0.10)'}`,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background .14s ease, color .14s ease',
            }}>{m.name}</div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyHint({ title, hint }: { title: string; hint: string }) {
  return (
    <div style={{
      padding: '18px 18px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px dashed rgba(255,255,255,0.16)',
      borderRadius: 16,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: W.ink }}>{title}</div>
      <div style={{
        fontSize: 13, color: 'rgba(255,255,255,0.6)',
        marginTop: 4, lineHeight: 1.5,
      }}>{hint}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600,
      letterSpacing: 0.2, marginBottom: 10, padding: '0 2px',
    }}>{children}</div>
  );
}

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((x) => sa.has(x));
}

function rgbA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
