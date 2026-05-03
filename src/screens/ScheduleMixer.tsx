import { useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, VolumeSlider } from '../components/shared';
import {
  GlyphPlus, GlyphChevDn, GlyphTrash,
} from '../components/icons';
import { useScheduleMix } from '../state/store';
import { SOUND_CATALOG, SOUND_CATEGORIES, lookupSound, type SoundCategory } from '../data/sounds';

// ─── Schedule Mixer (per-preset multi-sound mix) ─────────────────
export function ScheduleMix() {
  const { schedule, mix, setVol, removeSound, clearAll } = useScheduleMix();

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
        <div onClick={() => go('sleep-schedule')} style={{
          width: 36, height: 36, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.85)',
        }}>
          <GlyphChevDn size={18} stroke="currentColor" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Mix</div>
          {schedule && (
            <div style={{ fontSize: 11, opacity: 0.45, marginTop: 1 }}>{schedule.name}</div>
          )}
        </div>
        <div onClick={mix.length === 0 ? undefined : clearAll} style={{
          fontSize: 13, color: mix.length === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
          cursor: mix.length === 0 ? 'default' : 'pointer',
        }}>Clear all</div>
      </div>

      <div style={{ position: 'relative', flex: 1, padding: '16px 20px 20px', overflowY: 'auto' }}>
        {mix.length === 0 ? (
          <EmptyMix />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {mix.map((item) => {
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
            <div onClick={() => go('schedule-sounds')} style={{
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
      <div onClick={() => go('schedule-sounds')} style={{
        marginTop: 14, padding: '10px 18px', borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.25)',
        color: '#fff', fontSize: 13, cursor: 'pointer',
      }}>Browse sounds</div>
    </div>
  );
}

// ─── Schedule Sounds Catalog ────────────────────────────────────
export function ScheduleSounds() {
  const { mix, toggleSound } = useScheduleMix();
  const [cat, setCat] = useState<SoundCategory>('all');
  const visible = cat === 'all' ? SOUND_CATALOG : SOUND_CATALOG.filter((s) => s.cat === cat);
  const activeIds = new Set(mix.map((s) => s.id));

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
        <div onClick={() => go('schedule-mix')} style={{
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
        borderRadius: 14, padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      }}>
        <div onClick={() => go('schedule-mix')} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {mix.length === 0 ? 'No sounds' : (mix.length === 1 ? lookupSound(mix[0].id)?.name : 'Mix')}
          </div>
          <div style={{ fontSize: 11, opacity: 0.55, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {mix.length === 0 ? 'Tap a sound above' : `${mix.length} sound${mix.length === 1 ? '' : 's'}`}
          </div>
        </div>
        <div onClick={() => go('schedule-mix')} style={{
          padding: '8px 14px', borderRadius: 999,
          background: '#fff', color: '#0E1014',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Done</div>
      </div>
    </div>
  );
}
