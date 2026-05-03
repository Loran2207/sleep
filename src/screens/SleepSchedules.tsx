import { useRef } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar } from '../components/shared';
import { ArrowRightTinyIcon, MoonIcon, BellIcon, MusicIcon } from '../components/icons';
import { useSchedules, type Schedule } from '../state/store';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const SOUND_OPTIONS = [
  'Rain', 'Ocean', 'Forest', 'Fireplace', 'Soft chimes',
  'Crickets', 'Thunder', 'White noise', 'Brown noise',
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
          <ScheduleCard key={s.id} schedule={s} onChange={(patch) => update(s.id, patch)} />
        ))}
      </div>
    </div>
  );
}

function ScheduleCard({ schedule, onChange }: {
  schedule: Schedule;
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
  function toggleDay(i: number) {
    const has = schedule.days.includes(i);
    const next = has ? schedule.days.filter((d) => d !== i) : [...schedule.days, i];
    onChange({ days: next.sort((a, b) => a - b) });
  }

  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 22, padding: '18px 18px 16px',
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

      <div style={{
        marginTop: 14,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', gap: 16,
      }}>
        <TimeField label="Bedtime" value={bedStr} onChange={setBed} />
        <div style={{ alignSelf: 'center', textAlign: 'center', minWidth: 60, paddingTop: 18 }}>
          <ArrowRightTinyIcon size={14} stroke={W.weak} />
          <div style={{ fontSize: 12, color: W.weak, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{dur}</div>
        </div>
        <TimeField label="Wake up" value={wakeStr} onChange={setWake} />
      </div>

      <div style={{
        marginTop: 18, display: 'flex', justifyContent: 'center', gap: 6,
      }}>
        {DAY_LABELS.map((d, i) => {
          const active = schedule.days.includes(i);
          return (
            <div key={i} onClick={() => toggleDay(i)} style={{
              width: 30, height: 30, borderRadius: 15,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? W.ink : 'transparent',
              color: active ? W.bg : W.weak,
              border: `1px solid ${active ? W.ink : W.fill}`,
              transition: 'background .12s ease, color .12s ease',
            }}>{d}</div>
          );
        })}
      </div>

      <div style={{ height: 1, background: W.fill, margin: '18px -18px 14px' }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
      }}>
        <MusicIcon size={16} stroke={W.weak} />
        <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>Sound</div>
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
      }}>
        {SOUND_OPTIONS.map((s) => {
          const on = s === schedule.sound;
          return (
            <div key={s} onClick={() => onChange({ sound: s })} style={{
              padding: '7px 12px', borderRadius: 999,
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: on ? W.ink : 'transparent',
              color: on ? W.bg : W.ink,
              border: `1px solid ${on ? W.ink : W.fill}`,
              transition: 'background .12s ease, color .12s ease',
            }}>{s}</div>
          );
        })}
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
        // Native time picker — try modern API first, fall back to focus
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
