import { useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar } from '../components/shared';
import { ArrowRightTinyIcon } from '../components/icons';

type Preset = {
  id: string;
  title: string;
  sub: string;
  days: number[];
  bed: string;
  wake: string;
  enabled: boolean;
  kind: 'night' | 'nap';
};

const SLEEP_PRESETS: Preset[] = [
  { id: 'weekdays', title: 'Weekdays', sub: 'Mon – Fri', days: [1, 2, 3, 4, 5], bed: '22:30', wake: '06:30', enabled: true, kind: 'night' },
  { id: 'weekends', title: 'Weekends', sub: 'Sat & Sun', days: [6, 0], bed: '00:00', wake: '08:30', enabled: true, kind: 'night' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function durationBetween(bed: string, wake: string) {
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function SleepSchedules() {
  const [presets, setPresets] = useState(SLEEP_PRESETS);
  const toggle = (id: string) => setPresets((ps) => ps.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font }}>
      <TopPad />
      <HeaderBar title="Presets" onBack={() => go('home')} />

      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 16px 32px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {presets.map((p) => (
          <SchedulePresetCard key={p.id} preset={p} onToggle={() => toggle(p.id)} onEdit={() => {}} />
        ))}
      </div>
    </div>
  );
}

function SchedulePresetCard({ preset, onToggle, onEdit }: {
  preset: Preset; onToggle: () => void; onEdit: () => void;
}) {
  const dur = durationBetween(preset.bed, preset.wake);
  const isNap = preset.kind === 'nap';
  const dim = !preset.enabled;

  return (
    <div onClick={onEdit} style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 20, padding: '16px 18px 18px',
      cursor: 'pointer', position: 'relative',
      opacity: dim ? 0.62 : 1,
      transition: 'opacity .15s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{preset.title}</div>
          <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>{preset.sub}</div>
        </div>
        <div onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={preset.enabled ? 'Disable' : 'Enable'}
          style={{
            width: 40, height: 24, borderRadius: 12,
            background: preset.enabled ? W.ink : W.fill,
            border: `1px solid ${preset.enabled ? W.ink : W.veryweak}`,
            position: 'relative', flexShrink: 0,
            transition: 'background .15s ease',
          }}>
          <div style={{
            position: 'absolute', top: 2,
            left: preset.enabled ? 18 : 2,
            width: 18, height: 18, borderRadius: 9,
            background: W.bg,
            transition: 'left .15s ease',
          }} />
        </div>
      </div>

      <div style={{
        marginTop: 16,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', gap: 24,
      }}>
        <SchedTime label={isNap ? 'Start' : 'Bedtime'} time={preset.bed} />
        <div style={{ alignSelf: 'center', textAlign: 'center', minWidth: 60 }}>
          <div style={{
            fontSize: 11, color: W.weak, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <ArrowRightTinyIcon size={12} stroke={W.weak} />
          </div>
          <div style={{ fontSize: 12, color: W.weak, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{dur}</div>
        </div>
        <SchedTime label={isNap ? 'End' : 'Wake up'} time={preset.wake} />
      </div>

      {!isNap && (
        <div style={{
          marginTop: 16, display: 'flex', justifyContent: 'center', gap: 6,
        }}>
          {DAY_LABELS.map((d, i) => {
            const active = preset.days.includes(i);
            return (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 14,
                fontSize: 11, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? W.ink : 'transparent',
                color: active ? W.bg : W.weak,
                border: `1px solid ${active ? W.ink : W.fill}`,
              }}>{d}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SchedTime({ label, time }: { label: string; time: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{
        fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em',
        lineHeight: 1, fontVariantNumeric: 'tabular-nums',
      }}>{time}</div>
    </div>
  );
}
