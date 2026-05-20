import { W } from '../tokens';
import { back } from '../state/navigation';
import { TopPad } from '../components/shared';
import { GlyphChevDn } from '../components/icons';
import { useScheduleMix, useMix } from '../state/store';
import { type QuickMix } from '../components/SoundMixerPanel';
import { SoundsMixerView, SoundsScreenBackdrop } from '../components/SoundsMixerView';

const SCHEDULE_QUICK_MIXES: QuickMix[] = [
  { id: 'rainy',   name: 'Rainy night', sounds: ['rain', 'thunder', 'chimes'] },
  { id: 'cabin',   name: 'Cabin',       sounds: ['campfire', 'forest', 'crickets'] },
  { id: 'ocean',   name: 'Open ocean',  sounds: ['ocean', 'seagull', 'wind'] },
  { id: 'quiet',   name: 'Just noise',  sounds: ['brown', 'whitenoise'] },
];

// Per-schedule mix editor, reusing the SoundsMixerView so picking
// sounds for the night feels identical to the standalone Sounds
// player on the Tools tab.
export function ScheduleMix() {
  const { schedule, mix, setVol, removeSound, toggleSound, clearAll, setMixIds } = useScheduleMix();
  // We piggy-back on the global mix-store's playing state so the
  // visualizer animates while the user is auditioning sounds elsewhere
  // in the app. (Editing a schedule does not by itself start playback.)
  const { state } = useMix();

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E1014', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <SoundsScreenBackdrop />
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

      <div style={{ position: 'relative', flex: 1, padding: '0 20px 40px', overflowY: 'auto' }}>
        <SoundsMixerView
          binding={{ mix, setVol, toggleSound, removeSound, clearAll, setMixIds }}
          playing={state.playing}
          quickMixes={SCHEDULE_QUICK_MIXES}
          emptyHint="Layer rain, fire, chimes — whatever you'd like to fall asleep to on this schedule. Each sound has its own volume."
        />
      </div>
    </div>
  );
}
