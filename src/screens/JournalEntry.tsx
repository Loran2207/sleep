import { useEffect, useMemo, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad } from '../components/shared';
import { CheckIcon, MicIcon, StopIcon } from '../components/icons';
import { useEditingJournalId, useJournal } from '../state/store';
import { readMood, CONTEXT_TAGS } from '../data/mood';

const GRID_COLS = 9;
const GRID_ROWS = 7;

type RecogConstructor = new () => SpeechRecognition;
type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] & { length: number } }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionCtor(): RecogConstructor | null {
  const w = window as unknown as { SpeechRecognition?: RecogConstructor; webkitSpeechRecognition?: RecogConstructor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function JournalEntryEdit() {
  const [editingId] = useEditingJournalId();
  const { list, update } = useJournal();
  const entry = list.find((e) => e.id === editingId) ?? null;

  const [moodX, setMoodX] = useState(entry?.moodX ?? 0.5);
  const [moodY, setMoodY] = useState(entry?.moodY ?? 0.5);
  const [text, setText] = useState(entry?.text ?? '');
  const [date, setDate] = useState(entry?.date ?? '');
  const [time, setTime] = useState(entry?.time ?? '');
  const [context, setContext] = useState<string[]>(entry?.context ?? []);

  // Re-sync local state if a different entry is opened.
  useEffect(() => {
    if (!entry) return;
    setMoodX(entry.moodX);
    setMoodY(entry.moodY);
    setText(entry.text);
    setDate(entry.date);
    setTime(entry.time);
    setContext(entry.context);
  }, [entry?.id]);

  const reading = useMemo(() => readMood(moodX, moodY), [moodX, moodY]);

  // If no entry is selected, bounce back to the journal.
  useEffect(() => {
    if (!entry) go('journal');
  }, [entry]);

  if (!entry) return null;

  function save() {
    update(entry!.id, {
      moodX, moodY,
      feeling: reading.feeling,
      feelingDesc: reading.desc,
      legacyMood: reading.legacyMood,
      text: text.trim(),
      date, time,
      whenLabel: formatWhenLabel(date, time, entry!.whenLabel),
      context,
    });
    go('journal');
  }

  function toggleTag(id: string) {
    setContext((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative',
      overflow: 'hidden',
    }}>
      <TintGlow color={reading.tint} />

      <TopPad />
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 16px', height: 44, flexShrink: 0,
      }}>
        <div onClick={() => go('journal')} style={{
          padding: '6px 12px', borderRadius: 999,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          fontSize: 13, color: W.ink, cursor: 'pointer',
        }}>Cancel</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Edit entry</div>
        <div onClick={save} aria-label="Save" style={{
          width: 34, height: 34, borderRadius: 17,
          background: reading.tint, color: '#0E0E11',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        }}>
          <CheckIcon size={16} stroke="#0E0E11" />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px', position: 'relative' }}>
        <MoodPicker
          x={moodX} y={moodY}
          onChange={(nx, ny) => { setMoodX(nx); setMoodY(ny); }}
          tint={reading.tint}
          feeling={reading.feeling}
          desc={reading.desc}
        />

        <SectionLabel>Entry</SectionLabel>
        <TextEntry value={text} onChange={setText} />

        <SectionLabel hint="Helps reveal mood patterns">Context</SectionLabel>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 4px',
        }}>
          {CONTEXT_TAGS.map((t) => {
            const on = context.includes(t.id);
            return (
              <div key={t.id} onClick={() => toggleTag(t.id)} style={{
                padding: '6px 10px', borderRadius: 999,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: on ? W.ink : 'transparent',
                color: on ? W.bg : W.weak,
                border: `1px solid ${on ? W.ink : W.fill}`,
                transition: 'background .12s ease, color .12s ease',
              }}>#{t.label}</div>
            );
          })}
        </div>

        <SectionLabel>When</SectionLabel>
        <div style={{
          display: 'flex', gap: 10, padding: '0 4px',
        }}>
          <DateField value={date} onChange={setDate} />
          <TimeField value={time} onChange={setTime} />
        </div>
      </div>

      <div style={{
        padding: '12px 16px 24px', position: 'relative',
        background: 'linear-gradient(to top, rgba(14,14,17,0.95) 60%, transparent)',
      }}>
        <div onClick={save} style={{
          padding: '16px 0', textAlign: 'center',
          background: reading.tint, color: '#0E0E11',
          borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        }}>Save changes</div>
      </div>
    </div>
  );
}

function TintGlow({ color }: { color: string }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `radial-gradient(60% 40% at 50% 22%, ${hexWithAlpha(color, 0.32)}, transparent 75%)`,
      transition: 'background .35s ease',
    }} />
  );
}

function hexWithAlpha(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ padding: '20px 4px 8px' }}>
      <div style={{ fontSize: 12, color: W.weak, fontWeight: 500 }}>{children}</div>
      {hint && <div style={{ fontSize: 11, color: W.veryweak, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

// ─── Mood picker (2D dot grid) ───────────────────────────────────
function MoodPicker({ x, y, onChange, tint, feeling, desc }: {
  x: number; y: number;
  onChange: (x: number, y: number) => void;
  tint: string;
  feeling: string;
  desc: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Snap normalised coordinates to nearest dot centre — gives the picker its
  // satisfying click-into-place feel.
  const snap = (col: number, row: number) => {
    const nx = col / (GRID_COLS - 1);
    const ny = 1 - row / (GRID_ROWS - 1); // y=0 is top row (high energy)
    onChange(nx, ny);
  };

  function handle(e: React.PointerEvent | PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ('clientX' in e ? e.clientX : 0) - r.left;
    const py = ('clientY' in e ? e.clientY : 0) - r.top;
    const cx = (px / r.width) * (GRID_COLS - 1);
    const cy = (py / r.height) * (GRID_ROWS - 1);
    const col = Math.max(0, Math.min(GRID_COLS - 1, Math.round(cx)));
    const row = Math.max(0, Math.min(GRID_ROWS - 1, Math.round(cy)));
    snap(col, row);
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    handle(e);
    const move = (ev: PointerEvent) => handle(ev);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  // Selected pixel position within the grid (0..1 relative)
  const selCol = Math.round(x * (GRID_COLS - 1));
  const selRow = Math.round((1 - y) * (GRID_ROWS - 1));

  return (
    <div style={{ padding: '14px 4px 6px' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 18,
      }}>
        <MoodFace tint={tint} x={x} y={y} />
        <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{feeling}</div>
          <div style={{ fontSize: 13, color: W.weak, marginTop: 4 }}>{desc}</div>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          background: W.paper, border: `1px solid ${W.fill}`,
          borderRadius: 22, padding: '32px 22px 32px',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(circle at ${x * 100}% ${(1 - y) * 100}%, ${hexWithAlpha(tint, 0.2)}, transparent 60%)`,
          transition: 'background .3s ease',
        }} />

        <AxisLabel position="top">High energy</AxisLabel>
        <AxisLabel position="bottom">Low energy</AxisLabel>
        <AxisLabel position="left">Sad</AxisLabel>
        <AxisLabel position="right">Happy</AxisLabel>

        <div
          ref={ref}
          onPointerDown={onPointerDown}
          style={{
            position: 'relative', width: '100%',
            aspectRatio: `${GRID_COLS - 1} / ${GRID_ROWS - 1}`,
            cursor: 'pointer', touchAction: 'none',
          }}
        >
          {Array.from({ length: GRID_ROWS }).map((_, r) => (
            Array.from({ length: GRID_COLS }).map((_, c) => {
              // Distance to selected, used for fading dot size.
              const dx = c - selCol;
              const dy = r - selRow;
              const d = Math.sqrt(dx * dx + dy * dy);
              const isSel = c === selCol && r === selRow;
              const size = isSel ? 18 : Math.max(2, 4 - d * 0.4);
              const opacity = isSel ? 1 : Math.max(0.18, 0.7 - d * 0.12);
              const left = `${(c / (GRID_COLS - 1)) * 100}%`;
              const top = `${(r / (GRID_ROWS - 1)) * 100}%`;
              return (
                <div key={`${r}-${c}`} style={{
                  position: 'absolute', left, top,
                  transform: 'translate(-50%, -50%)',
                  width: size, height: size, borderRadius: size / 2,
                  background: isSel ? '#fff' : W.ink,
                  opacity,
                  boxShadow: isSel ? `0 0 22px 6px ${hexWithAlpha(tint, 0.6)}` : 'none',
                  transition: 'width .15s ease, height .15s ease, opacity .15s ease, left .15s ease, top .15s ease, box-shadow .2s ease',
                  pointerEvents: 'none',
                }} />
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
}

function AxisLabel({ position, children }: {
  position: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    position: 'absolute',
    fontSize: 10, color: W.weak, fontWeight: 500,
    pointerEvents: 'none',
  };
  if (position === 'top') Object.assign(base, { top: 10, left: 0, right: 0, textAlign: 'center' });
  if (position === 'bottom') Object.assign(base, { bottom: 10, left: 0, right: 0, textAlign: 'center' });
  if (position === 'left') Object.assign(base, { top: '50%', left: 8, transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'left center' });
  if (position === 'right') Object.assign(base, { top: '50%', right: 8, transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'right center' });
  return <div style={base}>{children}</div>;
}

// ─── Friendly blob face ──────────────────────────────────────────
function MoodFace({ tint, x, y }: { tint: string; x: number; y: number }) {
  // Mouth curve: positive = smile, negative = frown, scaled by happy axis.
  const smile = (x - 0.5) * 14;
  // Eyebrow tilt: scaled by energy axis (high energy = sharp brows, low = sleepy).
  const browTilt = (y - 0.5) * 6;
  // Eye state: very low energy → closed dashes, otherwise dots.
  const sleepy = y < 0.2;

  return (
    <div style={{
      width: 96, height: 96, position: 'relative',
      filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.35))',
    }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <radialGradient id="mood-blob" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFFCEB" />
            <stop offset="100%" stopColor={tint} />
          </radialGradient>
        </defs>
        <path
          d="M 48 6
             C 70 6 88 22 88 44
             C 88 66 72 90 48 90
             C 24 90 8 66 8 44
             C 8 22 26 6 48 6 Z"
          fill="url(#mood-blob)"
        />
        {/* Eyebrows */}
        <path
          d={`M 30 ${36 - browTilt} L 40 ${36 + browTilt * 0.4}`}
          stroke="#0E0E11" strokeWidth="2.5" strokeLinecap="round" fill="none"
        />
        <path
          d={`M 56 ${36 + browTilt * 0.4} L 66 ${36 - browTilt}`}
          stroke="#0E0E11" strokeWidth="2.5" strokeLinecap="round" fill="none"
        />
        {/* Eyes */}
        {sleepy ? (
          <>
            <path d="M 32 50 Q 36 53 40 50" stroke="#0E0E11" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 56 50 Q 60 53 64 50" stroke="#0E0E11" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="36" cy="48" r="2.6" fill="#0E0E11" />
            <circle cx="60" cy="48" r="2.6" fill="#0E0E11" />
          </>
        )}
        {/* Mouth */}
        <path
          d={`M 38 64 Q 48 ${64 + smile} 58 64`}
          stroke="#0E0E11" strokeWidth="2.5" strokeLinecap="round" fill="none"
        />
      </svg>
    </div>
  );
}

// ─── Text entry with voice input ─────────────────────────────────
function TextEntry({ value, onChange }: {
  value: string;
  onChange: (s: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const recogRef = useRef<SpeechRecognition | null>(null);

  const Ctor = useMemo(() => getRecognitionCtor(), []);

  function startVoice() {
    if (!Ctor) {
      // Fallback for environments without the Web Speech API — offer a brief
      // recording animation that resolves into a placeholder dictation.
      setRecording(true);
      setInterim('Listening…');
      const t = setTimeout(() => {
        setRecording(false);
        setInterim('');
        onChange(`${value}${value && !value.endsWith(' ') ? ' ' : ''}(Voice input is not supported on this browser — type your entry instead.)`);
      }, 1400);
      // Cleanup if user toggles off via stop button
      recogRef.current = { stop: () => { clearTimeout(t); setRecording(false); setInterim(''); } } as SpeechRecognition;
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    let finalText = value;
    rec.onresult = (e) => {
      let it = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += (finalText && !finalText.endsWith(' ') ? ' ' : '') + r[0].transcript.trim();
        else it += r[0].transcript;
      }
      setInterim(it);
      onChange(finalText);
    };
    rec.onend = () => { setRecording(false); setInterim(''); };
    rec.onerror = () => { setRecording(false); setInterim(''); };
    rec.start();
    recogRef.current = rec;
    setRecording(true);
  }

  function stopVoice() {
    recogRef.current?.stop();
  }

  // Stop any in-flight session on unmount.
  useEffect(() => () => recogRef.current?.stop(), []);

  return (
    <div style={{
      position: 'relative',
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 14px 14px',
      margin: '0 4px',
    }}>
      <textarea
        value={value + (interim ? (value && !value.endsWith(' ') ? ' ' : '') + interim : '')}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Write what's on your mind, or tap the mic to speak."
        style={{
          width: '100%', background: 'transparent', color: W.ink,
          border: 'none', outline: 'none', resize: 'none',
          fontSize: 14, lineHeight: 1.5, fontFamily: W.font,
          padding: 0, paddingRight: 44,
          minHeight: 96,
        }}
      />
      <div
        onClick={recording ? stopVoice : startVoice}
        aria-label={recording ? 'Stop recording' : 'Start voice input'}
        style={{
          position: 'absolute', right: 10, bottom: 10,
          width: 36, height: 36, borderRadius: 18,
          background: recording ? '#E25C5C' : W.fill,
          border: `1px solid ${recording ? '#E25C5C' : W.veryweak}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background .15s ease, border-color .15s ease',
        }}
      >
        {recording
          ? <StopIcon size={14} stroke="#fff" />
          : <MicIcon size={16} stroke={W.ink} />}
      </div>
      {recording && (
        <div style={{
          position: 'absolute', left: 14, bottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 4,
            background: '#E25C5C',
            animation: 'pulse-rec 1.1s ease-in-out infinite',
          }} />
          <div style={{ fontSize: 11, color: W.weak }}>Recording…</div>
          <style>{`
            @keyframes pulse-rec {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(0.7); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

// ─── Date / time fields ──────────────────────────────────────────
function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div
      onClick={() => {
        const el = ref.current;
        if (!el) return;
        const sp = (el as unknown as { showPicker?: () => void }).showPicker;
        if (typeof sp === 'function') sp.call(el); else el.focus();
      }}
      style={{
        flex: 1, padding: '12px 14px',
        background: W.paper, border: `1px solid ${W.fill}`, borderRadius: 14,
        cursor: 'pointer', position: 'relative',
      }}
    >
      <div style={{ fontSize: 11, color: W.weak }}>Date</div>
      <div style={{ fontSize: 14, color: W.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        {formatDate(value)}
      </div>
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer',
          colorScheme: 'dark',
        }}
      />
    </div>
  );
}

function TimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div
      onClick={() => {
        const el = ref.current;
        if (!el) return;
        const sp = (el as unknown as { showPicker?: () => void }).showPicker;
        if (typeof sp === 'function') sp.call(el); else el.focus();
      }}
      style={{
        width: 110, padding: '12px 14px',
        background: W.paper, border: `1px solid ${W.fill}`, borderRadius: 14,
        cursor: 'pointer', position: 'relative',
      }}
    >
      <div style={{ fontSize: 11, color: W.weak }}>Time</div>
      <div style={{ fontSize: 14, color: W.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <input
        ref={ref}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer',
          colorScheme: 'dark',
        }}
      />
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return '—';
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

function formatWhenLabel(date: string, time: string, fallback: string) {
  if (!date) return fallback;
  return `${formatDate(date)}, ${time}`;
}

