import { useState } from 'react';
import { W } from '../tokens';
import { startTracking } from '../state/tracking';
import { BoltIcon, MoonGlyphIcon } from '../components/icons';
import { TopPad, LiquidGlassNav } from '../components/shared';
import { usePresets, type Preset } from '../state/store';

export function TrackPresets() {
  const presets = usePresets();
  const [editing, setEditing] = useState<string | null>(null);

  function startNewPreset() {
    const next = presets.add({ name: 'Untitled' });
    setEditing(next.id);
  }

  function startTrackingPreset(_p: Preset) {
    startTracking();
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative',
    }}>
      <TopPad />

      <div style={{ padding: '18px 20px 10px' }}>
        <div style={{
          fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: W.ink,
        }}>Presets</div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '0 16px 130px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {presets.list.map((p) => (
          <PresetCard
            key={p.id}
            preset={p}
            onEdit={() => setEditing(p.id)}
            onStart={() => startTrackingPreset(p)}
          />
        ))}
        <AddPresetCard onAdd={startNewPreset} />
      </div>

      <LiquidGlassNav active="track" />

      {editing && (() => {
        const p = presets.list.find((x) => x.id === editing);
        if (!p) return null;
        return (
          <PresetEditSheet
            preset={p}
            onChange={(patch) => presets.update(editing!, patch)}
            onDelete={() => { presets.remove(editing!); setEditing(null); }}
            onClose={() => setEditing(null)}
          />
        );
      })()}
    </div>
  );
}

function PresetCard({ preset, onEdit, onStart }: {
  preset: Preset; onEdit: () => void; onStart: () => void;
}) {
  const isNap = preset.type === 'nap';
  const big = preset.alarmMode === 'duration'
    ? `${preset.duration} min`
    : `${String(preset.wakeHour).padStart(2, '0')}:${String(preset.wakeMinute).padStart(2, '0')}`;
  const subLabel = preset.alarmMode === 'duration' ? 'Sleep for' : 'Wake up at';
  const title = (preset.name && preset.name !== 'Untitled')
    ? preset.name
    : (isNap ? 'Power Nap' : 'Sleep');

  const chips: string[] = [];
  if (preset.smartWakeup) chips.push('Smart wake-up');
  if (preset.audioRecordings) chips.push('Records sounds');
  if (preset.sleepAid?.on) chips.push(`Sound · ${preset.sleepAid.name || 'Forest'}`);
  if (preset.liveActivity) chips.push('Lock screen');
  if (!preset.alarmOn) chips.push('No alarm');

  return (
    <div onClick={onEdit} style={{
      background: '#1A1A1F',
      borderRadius: 24,
      padding: 18,
      display: 'flex', flexDirection: 'column', gap: 16,
      cursor: 'pointer',
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isNap ? <BoltIcon size={26} color="#fff" /> : <MoonGlyphIcon size={26} color="#fff" />}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontSize: 18, fontWeight: 600, color: '#fff',
            letterSpacing: '-0.01em', lineHeight: 1.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontSize: 32, fontWeight: 300, color: '#fff',
              letterSpacing: '-0.03em', lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>{big}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{subLabel}</span>
          </div>
        </div>

        <div
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          style={{
            width: 52, height: 52, borderRadius: 26,
            background: '#fff', color: '#0E0E11',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          aria-label="Start"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0E0E11">
            <path d="M7 5l12 7-12 7z" />
          </svg>
        </div>
      </div>

      {chips.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {chips.map((c) => (
            <span key={c} style={{
              fontSize: 11, fontWeight: 500,
              padding: '5px 10px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.75)',
              letterSpacing: '0.005em',
            }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function AddPresetCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div onClick={onAdd} style={{
      background: 'transparent',
      borderRadius: 22,
      padding: '24px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer',
      border: '1px dashed rgba(255,255,255,0.18)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 24,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E11" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>New preset</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Save another sleep or nap routine</div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, color = '#fff' }: { on: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 50, height: 30, borderRadius: 15, padding: 2,
      background: on ? color : 'rgba(255,255,255,0.16)',
      transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 13,
        background: on ? '#0E0E11' : '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        transform: on ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.2s, background 0.2s',
      }} />
    </div>
  );
}

function PresetEditSheet({ preset, onChange, onDelete, onClose }: {
  preset: Preset;
  onChange: (patch: Partial<Preset>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const timeStr = `${String(preset.wakeHour).padStart(2, '0')}:${String(preset.wakeMinute).padStart(2, '0')}`;
  function setTime(v: string) {
    const [h, m] = v.split(':').map(Number);
    onChange({ wakeHour: h, wakeMinute: m });
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        .preset-sheet input[type="time"] {
          background: transparent; border: none; color: #fff;
          font-size: 56px; font-weight: 300;
          font-family: inherit; letter-spacing: -0.04em;
          font-variant-numeric: tabular-nums;
          padding: 0; outline: none;
          -webkit-appearance: none; appearance: none;
          color-scheme: dark;
        }
        .preset-sheet input.preset-title {
          background: transparent; border: none; color: #fff;
          font-size: 26px; font-weight: 600; font-family: inherit;
          letter-spacing: -0.02em;
          padding: 0; outline: none; width: 100%;
        }
        .preset-sheet input.preset-title::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      <div style={{ height: 50, flexShrink: 0 }} />

      <div className="preset-sheet" style={{
        flex: 1,
        background: '#0E0E11',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        margin: '8px 0 0',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)',
          margin: '10px auto 14px',
        }} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
          <div style={{ marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              className="preset-title"
              type="text"
              value={preset.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Untitled preset"
            />
            <div style={{
              fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em',
            }}>
              {preset.type === 'nap' ? 'Power nap' : 'Sleep'}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 3,
            display: 'flex', marginBottom: 14,
          }}>
            {[
              { v: 'time' as const, label: 'Time' },
              { v: 'duration' as const, label: 'Duration' },
              { v: 'off' as const, label: 'No alarm' },
            ].map((opt) => {
              const active = (opt.v === 'off') ? !preset.alarmOn : (preset.alarmOn && preset.alarmMode === opt.v);
              return (
                <div key={opt.v} onClick={() => {
                  if (opt.v === 'off') onChange({ alarmOn: false });
                  else onChange({ alarmOn: true, alarmMode: opt.v });
                }} style={{
                  flex: 1, padding: '9px 0', textAlign: 'center',
                  borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: active ? '#fff' : 'transparent',
                  color: active ? '#0E0E11' : 'rgba(255,255,255,0.6)',
                  transition: 'background 0.15s, color 0.15s',
                }}>{opt.label}</div>
              );
            })}
          </div>

          {preset.alarmOn ? (
            <div style={{
              background: '#1A1A1F', borderRadius: 18,
              padding: '20px 20px 22px', marginBottom: 18,
            }}>
              <div style={{
                fontSize: 12, fontWeight: 500,
                color: 'rgba(255,255,255,0.55)',
                marginBottom: 6,
              }}>{preset.alarmMode === 'time' ? 'Wake up at' : 'Sleep for'}</div>

              {preset.alarmMode === 'time' ? (
                <input type="time" value={timeStr} onChange={(e) => setTime(e.target.value)} />
              ) : (
                <DurationPicker minutes={preset.duration} onChange={(v) => onChange({ duration: v })} />
              )}
            </div>
          ) : (
            <div style={{
              background: '#1A1A1F', borderRadius: 18,
              padding: '20px', marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 18,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l3 2" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>No alarm</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  Tracking only — wake up on your own.
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: '#1A1A1F', borderRadius: 18,
            marginBottom: 14, overflow: 'hidden',
          }}>
            {preset.alarmOn && (
              <SimpleRow
                title="Smart wake-up"
                subtitle="Wake within a 30-minute window when you sleep lightest."
                trailing={<Toggle on={preset.smartWakeup} onChange={(v) => onChange({ smartWakeup: v })} />}
              />
            )}
            <SimpleRow
              title="Record sleep sounds"
              subtitle="Capture snoring, sleep talk, and ambient noise."
              trailing={<Toggle on={preset.audioRecordings} onChange={(v) => onChange({ audioRecordings: v })} />}
            />
            <SimpleRow
              title="Lock screen widget"
              subtitle="Show tracking status on your Lock Screen."
              trailing={<Toggle on={preset.liveActivity} onChange={(v) => onChange({ liveActivity: v })} />}
              isLast
            />
          </div>

          <div style={{
            background: '#1A1A1F', borderRadius: 18,
            marginBottom: 22, overflow: 'hidden',
          }}>
            <SimpleRow
              title="Play sound while falling asleep"
              subtitle={preset.sleepAid.on
                ? `Plays "${preset.sleepAid.name}" until you fall asleep.`
                : 'Calming audio that fades out once you doze off.'}
              trailing={<Toggle on={preset.sleepAid.on} onChange={(v) => onChange({ sleepAid: { ...preset.sleepAid, on: v } })} />}
              isLast={!preset.sleepAid.on}
            />
            {preset.sleepAid.on && (
              <SoundPicker
                selected={preset.sleepAid.name}
                onSelect={(name) => onChange({ sleepAid: { ...preset.sleepAid, name } })}
              />
            )}
          </div>

          <div onClick={onDelete} style={{
            textAlign: 'center', padding: '6px 0',
            fontSize: 13, color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
          }}>Delete preset</div>
        </div>

        <div style={{
          padding: '12px 20px 28px',
          background: 'linear-gradient(to top, #0E0E11 60%, transparent)',
        }}>
          <div onClick={onClose} style={{
            background: '#fff', color: '#0E0E11',
            padding: '15px 0', borderRadius: 999, fontSize: 16, fontWeight: 500,
            cursor: 'pointer', textAlign: 'center',
          }}>Done</div>
        </div>
      </div>
    </div>
  );
}

function SimpleRow({ title, subtitle, trailing, isLast = false }: {
  title: string; subtitle?: string; trailing: React.ReactNode; isLast?: boolean;
}) {
  return (
    <div style={{
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3, lineHeight: 1.35 }}>{subtitle}</div>
        )}
      </div>
      {trailing}
    </div>
  );
}

function SoundPicker({ selected, onSelect }: { selected: string; onSelect: (name: string) => void }) {
  const sounds = ['Rain', 'Ocean', 'Forest', 'Fireplace', 'White noise', 'Brown noise', 'Crickets', 'Soft chimes', 'Thunder'];
  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '14px 18px 16px',
    }}>
      <div style={{
        fontSize: 12, fontWeight: 500,
        color: 'rgba(255,255,255,0.55)',
        marginBottom: 10,
      }}>Choose a sound</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sounds.map((s) => {
          const on = s === selected;
          return (
            <div key={s} onClick={() => onSelect(s)} style={{
              padding: '8px 14px', borderRadius: 999,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: on ? '#fff' : 'rgba(255,255,255,0.06)',
              color: on ? '#0E0E11' : 'rgba(255,255,255,0.75)',
              border: on ? '1px solid #fff' : '1px solid rgba(255,255,255,0.04)',
              transition: 'background 0.15s, color 0.15s',
            }}>{s}</div>
          );
        })}
      </div>
    </div>
  );
}

function DurationPicker({ minutes, onChange }: { minutes: number; onChange: (v: number) => void }) {
  const opts = [10, 15, 20, 25, 30, 45, 60, 90];
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{
        fontSize: 56, fontWeight: 300, color: '#fff',
        letterSpacing: '-0.04em', lineHeight: 1.05,
        fontVariantNumeric: 'tabular-nums',
      }}>{minutes}m</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {opts.map((o) => (
          <div key={o} onClick={() => onChange(o)} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: o === minutes ? '#fff' : 'rgba(255,255,255,0.08)',
            color: o === minutes ? '#0E0E11' : 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
          }}>{o}m</div>
        ))}
      </div>
    </div>
  );
}
