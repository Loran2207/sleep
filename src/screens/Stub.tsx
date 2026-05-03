import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar, LiquidGlassNav } from '../components/shared';

export function StubScreen({ title, hint }: { title: string; hint: string }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad />
      <HeaderBar title={title} onBack={() => go('home')} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36, background: W.fill,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <div style={{ fontSize: 28, color: W.weak }}>·</div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 8, maxWidth: 240, lineHeight: 1.5 }}>{hint}</div>
      </div>
      <LiquidGlassNav active="home" />
    </div>
  );
}
