import { useRef, useState } from 'react';
import { W } from '../tokens';
import { go, back } from '../state/navigation';
import { TopPad } from '../components/shared';
import { ArrowRightTinyIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { useSchedules, useEditingScheduleId, useSleepGoal, type Schedule } from '../state/store';
import { lookupSound } from '../data/sounds';

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

function durationInMin(bedH: number, bedM: number, wakeH: number, wakeM: number) {
  let mins = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
  if (mins <= 0) mins += 24 * 60;
  return mins;
}

function formatDelta(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const PRESET_SUBTITLE: Record<string, string> = {
  weekdays: 'Mon – Fri',
  weekends: 'Sat & Sun',
};

const TIMER_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: 'Off', minutes: null },
  { label: '15', minutes: 15 },
  { label: '30', minutes: 30 },
  { label: '45', minutes: 45 },
  { label: '60', minutes: 60 },
  { label: '90', minutes: 90 },
];

// One-preset editor with a top segment toggle to flip between the two
// fixed presets (Weekdays / Weekends). Replaces the old list view.
export function SleepSchedules() {
  const { list, update } = useSchedules();
  const [editingId, setEditingId] = useEditingScheduleId();
  const [active, setActive] = useState<string>(() => editingId ?? list[0]?.id ?? 'weekdays');

  const schedule = list.find((s) => s.id === active) ?? list[0];

  function selectPreset(id: string) {
    setActive(id);
    setEditingId(id);
  }

  function openMix() {
    setEditingId(schedule.id);
    go('schedule-mix');
  }

  if (!schedule) {
    return (
      <div style={{ height: '100%', background: W.bg, color: W.ink, fontFamily: W.font }}>
        <TopPad />
        <div style={{ padding: 40, textAlign: 'center', color: W.weak }}>No schedules yet.</div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <SchedulesGlow />
      <TopPad />

      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '4px 14px', height: 44, gap: 12,
      }}>
        <button onClick={() => back()} aria-label="Back" style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: W.fill, padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: W.ink,
        }}>
          <ChevronLeftIcon size={16} stroke={W.ink} />
        </button>
        <PresetToggle list={list} active={active} onSelect={selectPreset} />
        <div style={{ width: 36 }} />
      </div>

      <div style={{
        position: 'relative', flex: 1, overflowY: 'auto', padding: '12px 16px 32px',
      }}>
        <ScheduleHero schedule={schedule} onChange={(patch) => update(schedule.id, patch)} />

        <SectionLabel>Sound</SectionLabel>
        <MixPlate sounds={schedule.sounds.map((s) => s.id)} onClick={openMix} />

        <SectionLabel>Sleep timer</SectionLabel>
        <TimerPills
          value={schedule.timerMin}
          onChange={(min) => update(schedule.id, { timerMin: min })}
        />

        <div style={{
          marginTop: 18, textAlign: 'center',
          fontSize: 11, color: W.veryweak, lineHeight: 1.5,
        }}>
          Applies automatically on {PRESET_SUBTITLE[schedule.id] ?? 'the matching days'}.
        </div>
      </div>
    </div>
  );
}

function SchedulesGlow() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `radial-gradient(70% 40% at 50% 0%, rgba(120,140,255,0.10), transparent 70%)`,
    }} />
  );
}

function PresetToggle({ list, active, onSelect }: {
  list: Schedule[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{
      flex: 1, maxWidth: 280,
      display: 'flex', alignItems: 'center', gap: 2,
      padding: 3, borderRadius: 999,
      background: 'rgba(38,38,44,0.65)',
      border: `1px solid ${W.veryweak}`,
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
    }}>
      {list.map((s) => {
        const sel = s.id === active;
        return (
          <div key={s.id} onClick={() => onSelect(s.id)} style={{
            flex: 1, padding: '7px 0', textAlign: 'center', borderRadius: 999,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: sel ? W.ink : 'transparent',
            color: sel ? W.bg : W.weak,
            transition: 'background .12s ease, color .12s ease',
            letterSpacing: 0.1,
          }}>{s.name}</div>
        );
      })}
    </div>
  );
}

function ScheduleHero({ schedule, onChange }: {
  schedule: Schedule;
  onChange: (patch: Partial<Schedule>) => void;
}) {
  const bedStr = fmt(schedule.bedHour, schedule.bedMinute);
  const wakeStr = fmt(schedule.wakeHour, schedule.wakeMinute);
  const dur = durationBetween(schedule.bedHour, schedule.bedMinute, schedule.wakeHour, schedule.wakeMinute);
  const [goal] = useSleepGoal();
  const actualMin = durationInMin(schedule.bedHour, schedule.bedMinute, schedule.wakeHour, schedule.wakeMinute);
  const deltaMin = actualMin - goal * 60;
  const onTarget = Math.abs(deltaMin) <= 15;
  const deltaLabel = deltaMin === 0
    ? 'matches your goal'
    : deltaMin > 0
      ? `+${formatDelta(deltaMin)} over your goal`
      : `${formatDelta(-deltaMin)} short of your goal`;

  function setBed(value: string) {
    const [h, m] = value.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) onChange({ bedHour: h, bedMinute: m });
  }
  function setWake(value: string) {
    const [h, m] = value.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) onChange({ wakeHour: h, wakeMinute: m });
  }

  return (
    <div style={{ padding: '4px 4px 18px' }}>
      <div style={{
        background: W.paper, border: `1px solid ${W.fill}`,
        borderRadius: 22, padding: 20,
      }}>
        <style>{`
          .sched-time {
            background: transparent; border: none; outline: none;
            color: ${W.ink}; font: inherit; font-family: ${W.font};
            font-size: 32px; font-weight: 600; letter-spacing: -0.02em;
            font-variant-numeric: tabular-nums; line-height: 1;
            padding: 0; margin: 0; cursor: pointer;
            color-scheme: dark; -webkit-appearance: none; appearance: none;
            width: 100%; text-align: center;
          }
          .sched-time::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; }
        `}</style>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8,
        }}>
          <TimeField label="Bedtime" value={bedStr} onChange={setBed} />
          <div style={{ textAlign: 'center', padding: '0 4px', minWidth: 48 }}>
            <ArrowRightTinyIcon size={14} stroke={W.weak} />
            <div style={{
              fontSize: 11, color: W.weak, marginTop: 4, whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums',
            }}>{dur}</div>
          </div>
          <TimeField label="Wake up" value={wakeStr} onChange={setWake} />
        </div>

        <div style={{
          marginTop: 16, padding: '10px 12px',
          background: onTarget ? 'rgba(127,227,161,0.10)' : W.fill,
          border: `1px solid ${onTarget ? 'rgba(127,227,161,0.35)' : W.veryweak}`,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          textAlign: 'left',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 14,
            background: onTarget ? 'rgba(127,227,161,0.18)' : W.bg,
            border: `1px solid ${onTarget ? 'rgba(127,227,161,0.45)' : W.veryweak}`,
            color: onTarget ? '#7FE3A1' : W.weak,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
          }}>{goal}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: W.ink, lineHeight: 1.2 }}>Sleep goal</div>
            <div style={{
              fontSize: 11, marginTop: 2, color: onTarget ? '#7FE3A1' : W.weak,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{deltaLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const open = () => {
    const el = ref.current;
    if (!el) return;
    const showPicker = (el as unknown as { showPicker?: () => void }).showPicker;
    if (typeof showPicker === 'function') showPicker.call(el);
    else el.focus();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{label}</div>
      <div
        onClick={open}
        style={{
          width: '100%', padding: '10px 8px', borderRadius: 14,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        <input
          ref={ref} type="time" className="sched-time" value={value}
          onChange={(e) => onChange(e.target.value)} aria-label={label}
        />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '20px 4px 8px',
      fontSize: 11, color: W.weak, fontWeight: 600, letterSpacing: 0.4,
    }}>{children}</div>
  );
}

function MixPlate({ sounds, onClick }: { sounds: string[]; onClick: () => void }) {
  const named = sounds.map((id) => lookupSound(id)).filter((x): x is NonNullable<typeof x> => !!x);
  const summary = named.length === 0
    ? 'Tap to choose'
    : named.map((s) => s.name).join(' · ');
  const title = named.length === 0
    ? 'No sound'
    : named.length === 1 ? named[0].name : 'Mix';

  return (
    <div onClick={onClick} style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 16, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer',
    }}>
      <GlyphStack sounds={named} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, lineHeight: 1.2 }}>{title}</div>
        <div style={{
          fontSize: 12, color: W.weak, marginTop: 3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{summary}</div>
      </div>
      <ChevronRightIcon size={16} stroke={W.weak} />
    </div>
  );
}

function GlyphStack({ sounds }: { sounds: { id: string; Glyph: ReturnType<typeof lookupSound> extends infer T ? T extends { Glyph: infer G } ? G : never : never }[] }) {
  const display = sounds.slice(0, 2);

  if (display.length === 0) {
    return (
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: W.fill, border: `1px solid ${W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: W.weak, fontSize: 18, lineHeight: 1,
      }}>♪</div>
    );
  }

  return (
    <div style={{
      position: 'relative', width: display.length === 1 ? 40 : 56, height: 40,
      flexShrink: 0,
    }}>
      {display.map((s, i) => {
        const Glyph = s.Glyph as (p: { size?: number; stroke?: string }) => JSX.Element;
        const last = i === display.length - 1;
        return (
          <div key={s.id} style={{
            position: 'absolute', top: 0, left: i * 16,
            width: 40, height: 40, borderRadius: 12,
            background: W.fill,
            border: `1.5px solid ${last ? W.veryweak : W.bg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: i,
          }}>
            <Glyph size={18} stroke={W.ink} />
          </div>
        );
      })}
    </div>
  );
}

function TimerPills({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div style={{
      padding: '10px 10px',
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 8px' }}>
        <div style={{ fontSize: 12, color: W.weak }}>Sounds stop after</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: W.ink, fontVariantNumeric: 'tabular-nums' }}>
          {value ? `${value} min` : 'until alarm'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
        {TIMER_OPTIONS.map((opt) => {
          const sel = opt.minutes === value;
          return (
            <div key={opt.label} onClick={() => onChange(opt.minutes)} style={{
              padding: '10px 0', textAlign: 'center', borderRadius: 10,
              background: sel ? W.ink : W.fill,
              color: sel ? W.bg : W.ink,
              border: `1px solid ${sel ? W.ink : W.veryweak}`,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontVariantNumeric: 'tabular-nums',
              transition: 'background .12s ease, color .12s ease',
            }}>{opt.label}</div>
          );
        })}
      </div>
    </div>
  );
}
