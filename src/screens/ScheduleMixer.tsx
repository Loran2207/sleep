import { W } from '../tokens';
import { back } from '../state/navigation';
import { TopPad } from '../components/shared';
import { GlyphChevDn } from '../components/icons';
import { useScheduleMix } from '../state/store';
import { SoundMixerPanel, type QuickMix } from '../components/SoundMixerPanel';

const SCHEDULE_QUICK_MIXES: QuickMix[] = [
  { id: 'rainy',   name: 'Rainy night', sounds: ['rain', 'thunder', 'chimes'] },
  { id: 'cabin',   name: 'Cabin',       sounds: ['campfire', 'forest', 'crickets'] },
  { id: 'ocean',   name: 'Open ocean',  sounds: ['ocean', 'seagull', 'wind'] },
  { id: 'quiet',   name: 'Just noise',  sounds: ['brown', 'whitenoise'] },
];

// ─── Schedule Mixer (per-preset multi-sound mix) ─────────────────
// Uses the shared SoundMixerPanel so editing a schedule's mix feels
// identical to editing the sleep-tracking mix or the standalone
// Sounds player.
export function ScheduleMix() {
  const { schedule, mix, setVol, removeSound, toggleSound, clearAll, setMixIds } = useScheduleMix();

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
        <div onClick={() => back()} style={{
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
        <div style={{ width: 36 }} />
      </div>

      <div style={{ position: 'relative', flex: 1, padding: '14px 20px 28px', overflowY: 'auto' }}>
        <SoundMixerPanel
          binding={{ mix, setVol, toggleSound, removeSound, clearAll, setMixIds }}
          quickMixes={SCHEDULE_QUICK_MIXES}
          theme="cool"
          emptyHint="Layer rain, fire, chimes — whatever you'd like to fall asleep to on this schedule. Each sound has its own volume."
        />
      </div>
    </div>
  );
}
