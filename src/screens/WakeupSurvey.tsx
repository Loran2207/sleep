import { useEffect, useMemo, useRef, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad } from '../components/shared';
import { CheckIcon, ChevronLeftIcon, MicIcon, StopIcon, XIcon } from '../components/icons';
import { MoodFace } from '../components/MoodFace';
import { DiaryQuiz } from '../components/DiaryQuiz';
import { useJournal, usePracticeDone } from '../state/store';
import { readMood } from '../data/mood';
import { factorsFromDiary } from '../data/factors';

const GRID_COLS = 9;
const GRID_ROWS = 7;

type Step = 'mood' | 'note' | 'diary';

type RecogConstructor = new () => SpeechRecognition;
type SpeechRecognition = {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] & { length: number } }) => void) | null;
  onend: (() => void) | null; onerror: ((e: unknown) => void) | null;
  start: () => void; stop: () => void;
};

function getRecognitionCtor(): RecogConstructor | null {
  const w = window as unknown as { SpeechRecognition?: RecogConstructor; webkitSpeechRecognition?: RecogConstructor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

const STEP_ORDER: Step[] = ['mood', 'note', 'diary'];
const STEP_TITLE: Record<Step, string> = {
  mood: 'How do you feel?',
  note: 'A note about today',
  diary: 'Sleep diary',
};
const STEP_INTRO: Record<Step, string> = {
  mood: 'Pick anywhere on the grid.',
  note: 'Tap the mic and tell us — or skip.',
  diary: 'Take a moment to log how the night went.',
};

export function WakeupSurvey() {
  const { add } = useJournal();
  const [step, setStep] = useState<Step>('mood');
  const [practiceDone] = usePracticeDone();

  const [moodX, setMoodX] = useState(0.7);
  const [moodY, setMoodY] = useState(0.45);
  const [text, setText] = useState('');
  const [diary, setDiary] = useState<Record<string, string | string[]>>({});

  const reading = useMemo(() => readMood(moodX, moodY), [moodX, moodY]);
  const stepIdx = STEP_ORDER.indexOf(step);
  const isLast = step === 'diary';

  function save() {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const whenLabel = `Today, ${time}`;
    add({
      moodX, moodY,
      feeling: reading.feeling,
      feelingDesc: reading.desc,
      legacyMood: reading.legacyMood,
      date, time, whenLabel,
      text: text.trim(),
      context: [],
      factors: factorsFromDiary(diary, { practiceDone }),
      diary,
    });
    go('home');
  }

  function next() {
    if (isLast) { save(); return; }
    setStep(STEP_ORDER[stepIdx + 1]);
  }
  function back() {
    if (stepIdx === 0) return;
    setStep(STEP_ORDER[stepIdx - 1]);
  }

  const canGoBack = stepIdx > 0;

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
        padding: '6px 14px', height: 48, flexShrink: 0,
      }}>
        {canGoBack ? (
          <div onClick={back} aria-label="Back" style={topBtnStyle}>
            <ChevronLeftIcon size={16} stroke={W.ink} />
          </div>
        ) : (
          <div onClick={() => go('home')} aria-label="Close" style={topBtnStyle}>
            <XIcon size={14} stroke={W.ink} />
          </div>
        )}
        <StepDots current={stepIdx} total={STEP_ORDER.length} />
        <div style={{ width: 36 }} />
      </div>

      <div style={{
        position: 'relative', textAlign: 'center', padding: '12px 22px 8px',
      }}>
        <div style={{ fontSize: 13, color: W.weak, fontWeight: 500 }}>Good morning</div>
        <div style={{
          fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em',
          marginTop: 6, lineHeight: 1.25,
        }}>{STEP_TITLE[step]}</div>
        <div style={{ fontSize: 12, color: W.weak, marginTop: 4 }}>{STEP_INTRO[step]}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px', position: 'relative' }}>
        {step === 'mood' && (
          <MoodStep
            moodX={moodX} moodY={moodY}
            onChange={(nx, ny) => { setMoodX(nx); setMoodY(ny); }}
            tint={reading.tint}
            feeling={reading.feeling}
            desc={reading.desc}
          />
        )}
        {step === 'note' && <NoteStep value={text} onChange={setText} />}
        {step === 'diary' && (
          <div style={{ padding: '4px 0 12px' }}>
            <DiaryQuiz diary={diary} onChange={setDiary} />
          </div>
        )}
      </div>

      <div style={{
        padding: '12px 16px 24px', position: 'relative',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {step === 'note' && (
            <div onClick={next} style={skipBtnStyle}>Skip</div>
          )}
          <div onClick={next} style={{
            flex: step === 'note' ? 2 : 1,
            padding: '16px 0', textAlign: 'center',
            background: reading.tint, color: '#000000',
            borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {isLast && <CheckIcon size={14} stroke="#000000" />}
            {isLast ? 'Save & finish' : 'Continue'}
          </div>
        </div>
        {step === 'diary' && (
          <div onClick={save} style={{
            marginTop: 10, padding: '10px 0', textAlign: 'center',
            color: W.weak, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Skip all</div>
        )}
      </div>
    </div>
  );
}

const topBtnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 18,
  background: W.fill, border: `1px solid ${W.veryweak}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: W.ink,
};

const skipBtnStyle: React.CSSProperties = {
  flex: 1, padding: '16px 0', textAlign: 'center',
  background: 'transparent', color: W.ink,
  border: `1px solid ${W.fill}`, borderRadius: 999,
  fontSize: 14, fontWeight: 500, cursor: 'pointer',
};

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 22 : 6, height: 6, borderRadius: 3,
          background: i <= current ? W.ink : W.fill,
          transition: 'width .2s ease, background .2s ease',
        }} />
      ))}
    </div>
  );
}

function MoodStep({ moodX, moodY, onChange, tint, feeling, desc }: {
  moodX: number; moodY: number;
  onChange: (x: number, y: number) => void;
  tint: string; feeling: string; desc: string;
}) {
  return (
    <>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        padding: '8px 0 14px',
      }}>
        <MoodFace tint={tint} x={moodX} y={moodY} size={104} glow />
        <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{feeling}</div>
          <div style={{ fontSize: 13, color: W.weak, marginTop: 4 }}>{desc}</div>
        </div>
      </div>
      <MoodGrid x={moodX} y={moodY} tint={tint} onChange={onChange} />
    </>
  );
}

function NoteStep({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return <VoiceTextField value={value} onChange={onChange} />;
}

function TintGlow({ color }: { color: string }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `radial-gradient(60% 40% at 50% 18%, ${hexWithAlpha(color, 0.32)}, transparent 75%)`,
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

function MoodGrid({ x, y, tint, onChange }: {
  x: number; y: number; tint: string;
  onChange: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const snap = (col: number, row: number) => {
    onChange(col / (GRID_COLS - 1), 1 - row / (GRID_ROWS - 1));
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
    <div style={{ marginTop: 14 }}>
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
        <Axis position="top">High energy</Axis>
        <Axis position="bottom">Low energy</Axis>
        <Axis position="left">Sad</Axis>
        <Axis position="right">Happy</Axis>

        <div ref={ref} onPointerDown={onPointerDown} style={{
          position: 'relative', width: '100%',
          aspectRatio: `${GRID_COLS - 1} / ${GRID_ROWS - 1}`,
          cursor: 'pointer', touchAction: 'none',
        }}>
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
    </div>
  );
}

function Axis({ position, children }: { position: 'top' | 'bottom' | 'left' | 'right'; children: React.ReactNode }) {
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

function VoiceTextField({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const recogRef = useRef<SpeechRecognition | null>(null);
  const Ctor = useMemo(() => getRecognitionCtor(), []);

  function startVoice() {
    if (!Ctor) {
      setRecording(true);
      const t = setTimeout(() => {
        setRecording(false);
        onChange(`${value}${value && !value.endsWith(' ') ? ' ' : ''}(Voice input is not supported on this browser.)`);
      }, 1400);
      recogRef.current = { stop: () => { clearTimeout(t); setRecording(false); } } as SpeechRecognition;
      return;
    }
    const rec = new Ctor();
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
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
    <div style={{
      position: 'relative',
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '14px 14px',
      margin: '0 4px',
    }}>
      <textarea
        value={value + (interim ? (value && !value.endsWith(' ') ? ' ' : '') + interim : '')}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        autoFocus
        placeholder="One thing about how you slept…"
        style={{
          width: '100%', background: 'transparent', color: W.ink,
          border: 'none', outline: 'none', resize: 'none',
          fontSize: 15, lineHeight: 1.5, fontFamily: W.font,
          padding: 0, paddingRight: 44, minHeight: 110,
          boxSizing: 'border-box',
        }}
      />
      <div onClick={recording ? stopVoice : startVoice} aria-label={recording ? 'Stop' : 'Start voice input'} style={{
        position: 'absolute', right: 10, bottom: 10,
        width: 40, height: 40, borderRadius: 20,
        background: recording ? '#E25C5C' : W.fill,
        border: `1px solid ${recording ? '#E25C5C' : W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        {recording ? <StopIcon size={14} stroke="#fff" /> : <MicIcon size={18} stroke={W.ink} />}
      </div>
      {recording && (
        <div style={{ position: 'absolute', left: 14, bottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: 4, background: '#E25C5C',
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
