import { useEffect, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  GlyphPlay, GlyphPause, GlyphSliders, GlyphPlus, GlyphChevDn, GlyphTrash,
  GlyphTimer, GlyphHeart, GlyphRain, GlyphFlame, GlyphFlute, GlyphOcean, GlyphForest,
  GlyphCricket, GlyphChimes, GlyphWhite, GlyphFan, GlyphWind, GlyphCoffee, GlyphBook,
  GlyphThunder, GlyphRiver, GlyphSynth, GlyphBinaural, GlyphBrown, GlyphKeyboard, GlyphSeagull,
} from '../components/icons';
import { TopPad, CircleAction } from '../components/shared';
import { useMix } from '../state/store';
import type { IconProps } from '../components/icons';

const SOUND_CATALOG: { id: string; name: string; cat: string; Glyph: (p: IconProps) => JSX.Element }[] = [
  { id: 'rain', name: 'Rain', cat: 'nature', Glyph: GlyphRain },
  { id: 'thunder', name: 'Thunder', cat: 'nature', Glyph: GlyphThunder },
  { id: 'ocean', name: 'Ocean waves', cat: 'nature', Glyph: GlyphOcean },
  { id: 'forest', name: 'Forest', cat: 'nature', Glyph: GlyphForest },
  { id: 'river', name: 'River', cat: 'nature', Glyph: GlyphRiver },
  { id: 'crickets', name: 'Crickets', cat: 'nature', Glyph: GlyphCricket },
  { id: 'wind', name: 'Wind', cat: 'nature', Glyph: GlyphWind },
  { id: 'campfire', name: 'Campfire', cat: 'indoor', Glyph: GlyphFlame },
  { id: 'fan', name: 'Fan', cat: 'indoor', Glyph: GlyphFan },
  { id: 'coffee', name: 'Coffee shop', cat: 'indoor', Glyph: GlyphCoffee },
  { id: 'keyboard', name: 'Keyboard', cat: 'indoor', Glyph: GlyphKeyboard },
  { id: 'bookstore', name: 'Bookstore', cat: 'indoor', Glyph: GlyphBook },
  { id: 'chimes', name: 'Soft chimes', cat: 'ambient', Glyph: GlyphChimes },
  { id: 'flute', name: 'Flute', cat: 'ambient', Glyph: GlyphFlute },
  { id: 'synth', name: 'Synth pad', cat: 'ambient', Glyph: GlyphSynth },
  { id: 'binaural', name: 'Binaural', cat: 'ambient', Glyph: GlyphBinaural },
  { id: 'whitenoise', name: 'White noise', cat: 'noise', Glyph: GlyphWhite },
  { id: 'brown', name: 'Brown noise', cat: 'noise', Glyph: GlyphBrown },
  { id: 'seagull', name: 'Seagulls', cat: 'nature', Glyph: GlyphSeagull },
];

const SOUND_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'nature', label: 'Nature' },
  { id: 'indoor', label: 'Indoor' },
  { id: 'ambient', label: 'Ambient' },
  { id: 'noise', label: 'Noise' },
];

function lookupSound(id: string) {
  return SOUND_CATALOG.find((s) => s.id === id);
}

// ─── Tracking Active ─────────────────────────────────────────────
export function TrackingActive() {
  const { state, togglePlay } = useMix();
  const [seconds, setSeconds] = useState(7 * 3600 + 12 * 60);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 60)), 6000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const mixSummary = state.mix.length === 0
    ? 'Silent'
    : state.mix.map((s) => lookupSound(s.id)?.name || s.id).join(', ');
  const mixTitle = state.mix.length === 0
    ? 'No sounds'
    : state.mix.length === 1 ? (lookupSound(state.mix[0].id)?.name || 'Sound') : 'Mix';

  const [now, setNow] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNow(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E1014', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `
        radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent 50%),
        radial-gradient(1px 1px at 70% 18%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 45% 60%, rgba(255,255,255,0.3), transparent 50%),
        radial-gradient(1.5px 1.5px at 85% 70%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.3), transparent 50%)`,
      }} />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '4px 20px', alignItems: 'center' }}>
        <div onClick={() => go('tracking-stop-confirm')} style={{ fontSize: 14, color: '#fff', cursor: 'pointer', opacity: 0.75 }}>End</div>
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Tracking</div>
        <div style={{ width: 30 }} />
      </div>

      <div style={{
        position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '8px 20px 12px', textAlign: 'center',
      }}>
        <div style={{
          fontSize: 88, fontWeight: 200, letterSpacing: -3,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{now}</div>

        <div style={{
          marginTop: 10, fontSize: 13, opacity: 0.6,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span>Alarm</span>
          <span style={{
            color: '#fff', opacity: 0.95,
            borderBottom: '1px dashed rgba(255,255,255,0.4)',
            paddingBottom: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{state.alarm}</span>
        </div>

        <div style={{ fontSize: 12, opacity: 0.45, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
          Wakes you in {h}h {String(m).padStart(2, '0')}m
        </div>
      </div>

      <div style={{ position: 'relative', padding: '0 20px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div onClick={togglePlay} style={{
            width: 40, height: 40, borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            {state.playing ? <GlyphPause size={14} stroke="#fff" /> : <GlyphPlay size={14} stroke="#fff" style={{ marginLeft: 2 }} />}
          </div>
          <div onClick={() => go('tracking-mixer')} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>{mixTitle}</div>
            <div style={{
              fontSize: 11, opacity: 0.55, marginTop: 3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{mixSummary}</div>
          </div>
          <div onClick={() => go('tracking-mixer')} style={{
            width: 36, height: 36, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.85)', flexShrink: 0,
          }}>
            <GlyphSliders size={16} stroke="currentColor" />
          </div>
          <div onClick={() => go('tracking-sounds')} style={{
            width: 36, height: 36, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.85)', flexShrink: 0,
          }}>
            <GlyphPlus size={16} stroke="currentColor" />
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative', padding: '18px 20px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div onClick={() => go('tracking-stop-confirm')} style={{
          padding: '12px 22px', borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.85)',
          fontSize: 13, cursor: 'pointer',
        }}>Quit tracking</div>
      </div>
    </div>
  );
}

// ─── Tracking Mixer ─────────────────────────────────────────────
export function TrackingMixer() {
  const { state, setVol, removeSound, clearAll, togglePlay } = useMix();

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E1014', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `
        radial-gradient(1px 1px at 18% 25%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 78% 18%, rgba(255,255,255,0.35), transparent 50%),
        radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.25), transparent 50%)`,
      }} />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px' }}>
        <div onClick={() => go('tracking-active')} style={{
          width: 36, height: 36, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.85)',
        }}>
          <GlyphChevDn size={18} stroke="currentColor" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Mix</div>
        <div onClick={clearAll} style={{
          fontSize: 13, color: state.mix.length === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
          cursor: state.mix.length === 0 ? 'default' : 'pointer',
        }}>Clear all</div>
      </div>

      <div style={{ position: 'relative', flex: 1, padding: '16px 20px 20px', overflowY: 'auto' }}>
        {state.mix.length === 0 ? (
          <EmptyMix />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {state.mix.map((item) => {
              const meta = lookupSound(item.id);
              if (!meta) return null;
              const Glyph = meta.Glyph;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 22,
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Glyph size={20} stroke="rgba(255,255,255,0.9)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{meta.name}</div>
                    <VolumeSlider value={item.vol} onChange={(v) => setVol(item.id, v)} />
                  </div>
                  <div onClick={() => removeSound(item.id)} style={{
                    width: 36, height: 36, borderRadius: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.55)', cursor: 'pointer', flexShrink: 0,
                  }}>
                    <GlyphTrash size={16} stroke="currentColor" />
                  </div>
                </div>
              );
            })}
            <div onClick={() => go('tracking-sounds')} style={{
              marginTop: 8, padding: '14px 0', textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.22)', borderRadius: 14,
              fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <GlyphPlus size={14} stroke="currentColor" />
              Add sound
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'relative', padding: '14px 24px 32px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <CircleAction icon={<GlyphTimer size={18} stroke="currentColor" />} label="Timer" />
        <div onClick={togglePlay} style={{
          width: 64, height: 64, borderRadius: 32,
          background: '#fff', color: '#0E1014',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          {state.playing ? <GlyphPause size={22} stroke="#0E1014" /> : <GlyphPlay size={22} stroke="#0E1014" style={{ marginLeft: 3 }} />}
        </div>
        <CircleAction icon={<GlyphHeart size={18} stroke="currentColor" />} label="Save mix" />
      </div>
    </div>
  );
}

function EmptyMix() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px', textAlign: 'center',
      color: 'rgba(255,255,255,0.55)',
    }}>
      <div style={{ fontSize: 14 }}>No sounds yet.</div>
      <div onClick={() => go('tracking-sounds')} style={{
        marginTop: 14, padding: '10px 18px', borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.25)',
        color: '#fff', fontSize: 13, cursor: 'pointer',
      }}>Browse sounds</div>
    </div>
  );
}

function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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

// ─── Tracking Sounds Catalog ────────────────────────────────────
export function TrackingSounds() {
  const { state, toggleSound } = useMix();
  const [cat, setCat] = useState<string>('all');
  const visible = cat === 'all' ? SOUND_CATALOG : SOUND_CATALOG.filter((s) => s.cat === cat);
  const activeIds = new Set(state.mix.map((s) => s.id));

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E1014', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `
        radial-gradient(1px 1px at 18% 25%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 78% 18%, rgba(255,255,255,0.35), transparent 50%),
        radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.25), transparent 50%)`,
      }} />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px' }}>
        <div onClick={() => go('tracking-mixer')} style={{
          width: 36, height: 36, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.85)',
        }}>
          <GlyphChevDn size={18} stroke="currentColor" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Sounds</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{
        position: 'relative', padding: '8px 16px 12px',
        display: 'flex', gap: 8, overflowX: 'auto',
      }}>
        {SOUND_CATEGORIES.map((c) => {
          const active = c.id === cat;
          return (
            <div key={c.id} onClick={() => setCat(c.id)} style={{
              flex: '0 0 auto', padding: '8px 16px', borderRadius: 999,
              background: active ? '#fff' : 'rgba(255,255,255,0.06)',
              color: active ? '#0E1014' : 'rgba(255,255,255,0.85)',
              border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.14)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>{c.label}</div>
          );
        })}
      </div>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '4px 16px 110px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px 8px' }}>
          {visible.map((s) => {
            const Glyph = s.Glyph;
            const on = activeIds.has(s.id);
            return (
              <div key={s.id} onClick={() => toggleSound(s.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 28,
                  background: on ? '#fff' : 'rgba(255,255,255,0.06)',
                  border: on ? '1px solid #fff' : '1px solid rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  transition: 'background .12s, border-color .12s',
                }}>
                  <Glyph size={22} stroke={on ? '#0E1014' : 'rgba(255,255,255,0.85)'} />
                  {on && (
                    <div style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 16, height: 16, borderRadius: 8,
                      background: '#0E1014', border: '1px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 700, lineHeight: 1,
                    }}>·</div>
                  )}
                </div>
                <div style={{
                  fontSize: 11, textAlign: 'center', lineHeight: 1.2,
                  color: on ? '#fff' : 'rgba(255,255,255,0.7)',
                  maxWidth: 70, fontWeight: on ? 500 : 400,
                }}>{s.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 22, left: 16, right: 16,
        background: 'rgba(20,22,28,0.95)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      }}>
        <div onClick={() => go('tracking-active')} style={{
          width: 36, height: 36, borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <GlyphPlay size={12} stroke="#fff" style={{ marginLeft: 2 }} />
        </div>
        <div onClick={() => go('tracking-mixer')} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {state.mix.length === 0 ? 'No sounds' : (state.mix.length === 1 ? lookupSound(state.mix[0].id)?.name : 'Mix')}
          </div>
          <div style={{ fontSize: 11, opacity: 0.55, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {state.mix.length === 0 ? 'Tap a sound above' : `${state.mix.length} item${state.mix.length === 1 ? '' : 's'}`}
          </div>
        </div>
        <div onClick={() => go('tracking-mixer')} style={{
          width: 32, height: 32, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
        }}>
          <GlyphSliders size={14} stroke="currentColor" />
        </div>
      </div>
    </div>
  );
}

// ─── Stop confirm ───────────────────────────────────────────────
export function TrackingStopConfirm() {
  return (
    <div style={{ height: '100%', background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontFamily: W.font, color: W.ink }}>
      <div style={{
        background: W.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 0 32px',
      }}>
        <div style={{ width: 36, height: 4, background: W.veryweak, borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Stop tracking?</div>
          <div style={{ fontSize: 13, color: W.weak, marginTop: 8, lineHeight: 1.5 }}>
            Your sleep session will end and the alarm will be cancelled.
          </div>
        </div>
        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div onClick={() => go('home')} style={{
            padding: '14px 0', textAlign: 'center', background: W.ink, color: W.paper,
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>End session</div>
          <div onClick={() => go('tracking-active')} style={{
            padding: '14px 0', textAlign: 'center', border: `1.5px solid ${W.veryweak}`,
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Keep tracking</div>
        </div>
      </div>
    </div>
  );
}
