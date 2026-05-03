import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar, SectionHeader } from '../components/shared';
import { CheckIcon } from '../components/icons';
import { useDraft } from '../state/store';

export function SoundsCatalog() {
  const [draft, setDraft] = useDraft();
  const categories = [
    { label: 'Nature', items: ['Rain', 'Thunder', 'Ocean', 'Forest', 'River', 'Crickets'] },
    { label: 'Ambient', items: ['Soft chimes', 'Synth pad', 'Binaural', 'White noise', 'Brown noise'] },
    { label: 'Indoors', items: ['Fireplace', 'Fan', 'Coffee shop', 'Bookstore'] },
  ];
  const savedMixes = [
    { name: 'Rainy night', sounds: ['Rain', 'Thunder', 'Soft chimes'] },
    { name: 'Forest cabin', sounds: ['Forest', 'Fireplace', 'Crickets'] },
    { name: 'Open ocean', sounds: ['Ocean', 'Brown noise'] },
  ];

  function toggle(s: string) {
    const has = draft.sounds.includes(s);
    setDraft({ sounds: has ? draft.sounds.filter((x) => x !== s) : [...draft.sounds, s] });
  }
  function applyMix(mix: { sounds: string[] }) { setDraft({ sounds: [...mix.sounds] }); }
  function clearAll() { setDraft({ sounds: [] }); }

  const back = () => {
    if (draft.kind === 'nap') go('track-nap');
    else if (draft.kind === 'night') go('track-night');
    else go('home');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font }}>
      <TopPad />
      <HeaderBar
        title="Sounds"
        onBack={back}
        right={draft.sounds.length > 0
          ? <span onClick={clearAll} style={{ cursor: 'pointer', color: W.ink, fontSize: 13 }}>Clear</span>
          : ''}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 100px' }}>
        {draft.sounds.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18,
            padding: '14px 14px', background: W.paper,
            border: `1px solid ${W.fill}`, borderRadius: 16,
          }}>
            <div style={{ width: '100%', fontSize: 12, color: W.weak, marginBottom: 4 }}>
              Mixing {draft.sounds.length} {draft.sounds.length === 1 ? 'sound' : 'sounds'}
            </div>
            {draft.sounds.map((s) => (
              <div key={s} onClick={() => toggle(s)} style={{
                padding: '6px 10px 6px 12px', borderRadius: 999,
                background: W.ink, color: W.bg,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {s}
                <span style={{ opacity: 0.6, fontSize: 14, lineHeight: 1, marginTop: -1 }}>×</span>
              </div>
            ))}
          </div>
        )}

        <SectionHeader>Saved mixes</SectionHeader>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 0 8px' }}>
          {savedMixes.map((m) => (
            <div key={m.name} onClick={() => applyMix(m)} style={{
              flex: '0 0 auto', minWidth: 150,
              padding: '14px 14px', background: W.paper,
              border: `1px solid ${W.fill}`, borderRadius: 16, cursor: 'pointer',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: W.weak, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.sounds.join(' · ')}
              </div>
            </div>
          ))}
          <div style={{
            flex: '0 0 auto', minWidth: 150,
            padding: '14px 14px',
            border: `1px dashed ${W.fill}`, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: W.weak, fontSize: 13, cursor: 'pointer',
          }}>+ Save current</div>
        </div>

        {categories.map((cat) => (
          <div key={cat.label}>
            <SectionHeader style={{ marginTop: 22 }}>{cat.label}</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {cat.items.map((s) => {
                const on = draft.sounds.includes(s);
                return (
                  <div key={s} onClick={() => toggle(s)} style={{
                    padding: '14px 14px', borderRadius: 14, cursor: 'pointer',
                    background: on ? W.ink : W.paper,
                    color: on ? W.bg : W.ink,
                    border: on ? `1px solid ${W.ink}` : `1px solid ${W.fill}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{s}</div>
                    <div style={{
                      width: 22, height: 22, borderRadius: 11,
                      border: `1.5px solid ${on ? W.bg : W.veryweak}`,
                      background: on ? W.bg : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{on && <CheckIcon size={14} stroke={W.ink} />}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 22, left: 14, right: 14,
        padding: '14px 0', textAlign: 'center',
        background: W.ink, color: W.bg, borderRadius: 999,
        fontSize: 15, fontWeight: 600, cursor: 'pointer',
      }} onClick={back}>Done</div>
    </div>
  );
}
