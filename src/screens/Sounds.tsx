import { useState } from 'react';
import { W } from '../tokens';
import { back as goBack } from '../state/navigation';
import { TopPad, TimerPicker } from '../components/shared';
import { startTracking } from '../state/tracking';
import { useDraft, useMix } from '../state/store';
import { lookupSound } from '../data/sounds';
import { type QuickMix } from '../components/SoundMixerPanel';
import { SoundsMixerView, SoundsScreenBackdrop } from '../components/SoundsMixerView';

const ACCENT = '#FF8E7C';
const ACCENT_LIGHT = '#FFE0DA';

const QUICK_MIXES: QuickMix[] = [
  { id: 'rainy', name: 'Rainy night', sounds: ['rain', 'thunder', 'chimes'] },
  { id: 'cabin', name: 'Cabin',       sounds: ['campfire', 'forest', 'crickets'] },
  { id: 'ocean', name: 'Open ocean',  sounds: ['ocean', 'seagull', 'wind'] },
  { id: 'cafe',  name: 'Café focus',  sounds: ['coffee', 'keyboard'] },
];

export function SoundsPlayer() {
  // Player + tracking share the same mix store, so a layered mix
  // curated here carries straight into a nap with no copying.
  const mix = useMix();
  const { state, togglePlay, setTimer } = mix;
  const playing = state.playing;
  const timerMin = state.timerMin;

  const [showTimer, setShowTimer] = useState(false);
  const [showNapSheet, setShowNapSheet] = useState(false);
  const [, setDraft] = useDraft();

  function onOpenTimer() { setShowTimer(true); }
  function onTimerSelect(m: number | null) { setTimer(m); setShowTimer(false); }

  function startNap() {
    const names = state.mix
      .map((s) => lookupSound(s.id)?.name)
      .filter((x): x is string => !!x);
    setDraft({
      kind: 'nap',
      napMinutes: timerMin && timerMin > 0 ? timerMin : 30,
      sounds: names.length ? names : ['Rain'],
    });
    setShowNapSheet(false);
    startTracking();
  }

  const mixCount = state.mix.length;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E0E11', color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes sounds-sheet-up {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <SoundsScreenBackdrop />

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

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '0 20px 260px' }}>
        <SoundsMixerView
          binding={{
            mix: state.mix,
            setVol: mix.setVol,
            toggleSound: mix.toggleSound,
            removeSound: mix.removeSound,
            clearAll: mix.clearAll,
            setMixIds: mix.setMixIds,
          }}
          playing={playing}
          timerMin={timerMin}
          quickMixes={QUICK_MIXES}
        />
      </div>

      <BottomDock
        playing={playing}
        onTogglePlay={togglePlay}
        timerMin={timerMin}
        onOpenTimer={onOpenTimer}
        onAskNap={() => setShowNapSheet(true)}
        hasSounds={mixCount > 0}
      />

      {showTimer && (
        <TimerPicker
          minutes={timerMin}
          onSelect={onTimerSelect}
          onClose={() => setShowTimer(false)}
        />
      )}

      {showNapSheet && (
        <NapSheet
          minutes={timerMin && timerMin > 0 ? timerMin : 30}
          mixCount={mixCount}
          onCancel={() => setShowNapSheet(false)}
          onConfirm={startNap}
        />
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
            stroke={ACCENT_LIGHT} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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
            stroke={ACCENT_LIGHT} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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


function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
