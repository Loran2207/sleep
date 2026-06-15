import { W } from '../tokens';
import { go, back } from '../state/navigation';
import { TopPad, HeaderBar } from '../components/shared';
import { CosmicBackdrop, CosmicMedallion } from '../components/cosmic';

// "Put your phone on the charger by the bed" — the last beat before
// tracking starts. Same nav header as the wind-down screen (back arrow +
// centred title) and the same full-width buttons.
export function PlaceDevice() {
  function startTracking() { go('tracking-active'); }
  function dontShowAgain() {
    try { localStorage.setItem('place-device-dismissed', '1'); } catch {}
    go('tracking-active');
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000000', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <CosmicBackdrop hue="blue" />
      <TopPad />
      <HeaderBar title="Setup" onBack={() => back()} />

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <CosmicMedallion hue="blue" core={132}>
          <PhoneChargingGlyph />
        </CosmicMedallion>
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Place the device as pictured</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 10, opacity: 0.65, maxWidth: 280, margin: '10px auto 0' }}>
            Put your phone next to the bed and keep the charger connected.
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', padding: '12px 16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div onClick={startTracking} style={primaryCtaStyle}>Continue</div>
        <div onClick={dontShowAgain} style={secondaryCtaStyle}>Don't show again</div>
      </div>
    </div>
  );
}

const primaryCtaStyle: React.CSSProperties = {
  padding: '18px 0', textAlign: 'center', background: '#fff', color: '#000000',
  borderRadius: 999, fontSize: 16, fontWeight: 600, cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
};

const secondaryCtaStyle: React.CSSProperties = {
  padding: '17px 0', textAlign: 'center', background: 'rgba(255,255,255,0.08)', color: '#fff',
  border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, fontSize: 15, fontWeight: 500, cursor: 'pointer',
};

function PhoneChargingGlyph() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
      <path d="M12.6 7.5l-2.3 3.4h3.4l-2.3 3.4" />
    </svg>
  );
}
