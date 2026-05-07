import { useEffect, useMemo, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad } from '../components/shared';
import { ChevronRightIcon, HabitGlyph, MicIcon, StopIcon } from '../components/icons';
import { MoodFace } from '../components/MoodFace';
import { DiaryQuiz, diaryAnsweredCount, DIARY_TOTAL } from '../components/DiaryQuiz';
import { useEditingJournalId, useJournal } from '../state/store';
import { readMood } from '../data/mood';
import { SLEEP_FACTORS, lookupFactor } from '../data/factors';

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
  const [factors, setFactors] = useState<string[]>(entry?.factors ?? []);
  const [diary, setDiary] = useState<Record<string, string | string[]>>(entry?.diary ?? {});

  const [sheet, setSheet] = useState<'mood' | 'text' | 'factors' | 'diary' | null>(null);

  // Re-sync local state if a different entry is opened.
  useEffect(() => {
    if (!entry) return;
    setMoodX(entry.moodX);
    setMoodY(entry.moodY);
    setText(entry.text);
    setDate(entry.date);
    setTime(entry.time);
    setFactors(entry.factors);
    setDiary(entry.diary ?? {});
  }, [entry?.id]);

  const reading = useMemo(() => readMood(moodX, moodY), [moodX, moodY]);

  // Bounce back if no entry.
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
      factors,
      diary,
    });
    go('journal');
  }

  function toggleFactor(id: string) {
    setFactors((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
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
        padding: '6px 16px', height: 48, flexShrink: 0,
      }}>
        <div onClick={() => go('journal')} style={{
          padding: '7px 14px', borderRadius: 999,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          fontSize: 13, color: W.ink, cursor: 'pointer',
        }}>Cancel</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Edit entry</div>
        <div style={{ width: 70 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px', position: 'relative' }}>
        <SectionLabel>Feeling</SectionLabel>
        <FeelingCard
          tint={reading.tint}
          feeling={reading.feeling}
          desc={reading.desc}
          x={moodX} y={moodY}
          onClick={() => setSheet('mood')}
        />

        <SectionLabel>Entry</SectionLabel>
        <EntryCard text={text} onClick={() => setSheet('text')} />

        <SectionLabel hint="Quick answers about how the night went.">Sleep diary</SectionLabel>
        <DiaryCard diary={diary} onClick={() => setSheet('diary')} />

        <SectionLabel hint="Anything from last night that may have shaped today.">Last night</SectionLabel>
        <FactorsCard factors={factors} onClick={() => setSheet('factors')} />

        <SectionLabel>When</SectionLabel>
        <div style={{ display: 'flex', gap: 10, padding: '0 4px' }}>
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

      {sheet === 'mood' && (
        <MoodSheet
          x={moodX} y={moodY}
          tint={reading.tint}
          feeling={reading.feeling}
          desc={reading.desc}
          onChange={(nx, ny) => { setMoodX(nx); setMoodY(ny); }}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'text' && (
        <TextSheet
          value={text}
          onChange={setText}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'factors' && (
        <FactorsSheet
          factors={factors}
          onToggle={toggleFactor}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'diary' && (
        <DiarySheet
          diary={diary}
          onChange={setDiary}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

function DiaryCard({ diary, onClick }: {
  diary: Record<string, string | string[]>;
  onClick: () => void;
}) {
  const answered = diaryAnsweredCount(diary);
  return (
    <div onClick={onClick} style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 14px',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: answered ? W.ink : W.weak }}>
          {answered ? 'Diary filled in' : 'Open the diary'}
        </div>
        <div style={{ fontSize: 12, color: W.weak, marginTop: 3 }}>
          {answered === 0
            ? 'A short questionnaire about last night.'
            : `${answered} of ${DIARY_TOTAL} answered · tap to edit`}
        </div>
      </div>
      <ChevronRightIcon size={14} stroke={W.weak} />
    </div>
  );
}

function DiarySheet({ diary, onChange, onClose }: {
  diary: Record<string, string | string[]>;
  onChange: (next: Record<string, string | string[]>) => void;
  onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose} fullHeight>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 16px 8px',
      }}>
        <div onClick={onClose} style={{
          padding: '6px 14px', borderRadius: 999,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          fontSize: 13, color: W.ink, cursor: 'pointer',
        }}>Cancel</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Sleep diary</div>
        <div onClick={onClose} style={{
          padding: '6px 14px', borderRadius: 999,
          background: W.ink, color: W.bg,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Done</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
        <DiaryQuiz diary={diary} onChange={onChange} />
      </div>
    </Sheet>
  );
}

function FactorsCard({ factors, onClick }: { factors: string[]; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 14px',
      cursor: 'pointer',
    }}>
      {factors.length === 0 ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: W.weak, fontSize: 14,
        }}>
          <span>Add details</span>
          <ChevronRightIcon size={14} stroke={W.weak} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {factors.map((id) => {
              const f = lookupFactor(id);
              if (!f) return null;
              return (
                <span key={id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 999,
                  background: W.fill, border: `1px solid ${W.veryweak}`,
                  fontSize: 12, color: W.ink,
                }}>
                  <HabitGlyph name={f.glyph} size={12} stroke={W.weak} />
                  {f.label}
                </span>
              );
            })}
          </div>
          <div style={{
            marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: W.weak, fontSize: 12,
          }}>
            <span>Tap to edit</span>
            <ChevronRightIcon size={14} stroke={W.weak} />
          </div>
        </>
      )}
    </div>
  );
}

function FactorsSheet({ factors, onToggle, onClose }: {
  factors: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 16px 8px',
      }}>
        <div onClick={onClose} style={{
          padding: '6px 14px', borderRadius: 999,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          fontSize: 13, color: W.ink, cursor: 'pointer',
        }}>Cancel</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Last night</div>
        <div onClick={onClose} style={{
          padding: '6px 14px', borderRadius: 999,
          background: W.ink, color: W.bg,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Done</div>
      </div>
      <div style={{
        padding: '8px 20px 24px',
        fontSize: 13, color: W.weak, lineHeight: 1.5,
      }}>
        Tap anything that matched last night.
      </div>
      <div style={{
        padding: '0 16px 20px',
        display: 'flex', flexWrap: 'wrap', gap: 8,
      }}>
        {SLEEP_FACTORS.map((f) => {
          const on = factors.includes(f.id);
          return (
            <div key={f.id} onClick={() => onToggle(f.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 999,
              cursor: 'pointer',
              background: on ? W.ink : 'transparent',
              color: on ? W.bg : W.ink,
              border: `1px solid ${on ? W.ink : W.fill}`,
              transition: 'background .12s ease, color .12s ease',
            }}>
              <HabitGlyph name={f.glyph} size={14} stroke={on ? W.bg : W.weak} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</span>
            </div>
          );
        })}
      </div>
    </Sheet>
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

// ─── Summary cards ───────────────────────────────────────────────
function FeelingCard({ tint, feeling, desc, x, y, onClick }: {
  tint: string; feeling: string; desc: string;
  x: number; y: number;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      position: 'relative', overflow: 'hidden',
      background: W.paper, border: `1px solid ${hexWithAlpha(tint, 0.4)}`,
      borderRadius: 18, padding: '14px 14px',
      display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(80% 100% at 0% 50%, ${hexWithAlpha(tint, 0.18)}, transparent 70%)`,
      }} />
      <MoodFace tint={tint} x={x} y={y} size={56} />
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{feeling}</div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 2 }}>{desc}</div>
      </div>
      <ChevronRightIcon size={16} stroke={W.weak} />
    </div>
  );
}

function EntryCard({ text, onClick }: { text: string; onClick: () => void }) {
  const empty = !text.trim();
  return (
    <div onClick={onClick} style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 14px',
      cursor: 'pointer', position: 'relative',
    }}>
      <div style={{
        fontSize: 14, lineHeight: 1.5,
        color: empty ? W.weak : W.ink,
        // Show a few lines, with the rest fading off — encourages tap to expand.
        display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', whiteSpace: 'pre-wrap',
      }}>
        {empty
          ? 'Write what\'s on your mind, or tap the mic to speak.'
          : text}
      </div>
      <div style={{
        marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: W.weak, fontSize: 12,
      }}>
        <span>Tap to edit</span>
        <ChevronRightIcon size={14} stroke={W.weak} />
      </div>
    </div>
  );
}

// ─── Sheet shell ─────────────────────────────────────────────────
function Sheet({ children, onClose, fullHeight = false }: {
  children: React.ReactNode;
  onClose: () => void;
  fullHeight?: boolean;
}) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(8,9,12,0.55)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%',
        height: fullHeight ? '92%' : 'auto',
        background: W.bg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: W.fill, margin: '10px auto 6px',
          flexShrink: 0,
        }} />
        {children}
      </div>
    </div>
  );
}

// ─── Mood sheet (2D dot grid) ────────────────────────────────────
function MoodSheet({ x, y, onChange, tint, feeling, desc, onClose }: {
  x: number; y: number;
  onChange: (x: number, y: number) => void;
  tint: string; feeling: string; desc: string;
  onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose}>
      <TintGlow color={tint} />
      <div style={{ position: 'relative', padding: '8px 20px 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{
          textAlign: 'center', padding: '10px 0 18px',
        }}>
          <div style={{ fontSize: 13, color: W.weak, fontWeight: 500, marginBottom: 14 }}>How did you feel</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <MoodFace tint={tint} x={x} y={y} size={96} />
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{feeling}</div>
            <div style={{ fontSize: 13, color: W.weak, marginTop: 4 }}>{desc}</div>
          </div>
        </div>

        <MoodGrid x={x} y={y} tint={tint} onChange={onChange} />
      </div>
      <div style={{
        position: 'relative', padding: '10px 16px 22px',
      }}>
        <div onClick={onClose} style={{
          padding: '15px 0', textAlign: 'center',
          background: tint, color: '#0E0E11',
          borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        }}>Done</div>
      </div>
    </Sheet>
  );
}

function MoodGrid({ x, y, tint, onChange }: {
  x: number; y: number; tint: string;
  onChange: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const snap = (col: number, row: number) => {
    const nx = col / (GRID_COLS - 1);
    const ny = 1 - row / (GRID_ROWS - 1);
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

  const selCol = Math.round(x * (GRID_COLS - 1));
  const selRow = Math.round((1 - y) * (GRID_ROWS - 1));

  return (
    <div style={{
      position: 'relative',
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 22, padding: '32px 22px 32px',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(circle at ${x * 100}% ${(1 - y) * 100}%, ${hexWithAlpha(tint, 0.22)}, transparent 60%)`,
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

// ─── Text sheet (entry + voice input) ────────────────────────────
function TextSheet({ value, onChange, onClose }: {
  value: string; onChange: (s: string) => void; onClose: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const recogRef = useRef<SpeechRecognition | null>(null);
  const Ctor = useMemo(() => getRecognitionCtor(), []);

  function startVoice() {
    if (!Ctor) {
      setRecording(true);
      setInterim('Listening…');
      const t = setTimeout(() => {
        setRecording(false);
        setInterim('');
        onChange(`${value}${value && !value.endsWith(' ') ? ' ' : ''}(Voice input is not supported on this browser — type your entry instead.)`);
      }, 1400);
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
  function stopVoice() { recogRef.current?.stop(); }
  useEffect(() => () => recogRef.current?.stop(), []);

  return (
    <Sheet onClose={onClose} fullHeight>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 16px 8px',
      }}>
        <div onClick={onClose} style={{
          padding: '6px 14px', borderRadius: 999,
          background: W.fill, border: `1px solid ${W.veryweak}`,
          fontSize: 13, color: W.ink, cursor: 'pointer',
        }}>Cancel</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Entry</div>
        <div onClick={onClose} style={{
          padding: '6px 14px', borderRadius: 999,
          background: W.ink, color: W.bg,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Done</div>
      </div>

      <div style={{ flex: 1, padding: '8px 16px 16px', position: 'relative', overflowY: 'auto' }}>
        <textarea
          autoFocus
          value={value + (interim ? (value && !value.endsWith(' ') ? ' ' : '') + interim : '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write what's on your mind, or tap the mic to speak."
          style={{
            width: '100%', height: '100%',
            background: 'transparent', color: W.ink,
            border: 'none', outline: 'none', resize: 'none',
            fontSize: 16, lineHeight: 1.55, fontFamily: W.font,
            padding: 0, paddingBottom: 80,
            minHeight: 240, boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{
        position: 'absolute', bottom: 18, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14,
        pointerEvents: 'none',
      }}>
        {recording && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: W.paper, border: `1px solid ${W.fill}`,
            padding: '8px 14px', borderRadius: 999,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: 4,
              background: '#E25C5C',
              animation: 'pulse-rec 1.1s ease-in-out infinite',
            }} />
            <div style={{ fontSize: 12, color: W.weak }}>Recording…</div>
          </div>
        )}
        <div
          onClick={recording ? stopVoice : startVoice}
          aria-label={recording ? 'Stop recording' : 'Start voice input'}
          style={{
            pointerEvents: 'auto',
            width: 64, height: 64, borderRadius: 32,
            background: recording ? '#E25C5C' : W.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            transition: 'background .15s ease',
          }}
        >
          {recording
            ? <StopIcon size={20} stroke="#fff" />
            : <MicIcon size={22} stroke={W.bg} />}
        </div>
      </div>
      <style>{`
        @keyframes pulse-rec {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </Sheet>
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
