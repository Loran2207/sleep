import { W } from '../tokens';
import { back } from '../state/navigation';
import { TopPad, HeaderBar } from '../components/shared';
import { CheckIcon, NightShiftIcon } from '../components/icons';
import { useNightShiftDone } from '../state/store';

const STEPS: { title: string; body: string }[] = [
  { title: 'Open Settings', body: 'Find the Settings app on your phone.' },
  { title: 'Tap Display & Brightness', body: 'Scroll the list and choose this row.' },
  { title: 'Open Night Shift', body: "It's near the bottom, just above Auto-Lock." },
  { title: 'Turn on Scheduled', body: 'Toggle the switch next to "Scheduled".' },
  { title: 'Pick a warm temperature', body: 'Drag the slider toward "More warm".' },
];

export function NightShiftGuide() {
  const [done, setDone] = useNightShiftDone();

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font,
    }}>
      <TopPad />
      <HeaderBar title="Night Shift" onBack={() => back()} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '4px 0 16px',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: W.fill, border: `1px solid ${W.veryweak}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <NightShiftIcon size={28} stroke={W.ink} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Night Shift</div>
            <div style={{ fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.45 }}>
              Warms your screen after sunset to protect melatonin.
            </div>
          </div>
        </div>

        {done && (
          <div style={{
            background: 'rgba(127, 227, 161, 0.12)',
            border: '1px solid rgba(127, 227, 161, 0.45)',
            borderRadius: 16, padding: '12px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14,
              background: '#7FE3A1', color: '#000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CheckIcon size={15} stroke="#000000" />
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: W.ink, lineHeight: 1.4 }}>
              Marked as enabled. Your screen will warm at sunset.
            </div>
          </div>
        )}

        <div style={{
          padding: '12px 14px', marginBottom: 18,
          background: W.paper, border: `1px solid ${W.fill}`,
          borderRadius: 16, fontSize: 13, color: W.weak, lineHeight: 1.5,
        }}>
          On top of resting your eyes, Night Shift saves a small slice of battery on iOS.
        </div>

        <div style={{
          fontSize: 13, fontWeight: 600, color: W.weak, padding: '0 4px 12px',
        }}>How to turn it on</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14,
              background: W.paper, border: `1px solid ${W.fill}`,
              borderRadius: 16, padding: '14px 14px',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 15, flexShrink: 0,
                background: W.ink, color: W.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, lineHeight: 1.3 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.5 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px 24px', display: 'flex', gap: 10 }}>
        {done ? (
          <>
            <div onClick={() => setDone(false)} style={{
              flex: 1, padding: '16px 0', textAlign: 'center',
              background: 'transparent', color: W.ink,
              border: `1px solid ${W.fill}`, borderRadius: 999,
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>Mark as not done</div>
            <div onClick={() => back()} style={{
              flex: 2, padding: '16px 0', textAlign: 'center',
              background: W.ink, color: W.bg,
              borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
            }}>Done</div>
          </>
        ) : (
          <>
            <div onClick={() => back()} style={{
              flex: 1, padding: '16px 0', textAlign: 'center',
              background: 'transparent', color: W.ink,
              border: `1px solid ${W.fill}`, borderRadius: 999,
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>Not yet</div>
            <div onClick={() => { setDone(true); back(); }} style={{
              flex: 2, padding: '16px 0', textAlign: 'center',
              background: W.ink, color: W.bg,
              borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <CheckIcon size={14} stroke={W.bg} />
              I enabled it
            </div>
          </>
        )}
      </div>
    </div>
  );
}
