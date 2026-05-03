import { W } from '../tokens';
import { go } from '../state/navigation';
import { GlyphX } from '../components/icons';

export function PlaceDevice() {
  const dontShowAgain = () => {
    try { localStorage.setItem('place-device-dismissed', '1'); } catch {}
    go('tracking-active');
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0E1014', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, background: `
          radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.5), transparent 50%),
          radial-gradient(1px 1px at 75% 12%, rgba(255,255,255,0.4), transparent 50%),
          radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.25), transparent 50%),
          radial-gradient(1.5px 1.5px at 88% 60%, rgba(255,255,255,0.4), transparent 50%),
          radial-gradient(1px 1px at 30% 78%, rgba(255,255,255,0.3), transparent 50%),
          radial-gradient(1px 1px at 65% 85%, rgba(255,255,255,0.3), transparent 50%)`,
      }} />

      <div style={{
        position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
        padding: '24px 24px 36px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}>
          <div onClick={() => go('home')} style={{
            width: 36, height: 36, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
          }}>
            <GlyphX size={18} stroke="currentColor" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Setup</div>
          <div style={{ width: 36 }} />
        </div>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px 0',
        }}>
          <PhoneOnChargerIllo />
        </div>

        <div style={{ textAlign: 'center', padding: '0 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Place the device as pictured
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 10, opacity: 0.65, maxWidth: 280, margin: '10px auto 0' }}>
            Put your phone next to the bed and keep the charger connected.
          </div>
        </div>

        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div onClick={() => go('tracking-active')} style={{
            padding: '17px 0', textAlign: 'center', borderRadius: 999,
            background: '#fff', color: '#0E1014',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>Continue</div>
          <div onClick={dontShowAgain} style={{
            padding: '12px 0', textAlign: 'center',
            color: 'rgba(255,255,255,0.55)', fontSize: 13, cursor: 'pointer',
          }}>Don't show again</div>
        </div>
      </div>
    </div>
  );
}

function PhoneOnChargerIllo() {
  return (
    <div style={{ position: 'relative', width: 230, height: 230 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 55%, rgba(255,255,255,0.07), transparent 65%)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', left: 18, right: 18, top: 110, height: 90,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 22,
        transform: 'perspective(420px) rotateX(46deg)',
        transformOrigin: 'center top',
      }} />
      <div style={{
        position: 'absolute', left: 70, top: 50,
        width: 90, height: 150, borderRadius: 16,
        background: 'rgba(255,255,255,0.06)',
        border: '1.5px solid rgba(255,255,255,0.55)',
        boxShadow: 'inset 0 0 30px rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)',
        transform: 'rotate(-6deg)',
      }}>
        <div style={{
          position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)',
          width: 28, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.4)',
        }} />
        <div style={{
          position: 'absolute', inset: 6, borderRadius: 11,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.12)',
        }} />
      </div>
      <svg width="230" height="230" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <path
          d="M 80 195 C 50 220, 20 200, 28 168 C 35 140, 80 145, 70 110"
          fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round"
        />
        <rect x="70" y="190" width="14" height="8" rx="1.5"
          fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" transform="rotate(-6 77 194)" />
      </svg>
    </div>
  );
}
