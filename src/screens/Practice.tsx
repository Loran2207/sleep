import { useEffect, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar } from '../components/shared';
import { CheckIcon } from '../components/icons';
import { usePracticeCycles } from '../state/store';

export function PracticeIntro() {
  const [seen, setSeen] = useState<boolean>(() => {
    try { return localStorage.getItem('practice-478-seen') === '1'; } catch { return false; }
  });
  const [cycles, setCycles] = useState(8);
  const [showLearn, setShowLearn] = useState(false);
  const [, setStoredCycles] = usePracticeCycles();

  if (!seen) {
    return <PracticeLearn onContinue={() => {
      try { localStorage.setItem('practice-478-seen', '1'); } catch {}
      setSeen(true);
    }} />;
  }
  if (showLearn) {
    return <PracticeLearn onContinue={() => setShowLearn(false)} backLabel="Done" hideStartCopy />;
  }

  const totalSec = cycles * 19;
  const totalMin = Math.round(totalSec / 60);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `
        radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.35), transparent 50%),
        radial-gradient(1px 1px at 78% 14%, rgba(255,255,255,0.28), transparent 50%),
        radial-gradient(1px 1px at 32% 78%, rgba(255,255,255,0.25), transparent 50%),
        radial-gradient(1.2px 1.2px at 88% 64%, rgba(255,255,255,0.3), transparent 50%)`,
      }} />

      <TopPad />
      <HeaderBar title="Breathe to sleep" onBack={() => go('home')} />

      <div style={{ flex: 1, padding: '0 22px 24px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: W.weak, fontWeight: 500, marginBottom: 8 }}>4-7-8 breath</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2, color: W.ink }}>
              How long do you want<br/>to practice tonight?
            </div>
          </div>

          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 84, fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: W.ink }}>
              {mins}{secs > 0 && <span style={{ fontSize: 36, fontWeight: 300 }}>:{String(secs).padStart(2, '0')}</span>}
            </div>
            <div style={{ fontSize: 13, color: W.weak, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
              {cycles} cycles · about {totalMin === 0 ? '1 min' : `${totalMin} min`}
            </div>
          </div>

          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[4, 8, 12, 16].map((c) => {
              const active = c === cycles;
              return (
                <div key={c} onClick={() => setCycles(c)} style={{
                  padding: '14px 0', textAlign: 'center', cursor: 'pointer',
                  background: active ? W.ink : 'transparent',
                  color: active ? W.bg : W.ink,
                  border: `1px solid ${active ? W.ink : W.fill}`,
                  borderRadius: 14,
                  fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                  transition: 'all .12s',
                }}>
                  {c}
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, color: active ? 'rgba(14,14,17,0.65)' : W.weak }}>cycles</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div onClick={() => { setStoredCycles(cycles); go('practice-session'); }}
            style={{
              padding: '18px 0', textAlign: 'center',
              background: W.ink, color: W.bg, borderRadius: 999,
              fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em',
            }}>
            Start
          </div>
          <div onClick={() => setShowLearn(true)} style={{
            textAlign: 'center', fontSize: 13, color: W.weak,
            marginTop: 14, cursor: 'pointer',
          }}>
            How it works
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeLearn({ onContinue, backLabel = 'Got it', hideStartCopy = false }: {
  onContinue: () => void; backLabel?: string; hideStartCopy?: boolean;
}) {
  const steps = [
    { count: '4', label: 'Inhale', desc: 'through your nose, slow and full' },
    { count: '7', label: 'Hold', desc: 'gently, no strain' },
    { count: '8', label: 'Exhale', desc: 'through your mouth with a soft sigh' },
  ];

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `
        radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.35), transparent 50%),
        radial-gradient(1px 1px at 78% 14%, rgba(255,255,255,0.28), transparent 50%),
        radial-gradient(1px 1px at 32% 78%, rgba(255,255,255,0.25), transparent 50%),
        radial-gradient(1.2px 1.2px at 88% 64%, rgba(255,255,255,0.3), transparent 50%)`,
      }} />

      <TopPad />
      <HeaderBar title="Breathe to sleep" onBack={() => go('home')} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 24px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 13, color: W.weak, fontWeight: 500 }}>4-7-8 breath</div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 8 }}>
            A breath pattern that<br/>slows you down for sleep.
          </div>
          <div style={{ fontSize: 14, color: W.weak, marginTop: 12, lineHeight: 1.5 }}>
            Three counts, repeated. Your nervous system follows the rhythm and starts to wind down.
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 13, color: W.weak, fontWeight: 500, marginBottom: 12 }}>What you'll do</div>
          <div style={{ background: W.paper, border: `1px solid ${W.fill}`, borderRadius: 18, overflow: 'hidden' }}>
            {steps.map((s, i) => (
              <div key={s.label} style={{
                padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16,
                borderBottom: i < steps.length - 1 ? `1px solid ${W.fill}` : 'none',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 24,
                  border: `1.5px solid ${W.ink}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                }}>{s.count}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: W.weak, marginTop: 2, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
                <div style={{ fontSize: 11, color: W.veryweak }}>sec</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '0 4px' }}>
            <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: W.fill }}>
              <div style={{ width: `${(4 / 19) * 100}%`, background: W.ink }} />
              <div style={{ width: `${(7 / 19) * 100}%`, background: W.weak }} />
              <div style={{ width: `${(8 / 19) * 100}%`, background: W.veryweak }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: W.weak, marginTop: 6, fontVariantNumeric: 'tabular-nums',
            }}>
              <span>0s</span><span>One cycle = 19s</span><span>19s</span>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 22, padding: '14px 16px',
          border: `1px dashed ${W.fill}`, borderRadius: 14,
          fontSize: 13, color: W.weak, lineHeight: 1.5,
        }}>
          <span style={{ color: W.ink, fontWeight: 600 }}>Tip. </span>
          Get comfortable, lights low. Rest your tongue behind your front teeth. Don't strain — the count is a guide.
        </div>

        <div style={{ flex: 1, minHeight: 24 }} />

        <div onClick={onContinue} style={{
          marginTop: 18, padding: '18px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em',
        }}>{backLabel}</div>
        {!hideStartCopy && (
          <div style={{ textAlign: 'center', fontSize: 12, color: W.weak, marginTop: 10 }}>
            Next, you'll pick how long to practice.
          </div>
        )}
      </div>
    </div>
  );
}

export function PracticeSession() {
  const phases = [
    { name: 'Inhale', dur: 4, hint: 'through the nose' },
    { name: 'Hold', dur: 7, hint: 'gently' },
    { name: 'Exhale', dur: 8, hint: 'through the mouth' },
  ];
  const [targetCycles] = usePracticeCycles();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTick, setPhaseTick] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const phase = phases[phaseIdx];

  const [lead, setLead] = useState(3);
  useEffect(() => {
    if (started) return;
    if (lead <= 0) { setStarted(true); return; }
    const t = setTimeout(() => setLead((l) => l - 1), 800);
    return () => clearTimeout(t);
  }, [lead, started]);

  useEffect(() => {
    if (!started || paused) return;
    if (phaseTick >= phase.dur) {
      const nextPhase = (phaseIdx + 1) % phases.length;
      if (nextPhase === 0) {
        if (cycle >= targetCycles) {
          go('practice-complete');
          return;
        }
        setCycle((c) => c + 1);
      }
      setPhaseIdx(nextPhase);
      setPhaseTick(0);
      return;
    }
    const t = setTimeout(() => setPhaseTick((tick) => tick + 1), 1000);
    return () => clearTimeout(t);
  }, [phaseTick, paused, started, phaseIdx, phase.dur, phases.length, cycle, targetCycles]);

  const remainingInPhase = phase.dur - phaseTick;
  const baseSize = 260;
  const scale = phase.name === 'Inhale' ? 1 : phase.name === 'Hold' ? 1 : 0.55;
  const ringOpacity = phase.name === 'Hold' ? 0.55 : 1;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `
        radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1px 1px at 72% 24%, rgba(255,255,255,0.3), transparent 50%),
        radial-gradient(1px 1px at 38% 84%, rgba(255,255,255,0.28), transparent 50%),
        radial-gradient(1.2px 1.2px at 86% 72%, rgba(255,255,255,0.32), transparent 50%),
        radial-gradient(1px 1px at 24% 56%, rgba(255,255,255,0.22), transparent 50%)`,
      }} />

      <TopPad />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px' }}>
        <div onClick={() => go('practice-intro')} style={{ fontSize: 13, color: W.ink, opacity: 0.75, cursor: 'pointer' }}>End</div>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: W.weak }}>4-7-8 Breathing</div>
        <div style={{ fontSize: 13, color: W.weak, fontVariantNumeric: 'tabular-nums', minWidth: 38, textAlign: 'right' }}>
          {cycle}/{targetCycles}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: 160,
          border: `1px solid ${W.fill}`, opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: 180,
          border: `1px dashed ${W.veryweak}`, opacity: 0.5,
        }} />
        <div style={{
          width: baseSize, height: baseSize, borderRadius: baseSize / 2,
          border: `1.5px solid ${W.ink}`,
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 60%, transparent 75%)',
          transform: `scale(${started && !paused ? scale : 0.7})`,
          transition: started && !paused
            ? `transform ${phase.dur}s ${phase.name === 'Hold' ? 'linear' : 'cubic-bezier(.42,0,.58,1)'}`
            : 'transform .3s ease',
          opacity: ringOpacity,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {!started ? (
            <div style={{ fontSize: 88, fontWeight: 200, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {lead === 0 ? '·' : lead}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: W.weak, marginBottom: 6 }}>{phase.name}</div>
              <div style={{ fontSize: 88, fontWeight: 200, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>
                {remainingInPhase}
              </div>
              <div style={{ fontSize: 11, color: W.weak, marginTop: 8 }}>{phase.hint}</div>
            </>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', padding: '0 28px 4px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {phases.map((p, i) => {
            const isCurrent = i === phaseIdx && started;
            const isDone = i < phaseIdx;
            const fill = !started ? 0 : isDone ? 1 : isCurrent ? Math.min(phaseTick / p.dur, 1) : 0;
            return (
              <div key={p.name} style={{ flex: p.dur }}>
                <div style={{ height: 3, background: W.fill, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${fill * 100}%`, height: '100%', background: W.ink,
                    transition: isCurrent ? 'width 1s linear' : 'width .2s',
                  }} />
                </div>
                <div style={{
                  fontSize: 10, color: isCurrent ? W.ink : W.weak,
                  marginTop: 6, textAlign: 'center', letterSpacing: '0.06em',
                  textTransform: 'uppercase', fontWeight: isCurrent ? 600 : 400,
                }}>
                  {p.name} · {p.dur}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        position: 'relative', display: 'flex', justifyContent: 'center',
        gap: 6, padding: '14px 20px 6px', flexWrap: 'wrap',
      }}>
        {Array.from({ length: targetCycles }).map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3,
            background: i < cycle - 1 ? W.ink : (i === cycle - 1 ? W.weak : W.fill),
          }} />
        ))}
      </div>

      <div style={{
        position: 'relative', padding: '14px 20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <div onClick={() => setPaused((p) => !p)} style={{
          flex: 1, padding: '14px 0', textAlign: 'center', borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: `1px solid ${W.fill}`,
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>{paused ? 'Resume' : 'Pause'}</div>
        <div onClick={() => go('practice-complete')} style={{
          flex: 1, padding: '14px 0', textAlign: 'center', borderRadius: 999,
          background: W.ink, color: W.bg,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Finish</div>
      </div>
    </div>
  );
}

export function PracticeComplete() {
  const [feeling, setFeeling] = useState<string | null>(null);
  const [saveToJournal, setSaveToJournal] = useState(true);
  const [cycles] = usePracticeCycles();
  const seconds = cycles * 19;
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `
        radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.32), transparent 50%),
        radial-gradient(1px 1px at 78% 14%, rgba(255,255,255,0.26), transparent 50%),
        radial-gradient(1px 1px at 32% 78%, rgba(255,255,255,0.22), transparent 50%),
        radial-gradient(1.2px 1.2px at 88% 64%, rgba(255,255,255,0.28), transparent 50%)`,
      }} />

      <TopPad />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 24px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div style={{ paddingTop: 14, textAlign: 'center' }}>
          <div style={{
            margin: '0 auto', width: 120, height: 120, borderRadius: 60,
            border: `1.5px solid ${W.ink}`,
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), transparent 65%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: -14, borderRadius: 70, border: `1px dashed ${W.veryweak}` }} />
            <CheckIcon size={36} stroke={W.ink} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: W.weak, marginTop: 22 }}>Session complete</div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 8 }}>
            Nice. Carry that breath into bed.
          </div>
        </div>

        <div style={{
          marginTop: 26, background: W.paper, border: `1px solid ${W.fill}`,
          borderRadius: 18, padding: '18px 6px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {[
            { v: cycles, l: 'cycles' },
            { v: `${mm}:${ss}`, l: 'minutes' },
            { v: cycles * 3, l: 'breaths' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center',
              borderLeft: i > 0 ? `1px solid ${W.fill}` : 'none',
            }}>
              <div style={{
                fontSize: 28, fontWeight: 300, fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>{s.v}</div>
              <div style={{
                fontSize: 11, color: W.weak, marginTop: 6,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: W.weak, marginBottom: 12,
          }}>How do you feel now?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'calmer', label: 'Calmer' },
              { id: 'same', label: 'About the same' },
              { id: 'restless', label: 'Still restless' },
            ].map((opt) => {
              const active = feeling === opt.id;
              return (
                <div key={opt.id} onClick={() => setFeeling(opt.id)} style={{
                  padding: '14px 6px', textAlign: 'center', cursor: 'pointer',
                  background: active ? W.ink : W.paper,
                  color: active ? W.bg : W.ink,
                  border: `1px solid ${active ? W.ink : W.fill}`,
                  borderRadius: 12,
                  fontSize: 12, fontWeight: 600, lineHeight: 1.2,
                }}>{opt.label}</div>
              );
            })}
          </div>
        </div>

        <div onClick={() => setSaveToJournal((s) => !s)} style={{
          marginTop: 18, background: W.paper, border: `1px solid ${W.fill}`,
          borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Save to journal</div>
            <div style={{ fontSize: 12, color: W.weak, marginTop: 2, lineHeight: 1.4 }}>
              Add this session to today's entry.
            </div>
          </div>
          <div style={{
            width: 44, height: 26, borderRadius: 13,
            background: saveToJournal ? W.ink : W.fillDark,
            position: 'relative', transition: 'background 0.15s',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: saveToJournal ? 21 : 3,
              width: 20, height: 20, borderRadius: 10, background: W.paper,
              transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 16 }} />

        <div onClick={() => go('home')} style={{
          marginTop: 22, padding: '18px 0', textAlign: 'center',
          background: W.ink, color: W.bg, borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Done</div>
        <div onClick={() => go('practice-session')} style={{
          marginTop: 10, padding: '14px 0', textAlign: 'center',
          fontSize: 13, color: W.weak, cursor: 'pointer',
        }}>One more round</div>
      </div>
    </div>
  );
}
