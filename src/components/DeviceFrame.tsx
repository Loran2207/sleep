import type { ReactNode } from 'react';

// iPhone-shaped device frame for desktop preview.
// Per user request: skip the iPhone status bar (time/battery) — but keep the
// dynamic island and home indicator so the screen content lays out correctly.
export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="device-frame" style={{
      width: 402,
      height: 874,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: '#000',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
        pointerEvents: 'none',
      }} />
      {/* Screen content */}
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
      </div>
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 8, pointerEvents: 'none',
      }}>
        <div style={{
          width: 139, height: 5, borderRadius: 100,
          background: 'rgba(255,255,255,0.7)',
        }} />
      </div>
    </div>
  );
}
