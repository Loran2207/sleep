import { useRef } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar, SoundTile } from '../components/shared';
import { ArrowRightTinyIcon, MoonIcon, BellIcon, MusicIcon } from '../components/icons';
import { useSchedules, type Schedule } from '../state/store';

// Curated subset of the sound catalog — enough variety for picking
// what helps you drift off, without overwhelming the page.
const SCHEDULE_SOUND_IDS = [
  'rain', 'ocean', 'forest', 'campfire',
  'chimes', 'crickets', 'whitenoise', 'brown',
];

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(h: number, m: number) { return `${pad(h)}:${pad(m)}`; }

function durationBetween(bedH: number, bedM: number, wakeH: number, wakeM: number) {
  let mins = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
  if (mins <= 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Subtitle shown under the preset name — these schedules cover fixed
// day ranges (the user can't reassign days, only edit the times and sound).
const PRESET_SUBTITLE: Record<string, string> = {
  weekdays: 'Mon – Fri',
  weekends: 'Sat & Sun',
};

export function SleepSchedules() {
  const { list, update } = useSchedules();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font }}>
      <TopPad />
      <HeaderBar title="Schedule" onBack={() => go('home')} />

      <div style={{
        flex: 1, overflowY: 'auto', padding: '8px 16px 32px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{
          fontSize: 13, color: W.weak, padding: '0 4px 6px', lineHeight: 1.5,
        }}>
          Set bedtime, wake-up and the sound that helps you drift off.
        </div>

        {list.map((s) => (
          <ScheduleCard
            key={s.id}
            schedule={s}
            subtitle={PRESET_SUBTITLE[s.id] ?? ''}
            onChange={(patch) => update(s.id, patch)}
          />
        ))}
      </div>
    </div>
  );
}

function ScheduleCard({ schedule, subtitle, onChange }: {
  schedule: Schedule;
  subtitle: string;
  onChange: (patch: Partial<Schedule>) => void;
}) {
  const bedStr = fmt(schedule.bedHour, schedule.bedMinute);
  const wakeStr = fmt(schedule.wakeHour, schedule.wakeMinute);
  const dur = durationBetween(schedule.bedHour, schedule.bedMinute, schedule.wakeHour, schedule.wakeMinute);

  function setBed(value: string) {
    const [h, m] = value.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) onChange({ bedHour: h, bedMinute: m });
  }
  function setWake(value: string) {
    const [h, m] = value.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) onChange({ wakeHour: h, wakeMinute: m });
  }

  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 22, padding: '18px 18px 18px',
    }}>
      <style>{`
        .sched-time {
          background: transparent; border: none; outline: none;
          color: ${W.ink}; font: inherit; font-family: ${W.font};
          font-size: 32px; font-weight: 600; letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums; line-height: 1;
          padding: 0; margin: 0; cursor: pointer;
          color-scheme: dark; -webkit-appearance: none; appearance: none;
          min-width: 92px;
        }
        .sched-time::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; }
      `}</style>

      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{schedule.name}</div>
      {subtitle && (
        <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>{subtitle}</div>
      )}

      <div style={{
        marginTop: 16,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', gap: 16,
      }}>
        <TimeField label="Bedtime" value={bedStr} onChange={setBed} />
        <div style={{ alignSelf: 'center', textAlign: 'center', minWidth: 60, paddingTop: 18 }}>
          <ArrowRightTinyIcon size={14} stroke={W.weak} />
          <div style={{ fontSize: 12, color: W.weak, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{dur}</div>
        </div>
        <TimeField label="Wake up" value={wakeStr} onChange={setWake} />
      </div>

      <div style={{ height: 1, background: W.fill, margin: '20px -18px 16px' }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
      }}>
        <MusicIcon size={14} stroke={W.weak} />
        <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>Sound</div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px 8px',
      }}>
        {SCHEDULE_SOUND_IDS.map((id) => (
          <SoundTile
            key={id}
            id={id}
            selected={schedule.sound === id}
            onClick={() => onChange({ sound: id })}
          />
        ))}
      </div>
    </div>
  );
}

function TimeField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const Icon = label === 'Bedtime' ? MoonIcon : BellIcon;
  return (
    <div
      onClick={() => {
        const el = ref.current;
        if (!el) return;
        const showPicker = (el as unknown as { showPicker?: () => void }).showPicker;
        if (typeof showPicker === 'function') showPicker.call(el);
        else el.focus();
      }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        cursor: 'pointer', position: 'relative',
      }}
    >
      <div style={{
        fontSize: 12, color: W.weak, fontWeight: 500, marginBottom: 6,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Icon size={12} stroke={W.weak} />
        {label}
      </div>
      <input
        ref={ref}
        type="time"
        className="sched-time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </div>
  );
}
