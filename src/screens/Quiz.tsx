import type { ReactNode } from 'react';
import { W } from '../tokens';
import { back, go, goHome, replace } from '../state/navigation';
import { TopPad } from '../components/shared';
import { CheckIcon, GlyphChevDn } from '../components/icons';
import { lookupQuiz, resultBand, type Quiz } from '../data/quizzes';
import { useQuizSession } from '../state/store';

// ─── Intro ────────────────────────────────────────────────────────
export function QuizIntro() {
  const { session, start } = useQuizSession();
  const quiz = session ? lookupQuiz(session.quizId) : null;
  if (!quiz) return <Fallback />;

  function startQuiz() {
    start(quiz!.id);
    replace('quiz-session');
  }

  const Icon = quiz.icon;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <TopPad />

      <div style={{
        position: 'relative', padding: '4px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
      }}>
        <div onClick={() => back()} style={{
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: W.ink,
        }}>
          <CrossIcon />
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '4px 20px 130px',
      }}>
        <Hero quiz={quiz} />

        <div style={{
          marginTop: 22, fontSize: 24, fontWeight: 700,
          letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>{quiz.title}</div>
        <div style={{
          marginTop: 6, fontSize: 14, color: W.weak, lineHeight: 1.5,
        }}>{quiz.blurb}</div>

        <div style={{
          marginTop: 18, fontSize: 14, color: W.weak, lineHeight: 1.6,
        }}>{quiz.hero}</div>

        <div style={{
          marginTop: 22, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px',
          background: W.paper, border: `1px solid ${W.fill}`,
          borderRadius: 14, fontSize: 13, color: W.weak,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: hexA(quiz.accent, 0.14),
            border: `1px solid ${hexA(quiz.accent, 0.32)}`,
            color: quiz.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: W.ink }}>{quiz.meta}</div>
            <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>
              Private. Answers stay on this device.
            </div>
          </div>
        </div>
      </div>

      <StickyFooter accent={quiz.accent}>
        <div onClick={startQuiz} style={pillStyle(quiz.accent)}>Start test</div>
      </StickyFooter>
    </div>
  );
}

function Hero({ quiz }: { quiz: Quiz }) {
  const Icon = quiz.icon;
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 22, height: 200, marginTop: 4,
      background: `
        radial-gradient(120% 100% at 70% 0%, ${hexA(quiz.accent, 0.35)} 0%, ${hexA(quiz.accent, 0)} 65%),
        linear-gradient(180deg, ${hexA(quiz.accent, 0.10)} 0%, ${W.paper} 100%)`,
      border: `1px solid ${hexA(quiz.accent, 0.24)}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <BackdropDots accent={quiz.accent} />
      <div style={{
        position: 'relative',
        width: 92, height: 92, borderRadius: 24,
        background: `linear-gradient(135deg, ${hexA(quiz.accent, 0.28)}, ${hexA(quiz.accent, 0.10)})`,
        border: `1px solid ${hexA(quiz.accent, 0.45)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: quiz.accent,
        boxShadow: `0 12px 30px ${hexA(quiz.accent, 0.18)}`,
      }}>
        <Icon size={42} />
      </div>
    </div>
  );
}

// ─── Session ──────────────────────────────────────────────────────
export function QuizSession() {
  const { session, setAnswer, setStep, clear } = useQuizSession();
  const quiz = session ? lookupQuiz(session.quizId) : null;
  if (!session || !quiz) return <Fallback />;

  const step = session.step;
  const q = quiz.questions[step];
  const answer = session.answers[step];
  const total = quiz.questions.length;
  const Icon = quiz.icon;

  function pickOption(value: number) {
    setAnswer(step, value);
  }

  function next() {
    if (answer === undefined) return;
    if (step + 1 >= total) replace('quiz-result');
    else setStep(step + 1);
  }

  function prev() {
    if (step === 0) { clear(); back(); return; }
    setStep(step - 1);
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <TopPad />

      <div style={{
        position: 'relative', padding: '4px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div onClick={prev} style={{
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: W.ink,
        }}>
          <ChevLeft />
        </div>
        <ProgressDots total={total} step={step} accent={quiz.accent} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 140px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 0 18px',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: hexA(quiz.accent, 0.14),
            border: `1px solid ${hexA(quiz.accent, 0.32)}`,
            color: quiz.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{quiz.title}</div>
            <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>
              {step + 1} of {total}
            </div>
          </div>
        </div>

        <div style={{
          fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em',
          lineHeight: 1.25,
        }}>{q.prompt}</div>

        <div style={{
          marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {q.options.map((opt) => {
            const on = answer === opt.value;
            return (
              <div key={opt.label} onClick={() => pickOption(opt.value)} style={{
                padding: '15px 16px',
                background: on ? hexA(quiz.accent, 0.08) : W.paper,
                border: `1px solid ${on ? hexA(quiz.accent, 0.55) : W.fill}`,
                borderRadius: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'background .12s ease, border-color .12s ease',
              }}>
                <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500 }}>
                  {opt.label}
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: 11,
                  background: on ? quiz.accent : 'transparent',
                  border: `1.5px solid ${on ? quiz.accent : W.veryweak}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background .12s ease, border-color .12s ease',
                }}>
                  {on && <CheckIcon size={12} stroke={W.bg} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <StickyFooter accent={quiz.accent}>
        <div onClick={next}
          style={pillStyle(quiz.accent, answer === undefined ? 'disabled' : 'enabled')}>
          {step + 1 >= total ? 'See results' : 'Continue'}
        </div>
      </StickyFooter>
    </div>
  );
}

// ─── Result ───────────────────────────────────────────────────────
export function QuizResult() {
  const { session, start, clear } = useQuizSession();
  const quiz = session ? lookupQuiz(session.quizId) : null;
  if (!session || !quiz) return <Fallback />;

  const score = session.answers.reduce((s, v) => s + (v ?? 0), 0);
  const band = resultBand(quiz, score);
  const Icon = quiz.icon;

  function done() { clear(); goHome(); }
  function retake() {
    start(quiz!.id);
    replace('quiz-session');
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: W.bg, color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <TopPad />

      <div style={{
        position: 'relative', padding: '4px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={() => back()} style={{
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: W.ink,
        }}>
          <ChevLeft />
        </div>
        <div onClick={done} style={{
          padding: '8px 18px', borderRadius: 999,
          background: W.ink, color: W.bg,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Done</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 140px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 0 18px',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: hexA(quiz.accent, 0.14),
            border: `1px solid ${hexA(quiz.accent, 0.32)}`,
            color: quiz.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{quiz.title}</div>
        </div>

        <div style={{
          fontSize: 13, color: W.weak, fontWeight: 500,
        }}>Your score</div>
        <div style={{
          marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          <span style={{
            fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em',
            color: W.ink, fontVariantNumeric: 'tabular-nums',
          }}>{score}</span>
          <span style={{
            fontSize: 16, color: W.weak,
            fontVariantNumeric: 'tabular-nums',
          }}>/ {quiz.maxScore} points</span>
        </div>

        <ScoreBars score={score} max={quiz.maxScore} accent={quiz.accent} />

        <div style={{
          marginTop: 22, padding: '18px 18px',
          background: hexA(quiz.accent, 0.06),
          border: `1px solid ${hexA(quiz.accent, 0.28)}`,
          borderRadius: 16,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: quiz.accent,
            fontVariantNumeric: 'tabular-nums',
          }}>{band.min}–{band.max} points</div>
          <div style={{
            fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em',
            marginTop: 4, lineHeight: 1.3,
          }}>{band.title}</div>
          <div style={{
            fontSize: 14, color: W.weak, marginTop: 8, lineHeight: 1.55,
          }}>{band.desc}</div>
        </div>

        <div style={{
          marginTop: 22, fontSize: 13, fontWeight: 600, color: W.weak,
          padding: '0 2px 10px',
        }}>Some ideas you might explore</div>
        <div style={{
          background: W.paper, border: `1px solid ${W.fill}`,
          borderRadius: 16, overflow: 'hidden',
        }}>
          {band.ideas.map((idea, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 16px',
              borderTop: i === 0 ? 'none' : `1px solid ${W.fill}`,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                background: hexA(quiz.accent, 0.14),
                border: `1px solid ${hexA(quiz.accent, 0.40)}`,
                color: quiz.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1, fontSize: 14, color: W.ink, lineHeight: 1.5 }}>{idea}</div>
            </div>
          ))}
        </div>
      </div>

      <StickyFooter accent={quiz.accent}>
        <div onClick={retake} style={pillStyle(quiz.accent, 'outline')}>Retake</div>
      </StickyFooter>
    </div>
  );
}

// ─── Building blocks ──────────────────────────────────────────────
function ProgressDots({ total, step, accent }: {
  total: number; step: number; accent: string;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i <= step;
        return (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: filled ? accent : W.fill,
            transition: 'background .2s ease',
          }} />
        );
      })}
    </div>
  );
}

function ScoreBars({ score, max, accent }: {
  score: number; max: number; accent: string;
}) {
  // Resolution: one bar per point so the visualization scales with maxScore.
  const bars = Array.from({ length: max }, (_, i) => i < score);
  return (
    <div style={{
      marginTop: 14,
      display: 'flex', alignItems: 'flex-end', gap: 4, height: 56,
    }}>
      {bars.map((on, i) => {
        const h = 18 + (i / Math.max(max - 1, 1)) * 32;
        return (
          <div key={i} style={{
            flex: 1, height: h,
            borderRadius: 2,
            background: on ? accent : W.fill,
            opacity: on ? 1 : 0.7,
            transition: 'background .12s ease',
          }} />
        );
      })}
    </div>
  );
}

function StickyFooter({ children }: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '12px 20px 22px',
      background: 'linear-gradient(180deg, rgba(14,14,17,0) 0%, rgba(14,14,17,0.85) 30%, #0E0E11 100%)',
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

function pillStyle(accent: string, mode: 'enabled' | 'disabled' | 'outline' = 'enabled'): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '16px 0', textAlign: 'center',
    borderRadius: 999,
    fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
    cursor: 'pointer',
  };
  if (mode === 'disabled') {
    return {
      ...base,
      background: W.fill, color: W.weak, cursor: 'default',
    };
  }
  if (mode === 'outline') {
    return {
      ...base,
      background: 'transparent',
      border: `1px solid ${hexA(accent, 0.55)}`,
      color: accent,
    };
  }
  return {
    ...base,
    background: `linear-gradient(135deg, ${accent}, ${darken(accent, 0.2)})`,
    color: W.bg,
    boxShadow: `0 14px 32px ${hexA(accent, 0.32)}, 0 0 0 1px rgba(255,255,255,0.06) inset`,
  };
}

function BackdropDots({ accent }: { accent: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.7 }} aria-hidden>
      {[
        { x: 12, y: 22 }, { x: 78, y: 16 }, { x: 30, y: 78 },
        { x: 86, y: 64 }, { x: 56, y: 32 },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: 3, height: 3, borderRadius: 2,
          background: hexA(accent, 0.55),
          boxShadow: `0 0 6px ${hexA(accent, 0.5)}`,
        }} />
      ))}
    </div>
  );
}

function Fallback() {
  return (
    <div style={{
      height: '100%', background: W.bg, color: W.ink, fontFamily: W.font,
      display: 'flex', flexDirection: 'column',
    }}>
      <TopPad />
      <div style={{ padding: '4px 16px' }}>
        <div onClick={() => go('home')} style={{
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <GlyphChevDn size={18} stroke={W.ink} />
        </div>
      </div>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: W.weak, fontSize: 14,
      }}>No quiz selected.</div>
    </div>
  );
}

// ─── Small inline glyphs (kept here so Quiz screens stay self-contained) ─
function ChevLeft() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function CrossIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}

// ─── helpers ──────────────────────────────────────────────────────
function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function darken(hex: string, amt: number) {
  const c = hex.replace('#', '');
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - Math.round(255 * amt));
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - Math.round(255 * amt));
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - Math.round(255 * amt));
  return `rgb(${r}, ${g}, ${b})`;
}
