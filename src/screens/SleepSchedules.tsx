import { useRef } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar } from '../components/shared';
import { ArrowRightTinyIcon, ChevronRightIcon, PencilIcon } from '../components/icons';
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

const PRESET_SUBTITLE: Record<string, string> = {
  weekdays: 'Mon – Fri',
  weekends: 'Sat & Sun',
};

export function SleepSchedules() {
  const { list, update } = useSchedules();
  const [, setEditingId] = useEditingScheduleId();

  function openMix(scheduleId: string) {
    setEditingId(scheduleId);
    go('schedule-mix');
  }

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
          Set bedtime, wake-up and the sounds that help you drift off.
        </div>

        {list.map((s) => (
          <ScheduleCard
            key={s.id}
            schedule={s}
            subtitle={PRESET_SUBTITLE[s.id] ?? ''}
            onChange={(patch) => update(s.id, patch)}
            onOpenMix={() => openMix(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ScheduleCard({ schedule, subtitle, onChange, onOpenMix }: {
  schedule: Schedule;
  subtitle: string;
  onChange: (patch: Partial<Schedule>) => void;
  onOpenMix: () => void;
}) {
  const bedStr = fmt(schedule.bedHour, schedule.bedMinute);
  const wakeStr = fmt(schedule.wakeHour, schedule.wakeMinute);
  const dur = durationBetween(schedule.bedHour, schedule.bedMinute, schedule.wakeHour, schedule.wakeMinute);
  const [goal] = useSleepGoal();
  const actualMinutes = durationInMin(schedule.bedHour, schedule.bedMinute, schedule.wakeHour, schedule.wakeMinute);
  const goalMinutes = goal * 60;
  const deltaMin = actualMinutes - goalMinutes;
  const onTarget = Math.abs(deltaMin) <= 15;
  const deltaLabel = deltaMin === 0
    ? 'matches goal'
    : deltaMin > 0
      ? `+${formatDelta(deltaMin)} over goal`
      : `${formatDelta(-deltaMin)} short of goal`;

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
      borderRadius: 22, padding: '18px',
    }}>
      <style>{`
        .sched-time {
          background: transparent; border: none; outline: none;
          color: ${W.ink}; font: inherit; font-family: ${W.font};
          font-size: 30px; font-weight: 600; letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums; line-height: 1;
          padding: 0; margin: 0; cursor: pointer;
          color-scheme: dark; -webkit-appearance: none; appearance: none;
          width: 100%; text-align: center;
        }
        .sched-time::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; }
      `}</style>

      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{schedule.name}</div>
      {subtitle && (
        <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>{subtitle}</div>
      )}

      <div style={{
        marginTop: 16,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10,
      }}>
        <TimeField label="Bedtime" value={bedStr} onChange={setBed} />
        <div style={{ textAlign: 'center', minWidth: 56 }}>
          <ArrowRightTinyIcon size={14} stroke={W.weak} />
          <div style={{ fontSize: 12, color: W.weak, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{dur}</div>
        </div>
        <TimeField label="Wake up" value={wakeStr} onChange={setWake} />
      </div>

      <div style={{
        marginTop: 16, padding: '10px 12px',
        background: W.fill, border: `1px solid ${W.veryweak}`,
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 13,
            background: onTarget ? 'rgba(127,227,161,0.18)' : W.bg,
            border: `1px solid ${onTarget ? 'rgba(127,227,161,0.45)' : W.veryweak}`,
            color: onTarget ? '#7FE3A1' : W.weak,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, fontFamily: W.font,
            fontVariantNumeric: 'tabular-nums',
          }}>{goal}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: W.ink, lineHeight: 1.2 }}>Sleep goal · {goal}h</div>
            <div style={{ fontSize: 11, color: onTarget ? '#7FE3A1' : W.weak, marginTop: 2 }}>{deltaLabel}</div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: W.fill, margin: '16px -18px 14px' }} />

      <MixPlate sounds={schedule.sounds.map((s) => s.id)} onClick={onOpenMix} />

      {schedule.timerMin !== undefined && (
        <div style={{
          marginTop: 10,
          fontSize: 11, color: W.weak, textAlign: 'center',
        }}>
          {schedule.timerMin ? `Sounds stop in ${schedule.timerMin} min` : 'Sounds play until alarm'}
        </div>
      )}
    </div>
  );
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{label}</div>
      <div
        onClick={open}
        style={{
          padding: '8px 14px', borderRadius: 14,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer', minWidth: 116,
        }}
      >
        <input
          ref={ref}
          type="time"
          className="sched-time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <PencilIcon size={12} stroke={W.weak} />
      </div>
    </div>
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
      background: W.fill, border: `1px solid ${W.veryweak}`,
      borderRadius: 14, padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer',
    }}>
      <GlyphStack sounds={named} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: W.ink, lineHeight: 1.2 }}>{title}</div>
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
  // Render up to 2 glyphs in a small overlapped stack.
  const display = sounds.slice(0, 2);

  if (display.length === 0) {
    return (
      <div style={{
        width: 40, height: 40, borderRadius: 20,
        background: W.bg, border: `1px solid ${W.veryweak}`,
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
        return (
          <div key={s.id} style={{
            position: 'absolute', top: 0, left: i * 16,
            width: 40, height: 40, borderRadius: 20,
            background: W.bg, border: `1px solid ${W.veryweak}`,
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
