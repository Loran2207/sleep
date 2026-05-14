import { useState } from 'react';
import { W } from '../tokens';
import { back as goBack } from '../state/navigation';
import { TopPad, TimerPicker } from '../components/shared';
import { startTracking } from '../state/tracking';
import { useDraft } from '../state/store';
import { SOUND_CATALOG, lookupSound } from '../data/sounds';

const ACCENT = '#FFB47A';

// A small set of curated single-tap mixes shown at the top.
// Each preset replaces the active sound set when tapped.
const QUICK_MIXES: { id: string; name: string; sounds: string[] }[] = [
  { id: 'rainy', name: 'Rainy night', sounds: ['rain', 'thunder', 'chimes'] },
  { id: 'cabin', name: 'Cabin', sounds: ['campfire', 'forest', 'crickets'] },
  { id: 'ocean', name: 'Open ocean', sounds: ['ocean', 'seagull', 'wind'] },
  { id: 'cafe',  name: 'Café focus', sounds: ['coffee', 'keyboard'] },
];

export function SoundsPlayer() {
  const [activeIds, setActiveIds] = useState<string[]>(['rain', 'chimes']);
  const [playing, setPlaying] = useState(true);
  const [timerMin, setTimerMin] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showNapSheet, setShowNapSheet] = useState(false);
  const [, setDraft] = useDraft();

  function toggle(id: string) {
    setActiveIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function applyMix(ids: string[]) {
    setActiveIds(ids);
    setPlaying(true);
  }

  function startNap() {
    const names = activeIds
      .map((id) => lookupSound(id)?.name)
      .filter((x): x is string => !!x);
    setDraft({
      kind: 'nap',
      napMinutes: timerMin && timerMin > 0 ? timerMin : 30,
      sounds: names.length ? names : ['Rain'],
    });
    setShowNapSheet(false);
    startTracking();
  }

  const activeNames = activeIds
    .map((id) => lookupSound(id)?.name)
    .filter((x): x is string => !!x);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E0E11', color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes sounds-pulse-a {
          0%, 100% { transform: scale(0.84); opacity: 0.5; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes sounds-pulse-b {
          0%, 100% { transform: scale(0.96); opacity: 0.6; }
          50% { transform: scale(0.78); opacity: 0.95; }
        }
        @keyframes sounds-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sounds-bar {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        @keyframes sounds-sheet-up {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes sounds-twinkle {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `
        radial-gradient(120% 80% at 50% 0%, rgba(255,180,122,0.16) 0%, rgba(255,180,122,0) 55%),
        radial-gradient(80% 60% at 50% 100%, rgba(127,194,255,0.10) 0%, rgba(127,194,255,0) 60%)`,
      }} />
      <StarField />

      <TopPad />

      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 18px 0',
      }}>
        <div onClick={() => goBack()} aria-label="Back" style={{
          width: 36, height: 36, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.85)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Sounds</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '0 20px 240px' }}>
        <Visualizer playing={playing} count={activeIds.length} />

        <div style={{
          textAlign: 'center', marginTop: 6,
          fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em',
        }}>
          {activeNames.length === 0
            ? 'Pick a sound'
            : activeNames.length === 1
              ? activeNames[0]
              : `Mix of ${activeNames.length}`}
        </div>
        <div style={{
          textAlign: 'center', marginTop: 6,
          fontSize: 12, color: W.weak,
          minHeight: 16,
        }}>
          {activeIds.length === 0
            ? 'Tap a tile below to start listening.'
            : playing
              ? <>Playing{timerMin ? ` · stops in ${timerMin} min` : ' · until you stop'}</>
              : 'Paused'}
        </div>

        <div style={{ marginTop: 24 }}>
          <SectionLabel>Quick mixes</SectionLabel>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 0 6px',
            WebkitOverflowScrolling: 'touch',
          }}>
            {QUICK_MIXES.map((m) => {
              const active = sameSet(m.sounds, activeIds);
              return (
                <div key={m.id} onClick={() => applyMix(m.sounds)} style={{
                  flex: '0 0 auto', padding: '10px 14px', borderRadius: 999,
                  background: active ? 'rgba(255,180,122,0.18)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? hexA(ACCENT, 0.55) : 'rgba(255,255,255,0.10)'}`,
                  color: active ? '#FFD3B0' : 'rgba(255,255,255,0.85)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>{m.name}</div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Library</SectionLabel>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 6px',
          }}>
            {SOUND_CATALOG.map((s) => {
              const on = activeIds.includes(s.id);
              const Glyph = s.Glyph;
              return (
                <div key={s.id} onClick={() => toggle(s.id)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: 18,
                    background: on
                      ? `linear-gradient(135deg, ${hexA(ACCENT, 0.30)}, ${hexA(ACCENT, 0.12)})`
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${on ? hexA(ACCENT, 0.55) : 'rgba(255,255,255,0.10)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    transition: 'background .12s, border-color .12s',
                  }}>
                    <Glyph size={22} stroke={on ? '#FFE2C7' : 'rgba(255,255,255,0.78)'} />
                    {on && (
                      <div style={{
                        position: 'absolute', bottom: 6, display: 'flex', gap: 2,
                      }}>
                        {[0, 0.15, 0.3].map((d, i) => (
                          <div key={i} style={{
                            width: 2, height: 6, borderRadius: 1, transformOrigin: 'center',
                            background: '#FFE2C7',
                            animation: `sounds-bar 1.1s ease-in-out infinite`,
                            animationDelay: `${d}s`,
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11, textAlign: 'center', lineHeight: 1.2,
                    color: on ? W.ink : 'rgba(255,255,255,0.65)',
                    fontWeight: on ? 500 : 400, maxWidth: 70,
                  }}>{s.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomDock
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
        timerMin={timerMin}
        onOpenTimer={() => setShowTimer(true)}
        onAskNap={() => setShowNapSheet(true)}
        hasSounds={activeIds.length > 0}
      />

      {showTimer && (
        <TimerPicker
          minutes={timerMin}
          onSelect={(m) => { setTimerMin(m); setShowTimer(false); }}
          onClose={() => setShowTimer(false)}
        />
      )}

      {showNapSheet && (
        <NapSheet
          minutes={timerMin && timerMin > 0 ? timerMin : 30}
          mixCount={activeIds.length}
          onCancel={() => setShowNapSheet(false)}
          onConfirm={startNap}
        />
      )}
    </div>
  );
}

// Two pulsing concentric rings layered behind 4 vertical equalizer bars.
// Bars only animate when `playing` is true — when paused they sit at a
// quiet baseline so the screen reads as "muted" instantly.
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
            background: '#FFE7CF',
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

function BottomDock({
  playing, onTogglePlay, timerMin, onOpenTimer, onAskNap, hasSounds,
}: {
  playing: boolean; onTogglePlay: () => void;
  timerMin: number | null; onOpenTimer: () => void;
  onAskNap: () => void; hasSounds: boolean;
}) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '12px 16px calc(24px + env(safe-area-inset-bottom))',
      background: 'linear-gradient(180deg, rgba(14,14,17,0) 0%, rgba(14,14,17,0.85) 35%, rgba(14,14,17,0.96) 100%)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      pointerEvents: 'auto',
    }}>
      <div onClick={onAskNap} style={{
        marginBottom: 12, padding: '12px 14px', borderRadius: 16,
        background: `linear-gradient(135deg, ${hexA(ACCENT, 0.16)}, ${hexA(ACCENT, 0.04)})`,
        border: `1px solid ${hexA(ACCENT, 0.32)}`,
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 12,
          background: hexA(ACCENT, 0.22),
          border: `1px solid ${hexA(ACCENT, 0.50)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="#FFE2C7" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 14a8 8 0 0 1-10.5 7.5A9 9 0 0 0 21 14z" />
            <path d="M7 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: W.ink }}>
            Drifting off? Make this a nap
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
            We'll wake you {timerMin ? `in ${timerMin} min` : 'after 30 min'} and log the rest.
          </div>
        </div>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.55)" strokeWidth={2.4}
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div onClick={onOpenTimer} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '11px 14px', borderRadius: 999, cursor: 'pointer',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 13, fontWeight: 500, color: W.ink,
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8" />
            <path d="M9 2h6" />
            <path d="M12 9v4l3 2" />
          </svg>
          {timerMin ? `${timerMin} min` : 'Timer'}
        </div>

        <div style={{ flex: 1 }} />

        <div
          onClick={hasSounds ? onTogglePlay : undefined}
          aria-label={playing ? 'Pause' : 'Play'}
          style={{
            width: 60, height: 60, borderRadius: 30,
            background: hasSounds ? '#fff' : 'rgba(255,255,255,0.18)',
            color: '#0E0E11',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: hasSounds ? 'pointer' : 'default',
            boxShadow: hasSounds ? '0 10px 26px rgba(255,255,255,0.18)' : 'none',
            flexShrink: 0,
          }}
        >
          {playing
            ? (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            )
            : (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5l12 7-12 7z" />
              </svg>
            )}
        </div>
      </div>
    </div>
  );
}

function NapSheet({ minutes, mixCount, onCancel, onConfirm }: {
  minutes: number; mixCount: number; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <div onClick={onCancel} style={{
      position: 'absolute', inset: 0, zIndex: 90,
      background: 'rgba(8,9,12,0.62)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: W.bg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 20px calc(20px + env(safe-area-inset-bottom))',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.45)',
        color: W.ink, fontFamily: W.font,
        animation: 'sounds-sheet-up .26s ease',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: W.fill, margin: '0 auto 16px',
        }} />
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: `linear-gradient(135deg, ${hexA(ACCENT, 0.55)}, ${hexA(ACCENT, 0.18)})`,
          border: `1px solid ${hexA(ACCENT, 0.65)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
            stroke="#FFE2C7" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 14a8 8 0 0 1-10.5 7.5A9 9 0 0 0 21 14z" />
            <path d="M7 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
          </svg>
        </div>
        <div style={{
          fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', textAlign: 'center',
        }}>Turn this into a nap?</div>
        <div style={{
          fontSize: 13, color: W.weak, lineHeight: 1.5, textAlign: 'center',
          marginTop: 6, padding: '0 8px',
        }}>
          We'll keep your {mixCount > 0 ? `${mixCount}-sound mix` : 'sounds'} going, wake you in {minutes} min,
          and log this as a nap.
        </div>

        <div onClick={onConfirm} style={{
          marginTop: 18, padding: '16px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(0,0,0,0.22)',
        }}>Start nap · {minutes} min</div>
        <div onClick={onCancel} style={{
          marginTop: 10, padding: '14px 0', textAlign: 'center',
          fontSize: 14, color: W.weak, cursor: 'pointer',
        }}>Keep listening</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600,
      letterSpacing: 0.2, marginBottom: 10,
    }}>{children}</div>
  );
}

// A handful of soft stars sprinkled randomly. Computed once on mount
// so they don't reshuffle on every render.
function StarField() {
  const [stars] = useState(() => {
    const out = [] as { top: string; left: string; size: number; delay: string; dur: string }[];
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
  );
}

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((x) => sa.has(x));
}

function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

