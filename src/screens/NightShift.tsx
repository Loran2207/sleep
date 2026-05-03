import { useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar, SectionHeader, LiquidGlassNav, Row, Divider } from '../components/shared';
import { BellIcon, MoonIcon, NightShiftIcon } from '../components/icons';

export function NightShift() {
  const [enabled, setEnabled] = useState(true);
  const [warmth, setWarmth] = useState(70);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad />
      <HeaderBar title="Night Shift" onBack={() => go('home')} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 130px' }}>
        <div style={{ fontSize: 13, color: W.weak, padding: '4px 4px 16px', lineHeight: 1.5 }}>
          Shifts your screen to warmer colors after sunset to reduce blue light exposure.
        </div>

        <div style={{
          background: W.paper, borderRadius: 18, padding: 4,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
        }}>
          <div onClick={() => setEnabled(!enabled)} style={{
            padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16, background: W.fill,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><NightShiftIcon size={20} stroke={W.ink} /></div>
            <div style={{ flex: 1, fontSize: 14 }}>Enable Night Shift</div>
            <div style={{
              width: 44, height: 26, borderRadius: 13,
              background: enabled ? W.ink : W.fillDark,
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: enabled ? 21 : 3,
                width: 20, height: 20, borderRadius: 10, background: W.paper,
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        </div>

        <SectionHeader style={{ marginTop: 20 }}>Schedule</SectionHeader>
        <div style={{
          background: W.paper, borderRadius: 18, padding: 4,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
        }}>
          <Row icon={<MoonIcon size={20} stroke={W.ink} />} label="From" value="Sunset" />
          <Divider />
          <Row icon={<BellIcon size={20} stroke={W.ink} />} label="To" value="Sunrise" />
        </div>

        <SectionHeader style={{ marginTop: 20 }}>Color temperature</SectionHeader>
        <div style={{
          background: W.paper, borderRadius: 18, padding: 20,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: W.weak, marginBottom: 8 }}>
            <span>Less warm</span><span>More warm</span>
          </div>
          <div style={{
            height: 8, borderRadius: 4, position: 'relative',
            background: 'linear-gradient(to right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.6) 100%)',
          }}>
            <div style={{
              position: 'absolute', top: -8, left: `${warmth}%`, transform: 'translateX(-50%)',
              width: 24, height: 24, borderRadius: 12, background: W.paper,
              border: `1.5px solid ${W.ink}`, boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }} />
          </div>
          <input type="range" min="0" max="100" value={warmth} onChange={(e) => setWarmth(+e.target.value)}
            style={{ width: '100%', marginTop: 8, opacity: 0.01, height: 24 }} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 4 }}>
        <div onClick={() => go('home')} style={{
          padding: '16px 0', textAlign: 'center', background: W.ink, color: W.paper,
          borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        }}>Save</div>
      </div>

      <LiquidGlassNav active="home" />
    </div>
  );
}
