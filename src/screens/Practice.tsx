import { useEffect, useRef, useState } from 'react';
import { W } from '../tokens';
import { back, replace } from '../state/navigation';
import { TopPad, HeaderBar } from '../components/shared';
import { CheckIcon, HabitGlyph } from '../components/icons';
import { CosmicBackdrop, CosmicMedallion, COSMIC, hexA } from '../components/cosmic';
import { usePracticeCycles, usePracticeDone, useBreathSessions, type BreathFeeling } from '../state/store';
import { startTracking, consumeBreathThenTrack } from '../state/tracking';
import { TODAY_DATE } from '../data/days';

// Breathing practice, in the cosmic-blue language: starfield backdrops
// and glowing medallions instead of the old black-and-white wireframe.
const BLUE = COSMIC.blue.accent;
const BLUE_LIGHT = COSMIC.blue.light;

const screenStyle: React.CSSProperties = {
  height: '100%', display: 'flex', flexDirection: 'column',
  background: W.bg, color: W.ink, fontFamily: W.font,
  position: 'relative', overflow: 'hidden',
};

const primaryPill: React.CSSProperties = {
  padding: '18px 0', textAlign: 'center',
  background: '#fff', color: '#000', borderRadius: 999,
  fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em',
  boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
};

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
    <div style={screenStyle}>
      <CosmicBackdrop hue="blue" />
      <TopPad />
      <HeaderBar title="Breathing practice" onBack={() => back()} />

      <div style={{ flex: 1, padding: '0 22px 24px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: BLUE, fontWeight: 600, letterSpacing: 0.3, marginBottom: 8 }}>4-7-8 breath</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2, color: W.ink }}>
              How long tonight?
            </div>
          </div>

          <div style={{ position: 'relative', padding: '4px 0' }}>
            <div style={{
              position: 'absolute', inset: '-30px -40px', borderRadius: '50%',
              background: `radial-gradient(circle at 50% 50%, ${hexA(BLUE, 0.22)}, ${hexA(BLUE, 0)} 70%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', fontSize: 84, fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: W.ink }}>
              {mins}{secs > 0 && <span style={{ fontSize: 36, fontWeight: 300 }}>:{String(secs).padStart(2, '0')}</span>}
            </div>
            <div style={{ position: 'relative', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
              {cycles} cycles · about {totalMin === 0 ? '1 min' : `${totalMin} min`}
            </div>
          </div>

          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[4, 8, 12, 16].map((c) => {
              const active = c === cycles;
              return (
                <div key={c} onClick={() => setCycles(c)} style={{
                  padding: '14px 0', textAlign: 'center', cursor: 'pointer',
                  background: active ? BLUE : 'rgba(255,255,255,0.04)',
                  color: active ? '#04122B' : W.ink,
                  border: `1px solid ${active ? BLUE : hexA(BLUE, 0.18)}`,
                  borderRadius: 14,
                  fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                  boxShadow: active ? `0 8px 22px ${hexA(BLUE, 0.3)}` : 'none',
                  transition: 'all .12s',
                }}>
                  {c}
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, color: active ? 'rgba(4,18,43,0.7)' : 'rgba(255,255,255,0.5)' }}>cycles</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div onClick={() => { setStoredCycles(cycles); replace('practice-session'); }} style={primaryPill}>
            Start
          </div>
          <div onClick={() => setShowLearn(true)} style={{
            textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.55)',
            marginTop: 14, cursor: 'pointer',
          }}>
            How it works
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact explainer — far less text than before. A blue breathing
// medallion, the 4-7-8 rhythm as three chips, one line of why.
function PracticeLearn({ onContinue, backLabel = 'Got it', hideStartCopy = false }: {
  onContinue: () => void; backLabel?: string; hideStartCopy?: boolean;
}) {
  const steps = [
    { count: '4', label: 'Inhale' },
    { count: '7', label: 'Hold' },
    { count: '8', label: 'Exhale' },
  ];

  return (
    <div style={screenStyle}>
      <CosmicBackdrop hue="blue" />
      <TopPad />
      <HeaderBar title="Breathing practice" onBack={() => back()} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 22px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 28 }}>
          <CosmicMedallion hue="blue" core={120}>
            <HabitGlyph name="breath" size={46} stroke={BLUE_LIGHT} />
          </CosmicMedallion>

          <div>
            <div style={{ fontSize: 13, color: BLUE, fontWeight: 600, letterSpacing: 0.3 }}>4-7-8 breath</div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 8 }}>
              A breath that<br />slows you down.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320 }}>
            {steps.map((s) => (
              <div key={s.label} style={{
                flex: 1, padding: '16px 0', borderRadius: 16,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${hexA(BLUE, 0.25)}`,
              }}>
                <div style={{ fontSize: 30, fontWeight: 300, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, maxWidth: 290 }}>
            Inhale, hold, exhale. Your body follows the rhythm and starts to wind down.
          </div>
        </div>

        <div onClick={onContinue} style={primaryPill}>{backLabel}</div>
        {!hideStartCopy && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
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
          replace('practice-complete');
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
    <div style={screenStyle}>
      <CosmicBackdrop hue="blue" />
      <TopPad />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px' }}>
        <div onClick={() => back()} style={{ fontSize: 13, color: W.ink, opacity: 0.75, cursor: 'pointer' }}>End</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: BLUE }}>4-7-8 Breathing</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums', minWidth: 38, textAlign: 'right' }}>
          {cycle}/{targetCycles}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: 160,
          border: `1px solid ${hexA(BLUE, 0.28)}`, opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: 180,
          border: `1px dashed ${hexA(BLUE, 0.22)}`, opacity: 0.6,
        }} />
        <div style={{
          width: baseSize, height: baseSize, borderRadius: baseSize / 2,
          border: `1.5px solid ${hexA(BLUE, 0.7)}`,
          background: `radial-gradient(circle at 38% 30%, ${hexA(BLUE, 0.42)}, ${hexA(BLUE, 0.12)} 55%, transparent 75%)`,
          boxShadow: `0 0 60px ${hexA(BLUE, 0.28)}, inset 0 0 50px ${hexA(BLUE, 0.18)}`,
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
              <div style={{ fontSize: 13, fontWeight: 500, color: BLUE_LIGHT, marginBottom: 6 }}>{phase.name}</div>
              <div style={{ fontSize: 88, fontWeight: 200, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>
                {remainingInPhase}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>{phase.hint}</div>
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
                <div style={{ height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${fill * 100}%`, height: '100%', background: BLUE,
                    transition: isCurrent ? 'width 1s linear' : 'width .2s',
                  }} />
                </div>
                <div style={{
                  fontSize: 11, color: isCurrent ? BLUE_LIGHT : 'rgba(255,255,255,0.55)',
                  marginTop: 6, textAlign: 'center',
                  fontWeight: isCurrent ? 600 : 500,
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
            background: i < cycle - 1 ? BLUE : (i === cycle - 1 ? hexA(BLUE, 0.6) : 'rgba(255,255,255,0.14)'),
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
          border: `1px solid ${hexA(BLUE, 0.2)}`,
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>{paused ? 'Resume' : 'Pause'}</div>
        <div onClick={() => replace('practice-complete')} style={{
          flex: 1, padding: '14px 0', textAlign: 'center', borderRadius: 999,
          background: '#fff', color: '#000',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Finish</div>
      </div>
    </div>
  );
}

export function PracticeComplete() {
  const [feeling, setFeeling] = useState<BreathFeeling | null>(null);
  const [saveToJournal, setSaveToJournal] = useState(true);
  const [cycles] = usePracticeCycles();
  const [, setPracticeDone] = usePracticeDone();
  const { add: addBreathSession } = useBreathSessions();
  const savedRef = useRef(false);
  const seconds = cycles * 19;
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');

  useEffect(() => {
    setPracticeDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (saveToJournal && !savedRef.current) {
      const now = new Date();
      addBreathSession({
        date: TODAY_DATE,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        cycles, durationSec: seconds, breaths: cycles * 3,
        feeling,
      });
      savedRef.current = true;
    }
    if (consumeBreathThenTrack()) startTracking();
    else back();
  }

  return (
    <div style={screenStyle}>
      <CosmicBackdrop hue="blue" />
      <TopPad />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 24px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <CosmicMedallion hue="blue" core={104}>
            <CheckIcon size={38} stroke={BLUE_LIGHT} strokeWidth={2.2} />
          </CosmicMedallion>
          <div style={{ fontSize: 12, fontWeight: 600, color: BLUE, marginTop: 20, letterSpacing: 0.3 }}>Session complete</div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 8 }}>
            Nice. Carry that breath into bed.
          </div>
        </div>

        <div style={{
          marginTop: 26, background: 'rgba(255,255,255,0.04)', border: `1px solid ${hexA(BLUE, 0.2)}`,
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
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{
                fontSize: 28, fontWeight: 300, fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em', lineHeight: 1, color: '#fff',
              }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>How do you feel now?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {([
              { id: 'calmer', label: 'Calmer' },
              { id: 'same', label: 'About the same' },
              { id: 'restless', label: 'Still restless' },
            ] as { id: BreathFeeling; label: string }[]).map((opt) => {
              const active = feeling === opt.id;
              return (
                <div key={opt.id} onClick={() => setFeeling(opt.id)} style={{
                  padding: '14px 6px', textAlign: 'center', cursor: 'pointer',
                  background: active ? BLUE : 'rgba(255,255,255,0.04)',
                  color: active ? '#04122B' : W.ink,
                  border: `1px solid ${active ? BLUE : hexA(BLUE, 0.18)}`,
                  borderRadius: 12,
                  fontSize: 12, fontWeight: 600, lineHeight: 1.2,
                }}>{opt.label}</div>
              );
            })}
          </div>
        </div>

        <div onClick={() => setSaveToJournal((s) => !s)} style={{
          marginTop: 18, background: 'rgba(255,255,255,0.04)', border: `1px solid ${hexA(BLUE, 0.18)}`,
          borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Save to journal</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2, lineHeight: 1.4 }}>
              Add this session to today's entry.
            </div>
          </div>
          <div style={{
            width: 44, height: 26, borderRadius: 13,
            background: saveToJournal ? BLUE : 'rgba(255,255,255,0.16)',
            position: 'relative', transition: 'background 0.15s',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: saveToJournal ? 21 : 3,
              width: 20, height: 20, borderRadius: 10, background: '#fff',
              transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 16 }} />

        <div onClick={finish} style={{ ...primaryPill, marginTop: 22 }}>Done</div>
        <div onClick={() => replace('practice-session')} style={{
          marginTop: 10, padding: '14px 0', textAlign: 'center',
          fontSize: 13, color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
        }}>One more round</div>
      </div>
    </div>
  );
}
