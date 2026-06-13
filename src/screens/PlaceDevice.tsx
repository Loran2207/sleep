import { W } from '../tokens';
import { go } from '../state/navigation';
import { NavButton } from '../components/shared';
import { CosmicBackdrop, CosmicMedallion } from '../components/cosmic';

// "Put your phone on the charger by the bed" — the last beat before
// tracking starts. Same cosmic language as the Sounds player, in blue,
// with a primary Continue and a lighter Skip so either path is one tap.
export function PlaceDevice() {
  function startTracking() { go('tracking-active'); }
  function skip() {
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

      <div style={{
        position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
        padding: '24px 24px 36px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}>
          <NavButton glyph="close" onClick={() => go('home')} />
          <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.65 }}>Setup</div>
          <div style={{ width: 36 }} />
        </div>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '12px 0',
        }}>
          <CosmicMedallion hue="blue" core={132}>
            <PhoneChargingGlyph />
          </CosmicMedallion>
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
          <div onClick={startTracking} style={{
            padding: '17px 0', textAlign: 'center', borderRadius: 999,
            background: '#fff', color: '#000000',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          }}>Continue</div>
          <div onClick={skip} style={{
            padding: '15px 0', textAlign: 'center', borderRadius: 999,
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.16)',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>Skip</div>
        </div>
      </div>
    </div>
  );
}

// A phone with a charging bolt — the icon inside the blue medallion.
function PhoneChargingGlyph() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
      <path d="M12.6 7.5l-2.3 3.4h3.4l-2.3 3.4" />
    </svg>
  );
}
