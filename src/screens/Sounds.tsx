import { W } from '../tokens';
import { back as goBack } from '../state/navigation';
import { TopPad, NavButton } from '../components/shared';
import { useMix } from '../state/store';
import { type QuickMix } from '../components/SoundMixerPanel';
import { SoundsMixerView, SoundsScreenBackdrop } from '../components/SoundsMixerView';

const QUICK_MIXES: QuickMix[] = [
  { id: 'rainy', name: 'Rainy night', sounds: ['rain', 'thunder', 'chimes'] },
  { id: 'cabin', name: 'Cabin',       sounds: ['campfire', 'forest', 'crickets'] },
  { id: 'ocean', name: 'Open ocean',  sounds: ['ocean', 'seagull', 'wind'] },
  { id: 'cafe',  name: 'Café focus',  sounds: ['coffee', 'keyboard'] },
];

export function SoundsPlayer() {
  const mix = useMix();
  const { state, togglePlay, setTimer } = mix;
  const playing = state.playing;
  const timerMin = state.timerMin;

  const mixCount = state.mix.length;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000000', color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <SoundsScreenBackdrop />

      <TopPad />

      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 18px 0',
      }}>
        <NavButton glyph="down" onClick={() => goBack()} />
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Sounds</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '0 20px 180px' }}>
        <SoundsMixerView
          binding={{
            mix: state.mix,
            setVol: mix.setVol,
            toggleSound: mix.toggleSound,
            removeSound: mix.removeSound,
            clearAll: mix.clearAll,
            setMixIds: mix.setMixIds,
            timerMin,
            setTimer,
          }}
          playing={playing}
          timerMin={timerMin}
          quickMixes={QUICK_MIXES}
        />
      </div>

      <PlayDock
        playing={playing}
        onTogglePlay={togglePlay}
        hasSounds={mixCount > 0}
      />
    </div>
  );
}

// Minimal bottom dock — just the play / pause control. The
// "Drifting off? Make this a nap" CTA used to live here; we now
// keep the Sounds surface pure listening and let the central
// sleep button on the nav own the bed-time flow.
function PlayDock({ playing, onTogglePlay, hasSounds }: {
  playing: boolean; onTogglePlay: () => void; hasSounds: boolean;
}) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '12px 16px calc(24px + env(safe-area-inset-bottom))',
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.96) 100%)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      pointerEvents: 'auto',
      display: 'flex', justifyContent: 'center',
    }}>
      <div
        onClick={hasSounds ? onTogglePlay : undefined}
        aria-label={playing ? 'Pause' : 'Play'}
        style={{
          width: 64, height: 64, borderRadius: 32,
          background: hasSounds ? '#fff' : 'rgba(255,255,255,0.18)',
          color: '#000000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: hasSounds ? 'pointer' : 'default',
          boxShadow: hasSounds ? '0 10px 26px rgba(255,255,255,0.18)' : 'none',
          flexShrink: 0,
        }}
      >
        {playing
          ? (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          )
          : (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5l12 7-12 7z" />
            </svg>
          )}
      </div>
    </div>
  );
}
