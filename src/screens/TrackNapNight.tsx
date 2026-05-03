import { W } from '../tokens';
import { go } from '../state/navigation';
import { startTracking } from '../state/tracking';
import { TopPad, HeaderBar } from '../components/shared';
import { MusicIcon, ChevronRightIcon } from '../components/icons';
import { useDraft, type SleepDraft } from '../state/store';

function napEndLabel(min: number) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + min);
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function TrackNap() {
  const [draft, setDraft] = useDraft();
  const presets = [15, 20, 30, 45, 60, 90];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font }}>
      <TopPad />
      <HeaderBar title="Quick nap" onBack={() => go('track-mode')} />

      <div style={{ flex: 1, padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ fontSize: 13, color: W.weak, marginBottom: 12 }}>Wake me up in</div>

        <div style={{ padding: '20px 0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, fontWeight: 200, letterSpacing: -2, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {draft.napMinutes}
          </div>
          <div style={{ fontSize: 14, color: W.weak, marginTop: 6 }}>minutes</div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22,
        }}>
          {presets.map((p) => {
            const active = p === draft.napMinutes;
            return (
              <div key={p} onClick={() => setDraft({ napMinutes: p })} style={{
                padding: '14px 0', textAlign: 'center',
                background: active ? W.ink : W.paper, color: active ? W.bg : W.ink,
                border: active ? `1px solid ${W.ink}` : `1px solid ${W.fill}`,
                borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontVariantNumeric: 'tabular-nums',
              }}>{p} min</div>
            );
          })}
        </div>

        <SoundsRow draft={draft} />

        <div style={{ flex: 1 }} />

        <div onClick={() => startTracking()} style={{
          marginTop: 24,
          padding: '16px 0', textAlign: 'center', background: W.ink, color: W.bg,
          borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Start nap</div>
        <div style={{ textAlign: 'center', fontSize: 12, color: W.weak, marginTop: 10 }}>
          Alarm at {napEndLabel(draft.napMinutes)}
        </div>
      </div>
    </div>
  );
}

export function TrackNight() {
  const [draft, setDraft] = useDraft();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font }}>
      <TopPad />
      <HeaderBar title="Sleep" onBack={() => go('track-mode')} />

      <div style={{ flex: 1, padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ fontSize: 13, color: W.weak, marginBottom: 4 }}>Wake me up at</div>

        <div style={{
          background: W.paper, borderRadius: 20, padding: '14px 16px',
          border: `1px solid ${W.fill}`,
          marginBottom: 16,
        }}>
          <DrumPicker
            hour={draft.wakeHour} minute={draft.wakeMinute}
            onHour={(h) => setDraft({ wakeHour: h })}
            onMinute={(m) => setDraft({ wakeMinute: m })}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { l: '6:30', h: 6, m: 30 },
            { l: '7:00', h: 7, m: 0 },
            { l: '7:30', h: 7, m: 30 },
            { l: '8:00', h: 8, m: 0 },
          ].map((p) => {
            const active = draft.wakeHour === p.h && draft.wakeMinute === p.m;
            return (
              <div key={p.l} onClick={() => setDraft({ wakeHour: p.h, wakeMinute: p.m })} style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                background: active ? W.ink : W.paper, color: active ? W.bg : W.ink,
                border: active ? `1px solid ${W.ink}` : `1px solid ${W.fill}`,
                borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>{p.l}</div>
            );
          })}
        </div>

        <SoundsRow draft={draft} />

        <div style={{ flex: 1 }} />

        <div onClick={() => startTracking()} style={{
          marginTop: 24,
          padding: '16px 0', textAlign: 'center', background: W.ink, color: W.bg,
          borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Start tracking</div>
        <div style={{ textAlign: 'center', fontSize: 12, color: W.weak, marginTop: 10 }}>
          Tracking will run until your wake-up time.
        </div>
      </div>
    </div>
  );
}

function SoundsRow({ draft }: { draft: SleepDraft }) {
  const summary = draft.sounds.length === 0
    ? 'None'
    : draft.sounds.length === 1 ? draft.sounds[0]
    : `Mix · ${draft.sounds.length} sounds`;
  return (
    <div onClick={() => go('sounds')} style={{
      background: W.paper, borderRadius: 18,
      border: `1px solid ${W.fill}`,
      padding: '14px 14px',
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 20, background: W.fill,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}><MusicIcon size={20} stroke={W.ink} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Sounds</div>
        <div style={{ fontSize: 12, color: W.weak, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
      </div>
      <ChevronRightIcon size={16} stroke={W.veryweak} />
    </div>
  );
}

function DrumPicker({ hour, minute, onHour, onMinute }: {
  hour: number; minute: number; onHour: (h: number) => void; onMinute: (m: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative' }}>
      <DrumColumn value={hour} setValue={onHour} max={24} pad={2} />
      <div style={{ fontSize: 28, fontWeight: 300, color: W.ink }}>:</div>
      <DrumColumn value={minute} setValue={onMinute} max={60} pad={2} step={5} />
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)',
        height: 40, borderRadius: 10, background: W.fill, zIndex: 0, pointerEvents: 'none',
      }} />
    </div>
  );
}

function DrumColumn({ value, setValue, max, pad = 0, step = 1 }: {
  value: number; setValue: (v: number) => void; max: number; pad?: number; step?: number;
}) {
  const itemH = 40;
  const values: number[] = [];
  for (let v = 0; v < max; v += step) values.push(v);

  function rowsAround() {
    const idx = values.indexOf(value);
    const r: { v: number; off: number }[] = [];
    for (let off = -2; off <= 2; off++) {
      const i = (idx + off + values.length) % values.length;
      r.push({ v: values[i], off });
    }
    return r;
  }

  return (
    <div style={{
      width: 70, height: itemH * 5, position: 'relative', overflow: 'hidden',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)',
      maskImage: 'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)',
    }}>
      {rowsAround().map(({ v, off }) => (
        <div key={off} onClick={() => setValue(v)} style={{
          position: 'absolute', left: 0, right: 0,
          height: itemH, top: itemH * 2 + off * itemH,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: off === 0 ? 30 : 22, fontWeight: off === 0 ? 600 : 400,
          color: off === 0 ? W.ink : (Math.abs(off) === 1 ? W.weak : W.veryweak),
          fontVariantNumeric: 'tabular-nums',
          cursor: 'pointer', zIndex: 1,
        }}>{String(v).padStart(pad, '0')}</div>
      ))}
    </div>
  );
}
